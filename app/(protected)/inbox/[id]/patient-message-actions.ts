"use server";

import {
  prepareMessageDraftForSubmission,
  saveMessageDraftBody,
} from "@/app/(protected)/inbox/[id]/message-draft-actions";
import { sendPatientOutboundMessage } from "@/lib/outbound-messages/send-to-patient";
import type { OutboundMessageKind } from "@/lib/outbound-messages/types";

export type PatientMessageActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function sendTrackerPatientMessage(input: {
  submissionId: string;
  body: string;
  messageKind: OutboundMessageKind;
  draftId?: string | null;
  includeAppointmentLink?: boolean;
  urgency?: string | null;
}): Promise<PatientMessageActionResult> {
  const res = await sendPatientOutboundMessage({
    submissionId: input.submissionId,
    body: input.body,
    messageKind: input.messageKind,
    draftId: input.draftId ?? null,
    includeAppointmentLink: input.includeAppointmentLink ?? false,
    urgency: input.urgency ?? null,
  });

  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  const successByKind: Record<OutboundMessageKind, string> = {
    question: "Rückfrage wurde per E-Mail gesendet.",
    photo_request: "Fotoanforderung wurde per E-Mail gesendet.",
    appointment_offer: "Terminangebot wurde per E-Mail gesendet.",
    reply: "Antwort wurde per E-Mail gesendet.",
  };

  return { ok: true, message: successByKind[input.messageKind] };
}

/** Entwurf speichern ohne Versand (Team-Vorbereitung). */
export async function saveTrackerDraftOnly(input: {
  submissionId: string;
  body: string;
  draftId?: string | null;
}): Promise<PatientMessageActionResult> {
  if (!input.body.trim()) {
    return { ok: false, error: "Bitte geben Sie einen Nachrichtentext ein." };
  }

  if (input.draftId) {
    const save = await saveMessageDraftBody({
      draftId: input.draftId,
      submissionId: input.submissionId,
      body: input.body,
    });
    if (!save.ok) return { ok: false, error: save.error };
    return { ok: true, message: "Entwurf gespeichert." };
  }

  const prep = await prepareMessageDraftForSubmission(input.submissionId);
  if (!prep.ok) return { ok: false, error: prep.error };
  return { ok: true, message: "Entwurf vorbereitet — in der Kommunikation bearbeiten." };
}
