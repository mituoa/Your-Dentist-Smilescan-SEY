"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildAppointmentLinkEmail } from "@/lib/mail/appointment-link-email";
import { buildAppointmentLinkPractitionerNoticeEmail } from "@/lib/mail/appointment-link-notice-email";
import { isSmtpConfigured } from "@/lib/env";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { submitTaskForReview } from "@/app/(protected)/my-tasks/actions";

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
