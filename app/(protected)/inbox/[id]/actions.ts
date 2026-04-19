"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildAppointmentLinkEmail } from "@/lib/mail/appointment-link-email";
import { buildAppointmentLinkPractitionerNoticeEmail } from "@/lib/mail/appointment-link-notice-email";
import { isSmtpConfigured } from "@/lib/env";
import { getCurrentWorkspace } from "@/lib/auth-helpers";

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

  const { error } = await supabase.from("tasks").insert({
    workspace_id: workspace.workspace_id,
    submission_id: submissionId,
    content: content.trim(),
    recipient_type: recipientType,
    created_by: user.id,
  });

  if (error) {
    console.error("[createTask]", error);
    return { error: error.message };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTaskDone(taskId: string, submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const { data: task } = await supabase
    .from("tasks")
    .select("done_at")
    .eq("id", taskId)
    .single();

  if (!task) return { error: "Task nicht gefunden" };

  const newValue = task.done_at
    ? { done_at: null, done_by: null }
    : { done_at: new Date().toISOString(), done_by: user.id };

  const { error } = await supabase
    .from("tasks")
    .update(newValue)
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function sendAppointmentLink(submissionId: string) {
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
