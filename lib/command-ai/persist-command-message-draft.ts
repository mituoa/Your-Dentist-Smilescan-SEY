import "server-only";

import { buildCommandMessageDraft } from "@/lib/command-ai/build-command-message-draft";
import {
  mergeSubmissionContextIntoSignals,
  parseMessageSignals,
  type MessageSignals,
} from "@/lib/command-ai/message-signals";
import {
  isSummarizeOnlyCommand,
  resolveCommandReplyIntent,
} from "@/lib/command-ai/reply-intent";
import { appendCareCenterRecommendationToDraft } from "@/lib/care-center/format-patient-article-block";
import { resolveSubmissionCareRecommendation } from "@/lib/care-center/resolve-submission-care-recommendation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  createMessageDraft,
  updateMessageDraft,
} from "@/lib/message-drafts/server";
import { getLatestMessageDraftForSubmission } from "@/lib/queries/message-drafts";
import type { UrgencyKey } from "@/lib/clinical/message-templates";

export type PersistCommandMessageDraftInput = {
  submissionId: string;
  rawText: string;
  patientName: string;
  practicePhone: string;
  appointmentUrl: string | null;
  signals: MessageSignals;
  submissionUrgency?: string | null;
};

export type PersistCommandMessageDraftResult =
  | { ok: true; draftId: string; updated: boolean }
  | { ok: false; error: string };

function toUrgencyKey(urgency: string | null | undefined): UrgencyKey {
  if (
    urgency === "today" ||
    urgency === "within_24h" ||
    urgency === "this_week" ||
    urgency === "not_urgent"
  ) {
    return urgency;
  }
  return null;
}

/**
 * Erzeugt Text und persistiert als `message_drafts` (created_by_kind: ai).
 * Bestehender offener Entwurf (`status = draft`) wird aktualisiert — kein Draft-Spam.
 */
export async function persistCommandMessageDraft(
  input: PersistCommandMessageDraftInput
): Promise<PersistCommandMessageDraftResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const workspaceId = workspace.workspace_id;

  const replyIntent = resolveCommandReplyIntent(input.rawText, input.signals);
  const bodyBase = buildCommandMessageDraft({
    patientName: input.patientName,
    practicePhone: input.practicePhone,
    appointmentUrl: input.appointmentUrl,
    signals: input.signals,
    replyIntent,
    submissionUrgency: toUrgencyKey(input.submissionUrgency),
  });

  const recommendation = await resolveSubmissionCareRecommendation({
    workspaceId,
    patientNotes: input.rawText,
  });
  const body = recommendation
    ? appendCareCenterRecommendationToDraft(bodyBase, recommendation)
    : bodyBase;
  const existingDraft = await getLatestMessageDraftForSubmission(
    input.submissionId,
    workspaceId,
    "draft"
  );

  if (existingDraft) {
    const updated = await updateMessageDraft({
      draftId: existingDraft.id,
      body,
    });
    if (!updated.ok) {
      return {
        ok: false,
        error:
          updated.error.includes("nicht verfügbar") || updated.error.includes("gespeichert")
            ? "Antwortentwürfe sind aktuell nicht verfügbar."
            : updated.error,
      };
    }
    return { ok: true, draftId: existingDraft.id, updated: true };
  }

  const created = await createMessageDraft({
    submissionId: input.submissionId,
    body,
    createdByKind: "ai",
  });

  if (!created.ok) {
    return {
      ok: false,
      error:
        created.error.includes("nicht verfügbar") || created.error.includes("gespeichert")
          ? "Antwortentwürfe sind aktuell nicht verfügbar."
          : created.error,
    };
  }

  return { ok: true, draftId: created.draft.id, updated: false };
}

export type PersistCommandMessageDraftFromTextInput = {
  submissionId: string;
  rawText: string;
  patientName: string;
  patientNotes: string | null;
  submissionUrgency: string | null;
  photoCount: number;
  practicePhone: string;
  appointmentUrl: string | null;
};

/**
 * Voller Pfad: Freitext → Signale → Entwurf → Upsert.
 */
export async function persistCommandMessageDraftFromText(
  input: PersistCommandMessageDraftFromTextInput
): Promise<PersistCommandMessageDraftResult> {
  if (isSummarizeOnlyCommand(input.rawText)) {
    return {
      ok: false,
      error: "Ich konnte daraus noch keine passende Aktion vorbereiten.",
    };
  }

  let signals = parseMessageSignals(input.rawText);
  signals = mergeSubmissionContextIntoSignals(signals, {
    urgency: input.submissionUrgency,
    photoCount: input.photoCount,
  });

  return persistCommandMessageDraft({
    submissionId: input.submissionId,
    rawText: input.rawText,
    patientName: input.patientName,
    practicePhone: input.practicePhone,
    appointmentUrl: input.appointmentUrl,
    signals,
    submissionUrgency: input.submissionUrgency,
  });
}
