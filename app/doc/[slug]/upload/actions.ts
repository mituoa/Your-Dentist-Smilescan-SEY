"use server";

import { createAdminClient } from "@/lib/supabase/admin";
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
  const storagePathsJson = formData.get("storage_paths") as string | null;

  if (!slug || !patientName || !patientEmail) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }

  if (!storagePathsJson?.trim()) {
    return { error: "Mindestens ein Foto erforderlich." };
  }

  let storagePaths: string[] = [];
  try {
    storagePaths = JSON.parse(storagePathsJson);
  } catch {
    return { error: "Fehler beim Verarbeiten der Fotos." };
  }

  if (!Array.isArray(storagePaths) || storagePaths.length === 0) {
    return { error: "Mindestens ein Foto erforderlich." };
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

  const finalPaths: string[] = [];
  for (let i = 0; i < storagePaths.length; i++) {
    const tempPath = storagePaths[i];
    const fileName = tempPath.split("/").pop() || `photo-${i}.jpg`;
    const finalPath = `${workspace.id}/${submissionId}/${fileName}`;

    const { error: moveError } = await admin.storage
      .from("submission-photos")
      .move(tempPath, finalPath);

    if (moveError) {
      console.error(`[upload] move failed for ${tempPath}:`, moveError);
      continue;
    }
    const sortOrder = finalPaths.length;
    finalPaths.push(finalPath);

    await admin.from("submission_photos").insert({
      submission_id: submissionId,
      storage_path: finalPath,
      sort_order: sortOrder,
    });
  }

  if (finalPaths.length === 0) {
    await admin.from("submissions").delete().eq("id", submissionId);
    return { error: "Fotos konnten nicht gespeichert werden." };
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
