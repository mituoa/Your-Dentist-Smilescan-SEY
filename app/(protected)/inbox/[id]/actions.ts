"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildAppointmentLinkEmail } from "@/lib/mail/appointment-link-email";
import { buildAppointmentLinkPractitionerNoticeEmail } from "@/lib/mail/appointment-link-notice-email";
import { isSmtpConfigured } from "@/lib/env";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { submitTaskForReview } from "@/app/(protected)/my-tasks/actions";
import JSZip from "jszip";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;

function formatSubmissionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "unknown-date";
  }
  return date.toISOString().slice(0, 10);
}

function transliterateGerman(input: string): string {
  return input
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function sanitizeNamePart(input: string): string {
  return transliterateGerman(input)
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toPatientSlug(patientName: string | null): string {
  const safe = sanitizeNamePart(patientName || "");
  if (!safe) return "Unbekannt-Patient";
  const parts = safe.split("-").filter(Boolean);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastName = parts.slice(1).join("-");
  return `${lastName}-${firstName}`;
}

function fileExtensionFromPath(path: string): string {
  const segment = path.split("/").pop() || "";
  const dotIndex = segment.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === segment.length - 1) return "jpg";
  return segment.slice(dotIndex + 1).toLowerCase();
}

function toBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

export async function markSubmissionSeen(submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("submissions")
    .update({
      seen_at: new Date().toISOString(),
      seen_by: user.id,
    })
    .eq("id", submissionId)
    .is("seen_at", null);

  if (error) {
    console.error("[markSubmissionSeen]", error);
    return { error: error.message };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  return { success: true };
}

export async function createTask(formData: FormData) {
  const submissionId = formData.get("submission_id") as string;
  const content = formData.get("content") as string;
  const recipientType = formData.get("recipient_type") as
    | "doctor_only"
    | "all_team";

  if (!submissionId || !content?.trim()) {
    return { error: "Bitte Aufgabentext eingeben." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Kein Workspace" };

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspace.workspace_id,
      submission_id: submissionId,
      content: content.trim(),
      recipient_type: recipientType,
      created_by: user.id,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createTask]", error);
    return { error: error.message };
  }

  const newTaskId = inserted?.id as string;

  try {
    const { buildTaskAssigned } = await import("@/lib/mail/task-notifications");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { getAppBaseUrl } = await import("@/lib/env");

    const admin = createAdminClient();
    const recipientEmails: string[] = [];

    if (recipientType === "all_team") {
      const { data: members } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspace.workspace_id)
        .neq("user_id", user.id);
      for (const m of members || []) {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        if (data?.user?.email) recipientEmails.push(data.user.email);
      }
    } else if (recipientType === "doctor_only") {
      const { data: doctors } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspace.workspace_id)
        .eq("role", "doctor")
        .neq("user_id", user.id);
      for (const m of doctors || []) {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        if (data?.user?.email) recipientEmails.push(data.user.email);
      }
    }

    if (recipientEmails.length > 0) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${newTaskId}`;
      const mail = buildTaskAssigned({
        taskTitle: content.trim(),
        taskUrl,
        actorName: user.email || "Arzt",
        recipientEmail: recipientEmails[0] || "",
      });
      for (const to of recipientEmails) {
        await sendTransactionalMailBestEffort(
          { to, subject: mail.subject, text: mail.text, html: mail.html },
          "task_assigned"
        );
      }
    }
  } catch (err) {
    console.error("[createTask mail]", err);
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/my-tasks");
  return { success: true };
}

/** Inbox: meldet Erledigung (ersetzt früheres direktes Abhaken). */
export async function submitInboxTaskForReview(
  taskId: string,
  submissionId: string
) {
  const result = await submitTaskForReview(taskId);
  if (result.success) {
    revalidatePath(`/inbox/${submissionId}`);
  }
  return result;
}

export async function sendAppointmentLink(submissionId: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Kein Workspace" };
  }
  if (workspace.role !== "doctor") {
    return { error: "Nur Ärzte können Terminlinks versenden." };
  }

  if (!isSmtpConfigured()) {
    return {
      error:
        "E-Mail-Versand ist nicht konfiguriert. Bitte SMTP-Zugangsdaten in .env.local eintragen.",
      code: "SMTP_NOT_CONFIGURED",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const { data: submission } = await supabase
    .from("submissions")
    .select("patient_name, patient_email, workspace_id")
    .eq("id", submissionId)
    .single();

  if (!submission || !submission.patient_email) {
    return { error: "Patient hat keine E-Mail-Adresse." };
  }

  const { data: profile } = await supabase
    .from("profile_data")
    .select("practice_name, appointment_link")
    .eq("workspace_id", submission.workspace_id)
    .single();

  if (!profile?.appointment_link) {
    return {
      error:
        "Kein Terminlink hinterlegt. Bitte in Supabase appointment_link setzen (siehe Anleitung).",
    };
  }

  const practiceName = profile.practice_name || "Ihre Zahnarztpraxis";

  const fullName = submission.patient_name?.trim() || "";
  const parts = fullName.split(/\s+/);
  const patientFirstName =
    parts.length > 1 ? parts.slice(0, -1).join(" ") : fullName || null;
  const patientLastName = parts.length > 1 ? parts[parts.length - 1] : null;

  const mail = buildAppointmentLinkEmail({
    bookingUrl: profile.appointment_link,
    practiceName,
    patientFirstName,
    patientLastName,
  });

  const result = await sendTransactionalMailBestEffort(
    {
      to: submission.patient_email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      mailContext: "appointment_link_to_patient",
    },
    "appointment_link_to_patient"
  );

  if (!result.sent) {
    return {
      error: "E-Mail konnte nicht versendet werden. Details im Server-Log.",
    };
  }

  if (user.email) {
    const notice = buildAppointmentLinkPractitionerNoticeEmail({
      patientDisplayLabel: fullName || submission.patient_email,
    });
    await sendTransactionalMailBestEffort(
      {
        to: user.email,
        subject: notice.subject,
        text: notice.text,
        html: notice.html,
      },
      "appointment_link_notice_to_practitioner"
    );
  }

  revalidatePath(`/inbox/${submissionId}`);
  return { success: true, message: "Terminlink-E-Mail versendet." };
}

export async function downloadSubmissionPhotos(
  submissionId: string
): Promise<{ error?: string; zipBase64?: string; filename?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Kein Workspace" };
  }
  if (!["doctor", "team"].includes(workspace.role)) {
    return { error: "Keine Berechtigung für den Download." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nicht angemeldet" };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, workspace_id, patient_name, created_at")
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (submissionError || !submission) {
    console.error("[downloadSubmissionPhotos] submission lookup failed", submissionError);
    return { error: "Submission nicht gefunden." };
  }

  const { data: photos, error: photosError } = await supabase
    .from("submission_photos")
    .select("id, storage_path, sort_order")
    .eq("submission_id", submissionId)
    .order("sort_order", { ascending: true });

  if (photosError) {
    console.error("[downloadSubmissionPhotos] photo lookup failed", photosError);
    return { error: "Download nicht möglich, bitte erneut versuchen" };
  }

  if (!photos || photos.length === 0) {
    return { error: "Keine Fotos vorhanden." };
  }

  const datePart = formatSubmissionDate(submission.created_at);
  const patientPart = toPatientSlug(submission.patient_name);
  const zipFilename = `${datePart}_${patientPart}.zip`;
  const zip = new JSZip();
  const admin = createAdminClient();

  let cumulativeBytes = 0;

  for (const [index, photo] of photos.entries()) {
    const { data, error } = await admin.storage
      .from("submission-photos")
      .download(photo.storage_path);

    if (error || !data) {
      console.error("[downloadSubmissionPhotos] storage download failed", {
        storagePath: photo.storage_path,
        error,
      });
      return { error: "Download nicht möglich, bitte erneut versuchen" };
    }

    const arrayBuffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    cumulativeBytes += uint8.byteLength;
    if (cumulativeBytes > MAX_ZIP_BYTES) {
      return { error: "Zu groß, bitte Admin kontaktieren" };
    }

    const fileIndex = String(index + 1).padStart(2, "0");
    const ext = fileExtensionFromPath(photo.storage_path);
    const zipEntryName = `${datePart}_${patientPart}_${fileIndex}.${ext}`;
    zip.file(zipEntryName, uint8);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  if (zipBuffer.byteLength > MAX_ZIP_BYTES) {
    return { error: "Zu groß, bitte Admin kontaktieren" };
  }

  return {
    filename: zipFilename,
    zipBase64: toBase64(zipBuffer),
  };
}
