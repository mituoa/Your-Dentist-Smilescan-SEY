"use server";

import { revalidatePath } from "next/cache";

import { parseMessageSignals } from "@/lib/command-ai/message-signals";
import { persistCommandMessageDraft } from "@/lib/command-ai/persist-command-message-draft";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  approveMessageDraft,
  createMessageDraft,
  markMessageDraftSent,
  updateMessageDraft,
} from "@/lib/message-drafts/server";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";

export type MessageDraftActionResult =
  | { ok: true; draftId?: string }
  | { ok: false; error: string };

function revalidateInboxDetail(submissionId: string) {
  revalidatePath(`/inbox/${submissionId}`);
}

export async function prepareMessageDraftForSubmission(
  submissionId: string
): Promise<MessageDraftActionResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const submission = await getSubmissionById(submissionId, workspace.workspace_id);
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const profile = await getProfileData(workspace.workspace_id);
  const signals = parseMessageSignals(submission.patient_notes ?? "");

  const result = await persistCommandMessageDraft({
    submissionId,
    rawText: submission.patient_notes ?? "",
    patientName: submission.patient_name ?? "Patient",
    practicePhone: profile?.practice_phone ?? "",
    appointmentUrl: profile?.appointment_link ?? null,
    signals,
    submissionUrgency: submission.urgency,
  });

  if (!result.ok) {
    if (result.error.includes("nicht verfügbar") || result.error.includes("gespeichert")) {
      return { ok: false, error: result.error };
    }
    return {
      ok: false,
      error:
        result.error === "Der Entwurf konnte nicht gespeichert werden."
          ? "Antwortentwürfe sind aktuell nicht verfügbar."
          : result.error,
    };
  }

  revalidateInboxDetail(submissionId);
  return { ok: true, draftId: result.draftId };
}

export async function saveMessageDraftBody(input: {
  draftId: string;
  submissionId: string;
  body: string;
}): Promise<MessageDraftActionResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const submission = await getSubmissionById(input.submissionId, workspace.workspace_id);
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const result = await updateMessageDraft({
    draftId: input.draftId,
    body: input.body,
  });

  if (!result.ok) {
    return {
      ok: false,
      error: "Entwurf konnte nicht gespeichert werden. Bitte erneut versuchen.",
    };
  }

  revalidateInboxDetail(input.submissionId);
  return { ok: true };
}

export async function approveMessageDraftForSubmission(input: {
  draftId: string;
  submissionId: string;
}): Promise<MessageDraftActionResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  if (workspace.role !== "doctor") {
    return { ok: false, error: "Nur Zahnärzt:innen können Antworten freigeben." };
  }

  const submission = await getSubmissionById(input.submissionId, workspace.workspace_id);
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const result = await approveMessageDraft({ draftId: input.draftId });
  if (!result.ok) {
    return {
      ok: false,
      error: result.error.includes("Freigabe")
        ? result.error
        : "Die Freigabe konnte nicht gespeichert werden. Bitte erneut versuchen.",
    };
  }

  revalidateInboxDetail(input.submissionId);
  return { ok: true };
}

export async function markMessageDraftSentForSubmission(input: {
  draftId: string;
  submissionId: string;
}): Promise<MessageDraftActionResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  if (workspace.role !== "doctor") {
    return { ok: false, error: "Nur Zahnärzt:innen können Antworten freigeben." };
  }

  const submission = await getSubmissionById(input.submissionId, workspace.workspace_id);
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const result = await markMessageDraftSent({ draftId: input.draftId });
  if (!result.ok) {
    return {
      ok: false,
      error: "Der Versandstatus konnte nicht gespeichert werden. Bitte erneut versuchen.",
    };
  }

  revalidateInboxDetail(input.submissionId);
  return { ok: true };
}

/** Manuelle Entwurf-Anlage (user) — falls später aus UI benötigt. */
export async function createUserMessageDraftForSubmission(input: {
  submissionId: string;
  body: string;
}): Promise<MessageDraftActionResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const submission = await getSubmissionById(input.submissionId, workspace.workspace_id);
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const result = await createMessageDraft({
    submissionId: input.submissionId,
    body: input.body,
    createdByKind: "user",
  });

  if (!result.ok) {
    return {
      ok: false,
      error: "Antwortentwürfe sind aktuell nicht verfügbar.",
    };
  }

  revalidateInboxDetail(input.submissionId);
  return { ok: true };
}
