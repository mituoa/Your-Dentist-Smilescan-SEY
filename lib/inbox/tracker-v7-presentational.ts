/**
 * Tracker V7 — Praxis-Queue (Warteschlange, keine Datentabelle)
 * UI-Modell: Patient → Vorgang → Verlauf (Submission = technische Zeile)
 */
import { formatBirthDateDe } from "@/lib/inbox/tracker-overview-status";
import {
  clinicalRiskSubTier,
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerQueueTone =
  | "new"
  | "approval"
  | "task"
  | "follow_up"
  | "draft"
  | "done";

export type TrackerQueueRowMeta = {
  caseCategory: string;
  statusLabel: string;
  statusTone: TrackerQueueTone;
  queueReason: string;
  patientSubtitle: string;
};

export type PraxisQueueSummary = {
  activeCases: number;
  newSubmissions: number;
  followUpControls: number;
  approvalPending: number;
  openTasks: number;
  draftPrepared: number;
};

function notesLower(item: EnrichedSubmissionListItem): string {
  return (item.patient_notes ?? "").toLowerCase();
}

/** Feste Vorgangskategorien — kein abgeschnittener Freitext. */
export function trackerCaseCategory(item: EnrichedSubmissionListItem): string {
  const n = notesLower(item);

  if (item.intake_channel === "follow_up") {
    if (/weisheitszahn|weisheit/.test(n)) return "Weisheitszahn Nachsorge";
    if (/implantat/.test(n)) return "Implantatkontrolle";
    if (hasPhotoTrail(item)) return "Kontrollverlauf";
    return "Implantatkontrolle";
  }

  if (hasPhotoTrail(item)) return "Kontrollverlauf";

  if (!item.seen_at && !item.is_draft) return "Neue Anfrage";

  if (/krone.*los|los.*krone|\bkrone\b.*\blocker|\blocker\b.*\bkrone\b/.test(n)) {
    return "Krone locker";
  }
  if (/schwell/.test(n)) return "Schwellung";
  if (/schmerz|weh|empfindlich|pochen/.test(n)) return "Schmerzfall";
  if (/implantat/.test(n)) return "Implantatkontrolle";
  if (/weisheitszahn|weisheit/.test(n)) return "Weisheitszahn Nachsorge";

  return "Neue Anfrage";
}

/** Warum liegt der Fall in der Warteschlange? — Kernfrage pro Zeile. */
export function trackerQueueReason(item: EnrichedSubmissionListItem): string {
  if (!item.seen_at && !item.is_draft) {
    return "Neue Einsendung — Erstprüfung erforderlich";
  }
  if (isApprovalPending(item)) {
    return "Antwort wartet auf Ihre Freigabe";
  }
  if (item.open_task_count > 0) {
    return "Offene Aufgabe in der Praxis";
  }
  if (item.message_draft_status === "draft" && !isApprovalPending(item)) {
    return "KI-Antwort liegt zur Prüfung bereit";
  }
  if (item.intake_channel === "follow_up") {
    return "Nachsorge — Verlauf fortsetzen";
  }
  if (hasPhotoTrail(item)) {
    return "Neue Kontrollbilder im Verlauf";
  }
  if (item.message_draft_status === "approved") {
    return "Freigegebene Antwort kann versendet werden";
  }
  return "Fall wartet auf Rückmeldung";
}

export function trackerQueueStatus(item: EnrichedSubmissionListItem): {
  label: string;
  tone: TrackerQueueTone;
} {
  if (!item.seen_at && !item.is_draft) {
    return { label: "Neu", tone: "new" };
  }
  if (isApprovalPending(item)) {
    return { label: "Freigabe", tone: "approval" };
  }
  if (item.open_task_count > 0) {
    return { label: "Aufgabe", tone: "task" };
  }
  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) {
    return { label: "Nachsorge", tone: "follow_up" };
  }
  if (item.message_draft_status === "draft") {
    return { label: "Antwort ausstehend", tone: "draft" };
  }
  if (item.message_draft_status === "sent") {
    return { label: "Abgeschlossen", tone: "done" };
  }
  if (item.message_draft_status === "approved") {
    return { label: "Antwort ausstehend", tone: "draft" };
  }
  return { label: "Nachsorge", tone: "follow_up" };
}

export function trackerPatientSubtitle(item: EnrichedSubmissionListItem): string {
  const birth = formatBirthDateDe(item.patient_birth_date);
  const ext = item.patient_external_id?.trim();
  if (ext) return `${birth} · ${ext}`;
  return birth;
}

export function buildTrackerQueueRowMeta(
  item: EnrichedSubmissionListItem
): TrackerQueueRowMeta {
  const status = trackerQueueStatus(item);
  return {
    caseCategory: trackerCaseCategory(item),
    statusLabel: status.label,
    statusTone: status.tone,
    queueReason: trackerQueueReason(item),
    patientSubtitle: trackerPatientSubtitle(item),
  };
}

function needsQueueAttention(item: EnrichedSubmissionListItem): boolean {
  if (!item.seen_at && !item.is_draft) return true;
  if (isApprovalPending(item)) return true;
  if (item.open_task_count > 0) return true;
  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) return true;
  if (item.message_draft_status === "draft" || item.message_draft_status === "approved") {
    return true;
  }
  return false;
}

export function computePraxisQueueSummary(
  items: EnrichedSubmissionListItem[]
): PraxisQueueSummary {
  const active = items.filter(needsQueueAttention);
  return {
    activeCases: active.length,
    newSubmissions: items.filter((i) => !i.seen_at && !i.is_draft).length,
    followUpControls: items.filter(
      (i) => i.intake_channel === "follow_up" || hasPhotoTrail(i)
    ).length,
    approvalPending: items.filter(isApprovalPending).length,
    openTasks: items.filter((i) => i.open_task_count > 0).length,
    draftPrepared: items.filter(
      (i) =>
        i.message_draft_status === "draft" &&
        !isApprovalPending(i)
    ).length,
  };
}

/** Warteschlangen-Sortierung — dringend zuerst. */
export function sortTrackerQueueItems(
  items: EnrichedSubmissionListItem[]
): EnrichedSubmissionListItem[] {
  const score = (item: EnrichedSubmissionListItem): number => {
    if (!item.seen_at && !item.is_draft) return 0;
    if (isApprovalPending(item)) return 1;
    if (item.open_task_count > 0) return 2;
    if (item.message_draft_status === "draft") return 3;
    if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) return 4;
    return 5;
  };

  return [...items].sort((a, b) => {
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    const riskDiff = clinicalRiskSubTier(a) - clinicalRiskSubTier(b);
    if (riskDiff !== 0) return riskDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export { formatLastActivityRelative } from "@/lib/inbox/tracker-v6-presentational";
export {
  concernLinesFromNotes,
  urgencyAssessmentDe,
  trackerCaseKind,
} from "@/lib/inbox/tracker-v6-presentational";

/** Vorgangstitel in der Akte — Kategorie + Kontext. */
export function trackerActiveCaseLabel(item: EnrichedSubmissionListItem): string {
  return trackerCaseCategory(item);
}
