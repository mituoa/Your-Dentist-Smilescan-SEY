"use server";

import { revalidatePath } from "next/cache";

import { persistCommandMessageDraftFromText } from "@/lib/command-ai/persist-command-message-draft";
import { isSummarizeOnlyCommand } from "@/lib/command-ai/reply-intent";
import { resolveCommandIntent } from "@/lib/command-ai/intent-resolver";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";

export type CommandDraftPersistResult =
  | { ok: true; draftId: string; updated: boolean }
  | { ok: false; error: string };

function revalidateInboxDetail(submissionId: string) {
  revalidatePath(`/inbox/${submissionId}`);
}

/**
 * Command AI → persistenter Antwortentwurf am geöffneten Fall.
 * Kein Versand, keine Diagnose — nur Organisationshilfe.
 */
export async function persistMessageDraftFromCommand(input: {
  submissionId: string;
  rawText: string;
}): Promise<CommandDraftPersistResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const trimmed = input.rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Ich konnte daraus noch keine passende Aktion vorbereiten." };
  }

  const submission = await getSubmissionById(
    input.submissionId,
    workspace.workspace_id
  );
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const profile = await getProfileData(workspace.workspace_id);
  const activeCase = {
    submissionId: submission.id,
    patientName: submission.patient_name,
    concernLine: submission.patient_notes,
  };

  const intent = resolveCommandIntent(trimmed, null, activeCase);

  if (intent.kind !== "patient_message" || isSummarizeOnlyCommand(trimmed)) {
    return {
      ok: false,
      error: "Ich konnte daraus noch keine passende Aktion vorbereiten.",
    };
  }

  const result = await persistCommandMessageDraftFromText({
    submissionId: submission.id,
    rawText: trimmed,
    patientName: submission.patient_name ?? "Patient",
    patientNotes: submission.patient_notes,
    submissionUrgency: submission.urgency,
    photoCount: submission.photos.length,
    practicePhone: profile?.practice_phone ?? "",
    appointmentUrl: profile?.appointment_link ?? null,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidateInboxDetail(submission.id);
  return {
    ok: true,
    draftId: result.draftId,
    updated: result.updated,
  };
}

/** Ohne geöffneten Fall — keine Patientensuche in diesem Step. */
export async function persistMessageDraftFromCommandWithoutCase(): Promise<CommandDraftPersistResult> {
  return {
    ok: false,
    error: "Bitte öffnen Sie zuerst einen Patientenfall.",
  };
}
