/** Dashboard — praxisnahe Orientierungssprache (kein SaaS-/Backend-Jargon). */

import type { SubmissionPreparation } from "@/lib/command-ai/types";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

export function countAttentionAreas(input: {
  unseenCount: number;
  preparedAwaitingCount: number;
  tasksNeedingDecision: number;
}): number {
  let areas = 0;
  if (input.unseenCount > 0) areas += 1;
  if (input.preparedAwaitingCount > 0) areas += 1;
  if (input.tasksNeedingDecision > 0) areas += 1;
  return areas;
}

export function buildDashboardAttentionSubtitle(input: {
  unseenCount: number | null;
  preparedAwaitingCount: number | null;
  tasksNeedingDecision: number | null;
}): string {
  const unseen = input.unseenCount ?? 0;
  const prepared = input.preparedAwaitingCount ?? 0;
  const decisions = input.tasksNeedingDecision ?? 0;
  const areas = countAttentionAreas({
    unseenCount: unseen,
    preparedAwaitingCount: prepared,
    tasksNeedingDecision: decisions,
  });

  if (areas === 0) {
    return "Heute liegen keine dringenden Vorgänge vor.";
  }

  if (decisions > 0 && unseen === 0 && prepared === 0) {
    return decisions === 1
      ? "Heute wartet 1 Entscheidung auf Freigabe."
      : `Heute warten ${decisions} Entscheidungen auf Freigabe.`;
  }

  return areas === 1
    ? "Heute benötigt Ihre Praxis Aufmerksamkeit in 1 Bereich."
    : `Heute benötigt Ihre Praxis Aufmerksamkeit in ${areas} Bereichen.`;
}

/** @deprecated Use buildDashboardAttentionSubtitle */
export function buildDashboardSubtitle(
  unseenCount: number | null,
  openTaskCount: number,
  newCount: number | null
): string {
  return buildDashboardAttentionSubtitle({
    unseenCount,
    preparedAwaitingCount: newCount,
    tasksNeedingDecision: openTaskCount,
  });
}

export function buildMobilePriorityLine(
  unseenCount: number | null,
  preparedAwaitingCount: number | null,
  tasksNeedingDecision: number | null
): string {
  const subtitle = buildDashboardAttentionSubtitle({
    unseenCount,
    preparedAwaitingCount,
    tasksNeedingDecision,
  });
  return subtitle.replace(/^Heute /, "");
}

export function buildNewSubmissionsKpiValue(count: number | null): string {
  if (count === null) return "—";
  if (count === 0) return "Keine neuen Anfragen";
  if (count === 1) return "1 neue Anfrage eingegangen";
  return `${count} neue Anfragen eingegangen`;
}

export function buildPreparedKpiValue(count: number | null): string {
  if (count === null) return "—";
  if (count === 0) return "Keine Freigaben erforderlich";
  if (count === 1) return "1 Fall wartet auf Freigabe";
  return `${count} Fälle warten auf Freigabe`;
}

export function buildDecisionsKpiValue(count: number | null): string {
  if (count === null) return "—";
  if (count === 0) return "Keine offenen Rückmeldungen";
  if (count === 1) return "1 Patient wartet auf Antwort";
  return `${count} Patienten warten auf Antwort`;
}

export type DashboardAttentionRowCopy = {
  preparationLine: string;
  actionLabel: string;
  priority: number;
};

export function buildDashboardAttentionRowCopy(
  row: SubmissionPreviewRow,
  preparation?: SubmissionPreparation
): DashboardAttentionRowCopy {
  if (preparation?.readyForReview) {
    return {
      preparationLine: "Vorbereitung vorhanden",
      actionLabel: "Antwort freigeben",
      priority: 0,
    };
  }

  if (!row.seen_at) {
    return {
      preparationLine: "Neu eingegangen",
      actionLabel: "Sichtung starten",
      priority: 1,
    };
  }

  const draftStatus = row.message_draft_status;
  if (draftStatus === "draft") {
    return {
      preparationLine: "Zur Freigabe vorbereitet",
      actionLabel: "Prüfen",
      priority: 2,
    };
  }

  if (row.patient_notes?.trim()) {
    return {
      preparationLine: "Bereit zur Bearbeitung",
      actionLabel: "Fall öffnen",
      priority: 3,
    };
  }

  return {
    preparationLine: "Rückfrage empfohlen",
    actionLabel: "Fall öffnen",
    priority: 4,
  };
}

export function dashboardRowNeedsAttention(
  row: SubmissionPreviewRow,
  preparation?: SubmissionPreparation
): boolean {
  if (preparation?.readyForReview) return true;
  if (!row.seen_at) return true;
  if (row.message_draft_status === "draft") return true;
  return false;
}
