import { frameNextStep, frameSituation } from "./safety-copy";
import { buildPhotoWorkflowChecks } from "./photo-workflow";
import { suggestNextStepFromNotes } from "./preparation-engine";
import type { SubmissionPreparation, SubmissionPreparationInput } from "./types";

/** Derives visible preparation state from existing case data — no LLM required. */
export function buildSubmissionPreparation(
  input: SubmissionPreparationInput
): SubmissionPreparation {
  const hasNotes = Boolean(input.patient_notes?.trim());
  const hasPhotos = input.photo_count > 0;
  const isUnseen = !input.seen_at;

  const photoChecks = buildPhotoWorkflowChecks(input.photo_count);

  const nextStep = suggestNextStepFromNotes(input.patient_notes);
  const suggestsAppointment = /termin/i.test(nextStep);

  // Keep a stable scan order: most valuable work first.
  const checks = [
    { id: "response", label: "Antwort vorbereitet", done: isUnseen && hasNotes },
    { id: "summary", label: "Angaben zusammengefasst", done: hasNotes },
    ...(hasPhotos ? [{ id: "images", label: "Fotos geprüft", done: true } as const] : []),
    { id: "appointment", label: "Termin empfohlen", done: suggestsAppointment },
  ];

  const readyForReview = isUnseen && hasNotes;

  const name = input.patient_name?.trim() || "Patient";
  const summaryLine = hasNotes
    ? input.patient_notes!.trim().slice(0, 72) + (input.patient_notes!.length > 72 ? "…" : "")
    : null;

  const responseSummary = hasNotes
    ? frameSituation(input.patient_notes, name)
    : null;

  return {
    submissionId: input.id,
    readyForReview,
    checks,
    photoChecks,
    suggestedNextStep: frameNextStep(nextStep),
    summaryLine,
    responseSummary,
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
