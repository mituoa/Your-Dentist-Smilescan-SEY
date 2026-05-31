import { buildSubmissionPreparation, countPreparedAwaitingReview } from "./submission-preparation";
import type { SubmissionPreparationInput } from "./types";

export type PracticeBriefingCheck = {
  id: string;
  label: string;
  done: boolean;
};

export type PracticeBriefing = {
  headline: string;
  subline: string;
  checks: PracticeBriefingCheck[];
  calmPractice: boolean;
  casesAnalyzed: number;
  responsesPrepared: number;
  tasksRecognized: number;
  staleUnseenCount: number;
};

export type PracticeHealthSnapshot = {
  calmPractice: boolean;
  headline: string;
  staleUnseenCount: number;
  preparedResponses: number;
  criticalDelays: number;
};

export type PracticeDevelopmentSnapshot = {
  newCasesWeek: number;
  preparedResponses: number;
  activeCases: number;
  decisionsPending: number;
};

const MS_24H = 24 * 60 * 60 * 1000;

function countStaleUnseen(
  items: { seen_at: string | null; created_at: string }[]
): number {
  const cutoff = Date.now() - MS_24H;
  return items.filter(
    (item) => !item.seen_at && new Date(item.created_at).getTime() < cutoff
  ).length;
}

export function buildPracticeBriefing(input: {
  displayName: string;
  greeting: string;
  priorityItems: SubmissionPreparationInput[];
  previewRows: { seen_at: string | null; created_at: string }[];
  openTaskCount: number;
  tasksNeedingDecision: number;
  preparedAwaitingCount: number;
}): PracticeBriefing {
  const casesAnalyzed = input.priorityItems.length;
  const responsesPrepared = input.preparedAwaitingCount;
  const tasksRecognized = input.openTaskCount;
  const staleUnseenCount = countStaleUnseen(input.previewRows);
  const criticalDelays = staleUnseenCount;
  const calmPractice = criticalDelays === 0 && input.tasksNeedingDecision === 0;

  const checks: PracticeBriefingCheck[] = [
    {
      id: "cases",
      label: `${casesAnalyzed} Patientenfälle analysiert`,
      done: casesAnalyzed > 0 || responsesPrepared === 0,
    },
    {
      id: "responses",
      label: `${responsesPrepared} Antworten vorbereitet`,
      done: responsesPrepared > 0 || casesAnalyzed === 0,
    },
    {
      id: "tasks",
      label: `${tasksRecognized} Aufgaben erkannt`,
      done: true,
    },
    {
      id: "delays",
      label:
        criticalDelays === 0
          ? "Keine kritischen Verzögerungen"
          : `${criticalDelays} Fälle >24h ohne Rückmeldung`,
      done: criticalDelays === 0,
    },
  ];

  return {
    headline: `${input.greeting}, ${input.displayName}`,
    subline: calmPractice
      ? "Ihre Praxis ist vorbereitet."
      : "Assistenz hat den Überblick — einige Freigaben stehen an.",
    checks,
    calmPractice,
    casesAnalyzed,
    responsesPrepared,
    tasksRecognized,
    staleUnseenCount,
  };
}

export function buildPracticeHealth(input: {
  unseenCount: number;
  preparedAwaitingCount: number;
  previewRows: { seen_at: string | null; created_at: string }[];
  tasksNeedingDecision: number;
}): PracticeHealthSnapshot {
  const staleUnseenCount = countStaleUnseen(input.previewRows);
  const criticalDelays = staleUnseenCount;
  const calmPractice =
    staleUnseenCount === 0 && input.unseenCount === 0 && input.tasksNeedingDecision === 0;

  return {
    calmPractice,
    headline: calmPractice ? "Praxis läuft ruhig" : "Freigaben ausstehend",
    staleUnseenCount,
    preparedResponses: input.preparedAwaitingCount,
    criticalDelays,
  };
}

export function buildPracticeDevelopment(input: {
  weeklyCounts: number[] | null;
  seenCount: number | null;
  preparedAwaitingCount: number;
  tasksNeedingDecision: number;
}): PracticeDevelopmentSnapshot {
  const newCasesWeek = (input.weeklyCounts ?? []).reduce((a, b) => a + b, 0);

  return {
    newCasesWeek,
    preparedResponses: input.preparedAwaitingCount,
    activeCases: input.seenCount ?? 0,
    decisionsPending: input.tasksNeedingDecision,
  };
}

export function analyzeSubmissionBatch(items: SubmissionPreparationInput[]) {
  return {
    preparedCount: countPreparedAwaitingReview(items),
    total: items.length,
  };
}
