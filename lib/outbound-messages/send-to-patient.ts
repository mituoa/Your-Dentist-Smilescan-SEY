import "server-only";

import { revalidatePath } from "next/cache";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { isSmtpConfigured } from "@/lib/env";
import { buildPatientOutboundEmail } from "@/lib/mail/patient-outbound-email";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import {
  approveMessageDraft,
  updateMessageDraft,
} from "@/lib/message-drafts/server";
import {
  practiceStatusAfterOutboundSend,
  type PracticeStatusId,
} from "@/lib/practice-status";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
import { createClient } from "@/lib/supabase/server";
import {
  isTrackerBackboneAvailable,
  TRACKER_BACKBONE_MIGRATION_HINT,
} from "@/lib/outbound-messages/backbone-available";
import {
  canRoleSendOutboundKind,
  NO_PATIENT_EMAIL_ERROR,
  SMTP_NOT_CONFIGURED_ERROR,
  type OutboundMessageKind,
} from "@/lib/outbound-messages/types";

export type SendPatientOutboundInput = {
  submissionId: string;
  body: string;
  messageKind: OutboundMessageKind;
  subject?: string;
  draftId?: string | null;
  /** Terminangebot: Link in E-Mail anhängen. */
  includeAppointmentLink?: boolean;
  /** Terminangebot: Dringlichkeit in `submissions.urgency` speichern. */
  urgency?: string | null;
};

export type SendPatientOutboundResult =
  | { ok: true; outboundMessageId: string }
  | { ok: false; error: string };

function revalidateInbox(submissionId: string) {
  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  revalidatePath("/inbox", "layout");
  revalidatePath("/dashboard");
}

export async function sendPatientOutboundMessage(
  input: SendPatientOutboundInput
): Promise<SendPatientOutboundResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  if (!(await isTrackerBackboneAvailable())) {
    return { ok: false, error: TRACKER_BACKBONE_MIGRATION_HINT };
  }

  if (!canRoleSendOutboundKind(workspace.role, input.messageKind)) {
    return {
      ok: false,
      error:
        input.messageKind === "reply"
          ? "Nur Zahnärzt:innen können Antworten an Patient:innen senden."
          : "Nur Zahnärzt:innen können Terminangebote senden.",
    };
  }

  if (!isSmtpConfigured()) {
    return { ok: false, error: SMTP_NOT_CONFIGURED_ERROR };
  }

  const body = input.body.trim();
  if (!body) {
    return { ok: false, error: "Bitte geben Sie einen Nachrichtentext ein." };
  }

  const submission = await getSubmissionById(
    input.submissionId,
    workspace.workspace_id
  );
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const patientEmail = submission.patient_email?.trim();
  if (!patientEmail) {
    return { ok: false, error: NO_PATIENT_EMAIL_ERROR };
  }

  const profile = await getProfileData(workspace.workspace_id);
  const practiceName = profile?.practice_name?.trim() || "Ihre Zahnarztpraxis";
  const appointmentUrl =
    input.includeAppointmentLink && input.messageKind === "appointment_offer"
      ? profile?.appointment_link?.trim() ?? null
      : null;

  if (input.messageKind === "appointment_offer" && input.includeAppointmentLink) {
    if (!appointmentUrl) {
      return {
        ok: false,
        error: "Kein Terminlink hinterlegt. Bitte in den Einstellungen ergänzen.",
      };
    }
  }

  const mail = buildPatientOutboundEmail({
    kind: input.messageKind,
    practiceName,
    patientName: submission.patient_name,
    body,
    appointmentUrl,
  });

  const subject = input.subject?.trim() || mail.subject;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Nicht angemeldet." };
  }

  const { data: outboundRow, error: insertError } = await supabase
    .from("outbound_messages")
    .insert({
      workspace_id: workspace.workspace_id,
      submission_id: input.submissionId,
      patient_email: patientEmail,
      subject,
      body,
      message_kind: input.messageKind,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError || !outboundRow) {
    console.error(
      "[sendPatientOutboundMessage] insert",
      (insertError as { code?: string })?.code ?? "unknown"
    );
    return {
      ok: false,
      error: "Die Nachricht konnte nicht vorbereitet werden. Bitte erneut versuchen.",
    };
  }

  const outboundId = outboundRow.id as string;

  const sendResult = await sendTransactionalMailBestEffort(
    {
      to: patientEmail,
      subject,
      text: mail.text,
      html: mail.html,
      mailContext: `patient_outbound_${input.messageKind}`,
    },
    `patient_outbound_${input.messageKind}`
  );

  if (!sendResult.sent) {
    await supabase
      .from("outbound_messages")
      .update({
        status: "failed",
        error_message: "Der Versand ist fehlgeschlagen. Bitte erneut versuchen.",
      })
      .eq("id", outboundId)
      .eq("workspace_id", workspace.workspace_id);

    return {
      ok: false,
      error: "Die E-Mail konnte nicht versendet werden. Bitte erneut versuchen.",
    };
  }

  const now = new Date().toISOString();
  const nextPracticeStatus: PracticeStatusId = practiceStatusAfterOutboundSend(
    input.messageKind
  );

  const submissionPatch: Record<string, unknown> = {
    practice_status: nextPracticeStatus,
    updated_at: now,
    seen_at: submission.seen_at ?? now,
    seen_by: submission.seen_by ?? user.id,
  };

  if (input.messageKind === "photo_request") {
    submissionPatch.photo_request_requested_at = now;
  }

  if (
    input.messageKind === "appointment_offer" &&
    input.urgency &&
    (input.urgency === "today" ||
      input.urgency === "within_24h" ||
      input.urgency === "this_week" ||
      input.urgency === "not_urgent")
  ) {
    submissionPatch.urgency = input.urgency;
  }

  const { error: submissionError } = await supabase
    .from("submissions")
    .update(submissionPatch)
    .eq("id", input.submissionId)
    .eq("workspace_id", workspace.workspace_id);

  if (submissionError) {
    console.error(
      "[sendPatientOutboundMessage] submission patch",
      (submissionError as { code?: string })?.code ?? "unknown"
    );
  }

  await supabase
    .from("outbound_messages")
    .update({
      status: "sent",
      sent_at: now,
      sent_by: user.id,
      provider_message_id: sendResult.messageId ?? null,
      error_message: null,
    })
    .eq("id", outboundId)
    .eq("workspace_id", workspace.workspace_id);

  if (input.draftId && input.messageKind === "reply") {
    const saved = await updateMessageDraft({ draftId: input.draftId, body });
    if (saved.ok) {
      const approved = await approveMessageDraft({ draftId: input.draftId });
      if (approved.ok) {
        await supabase
          .from("message_drafts")
          .update({ status: "sent", sent_at: now })
          .eq("id", input.draftId)
          .eq("workspace_id", workspace.workspace_id)
          .eq("status", "approved");
      }
    }
  }

  revalidateInbox(input.submissionId);
  return { ok: true, outboundMessageId: outboundId };
}
