"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { validatePhotoCollection } from "@/lib/upload/validation";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildUploadConfirmationEmail } from "@/lib/mail/upload-confirmation-patient-email";
import { buildNewSubmissionPractitionerEmail } from "@/lib/mail/new-submission-practitioner-email";
import { getAppBaseUrl } from "@/lib/env";

export async function submitUpload(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const slug = formData.get("slug") as string;
  const patientName = (formData.get("patient_name") as string)?.trim();
  const patientEmail = (formData.get("patient_email") as string)?.trim();
  const patientPhone =
    (formData.get("patient_phone") as string)?.trim() || null;
  const patientNotes =
    (formData.get("patient_notes") as string)?.trim() || null;
  const photoCount = parseInt(formData.get("photo_count") as string, 10);

  if (!slug || !patientName || !patientEmail) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }

  if (isNaN(photoCount) || photoCount < 1) {
    return { error: "Mindestens ein Foto erforderlich." };
  }

  const photos: File[] = [];
  for (let i = 0; i < photoCount; i++) {
    const photo = formData.get(`photo_${i}`) as File;
    if (photo && photo.size > 0) {
      photos.push(photo);
    }
  }

  const validation = validatePhotoCollection(photos);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const admin = createAdminClient();

  const { data: workspace, error: wsError } = await admin
    .from("workspaces")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (wsError || !workspace) {
    return { error: "Arzt-Profil nicht gefunden." };
  }

  const { data: profile } = await admin
    .from("profile_data")
    .select("practice_name, display_name")
    .eq("workspace_id", workspace.id)
    .single();

  const practiceName =
    profile?.practice_name || profile?.display_name || workspace.name;

  const { data: submission, error: subError } = await admin
    .from("submissions")
    .insert({
      workspace_id: workspace.id,
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: patientPhone,
      patient_notes: patientNotes,
    })
    .select("id")
    .single();

  if (subError || !submission) {
    console.error("[upload] submission insert failed:", subError);
    return { error: "Einsendung konnte nicht gespeichert werden." };
  }

  const submissionId = submission.id;

  const uploadedPaths: string[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${workspace.id}/${submissionId}/${Date.now()}-${i}.${ext}`;

    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from("submission-photos")
      .upload(storagePath, buffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(`[upload] photo ${i} upload failed:`, uploadError);
      await admin.from("submissions").delete().eq("id", submissionId);
      for (const path of uploadedPaths) {
        await admin.storage.from("submission-photos").remove([path]);
      }
      return { error: "Foto-Upload fehlgeschlagen. Bitte erneut versuchen." };
    }

    uploadedPaths.push(storagePath);

    const { error: rowError } = await admin.from("submission_photos").insert({
      submission_id: submissionId,
      storage_path: storagePath,
      sort_order: i,
    });

    if (rowError) {
      console.error(`[upload] submission_photos row failed:`, rowError);
      await admin.from("submissions").delete().eq("id", submissionId);
      for (const path of uploadedPaths) {
        await admin.storage.from("submission-photos").remove([path]);
      }
      return { error: "Einsendung konnte nicht gespeichert werden." };
    }
  }

  const fullName = patientName;
  const nameParts = fullName.split(/\s+/);
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;
  const lastName =
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;

  const patientMail = buildUploadConfirmationEmail({
    practiceName,
    patientFirstName: firstName,
    patientLastName: lastName,
  });

  await sendTransactionalMailBestEffort(
    {
      to: patientEmail,
      subject: patientMail.subject,
      text: patientMail.text,
      html: patientMail.html,
    },
    "upload_confirmation_to_patient"
  );

  const { data: members } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspace.id)
    .eq("role", "doctor");

  if (members && members.length > 0) {
    const { data: authData } = await admin.auth.admin.getUserById(
      members[0].user_id
    );

    if (authData?.user?.email) {
      const doctorMail = buildNewSubmissionPractitionerEmail({
        appBase: getAppBaseUrl(),
        patientDisplayLabel: fullName || patientEmail,
        submissionTimestamp: new Date(),
      });

      await sendTransactionalMailBestEffort(
        {
          to: authData.user.email,
          subject: doctorMail.subject,
          text: doctorMail.text,
          html: doctorMail.html,
        },
        "new_submission_to_practitioner"
      );
    }
  }

  return { success: true };
}
