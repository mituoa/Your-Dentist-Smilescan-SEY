import { frameNextStep } from "./safety-copy";
import { suggestNextStepFromNotes } from "./preparation-engine";
import type { SubmissionPreparation, SubmissionPreparationInput } from "./types";

/** Derives visible preparation state from existing case data — no LLM required. */
export function buildSubmissionPreparation(
  input: SubmissionPreparationInput
): SubmissionPreparation {
  const hasNotes = Boolean(input.patient_notes?.trim());
  const hasPhotos = input.photo_count > 0;
  const isUnseen = !input.seen_at;

  const checks = hasPhotos
    ? [
        { id: "images", label: "Bilder geprüft", done: true },
        { id: "summary", label: "Zusammenfassung erstellt", done: hasNotes },
        { id: "response", label: "Antwort vorbereitet", done: isUnseen && hasNotes },
      ]
    : [
        { id: "summary", label: "Zusammenfassung erstellt", done: hasNotes },
        { id: "response", label: "Antwort vorbereitet", done: isUnseen && hasNotes },
      ];

  const readyForReview = isUnseen && hasNotes;

  const nextStep = suggestNextStepFromNotes(input.patient_notes);
  const summaryLine = hasNotes
    ? input.patient_notes!.trim().slice(0, 72) + (input.patient_notes!.length > 72 ? "…" : "")
    : null;

  return {
    submissionId: input.id,
    readyForReview,
    checks,
    suggestedNextStep: frameNextStep(nextStep),
    summaryLine,
  };
}

export function countPreparedAwaitingReview(
  items: SubmissionPreparationInput[]
): number {
  return items.filter((item) => buildSubmissionPreparation(item).readyForReview).length;
}

export function countTasksNeedingDecision(
  tasks: { status?: string | null }[]
): number {
  return tasks.filter((t) => t.status === "pending_review").length;
}
