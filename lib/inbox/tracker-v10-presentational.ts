/**
 * Tracker V10 — Arbeitswarteschlange (Entscheidungszentrale, keine Patientenverwaltung)
 */
import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import {
  formatLastActivityRelative,
  trackerCaseTitle,
} from "@/lib/inbox/tracker-v6-presentational";
import {
  computePraxisQueueSummary,
  sortTrackerQueueItems,
  trackerActionNeeded,
  type PraxisQueueSummary,
} from "@/lib/inbox/tracker-v8-presentational";

export { computePraxisQueueSummary, sortTrackerQueueItems, type PraxisQueueSummary };

/** Vier echte Falltypen — keine Pauschallabels. */
export type TrackerCaseTypeKind =
  | "neue_anfrage"
  | "nachsorge"
  | "ki_freigabe"
  | "praxisaufgabe";

export type TrackerCaseTypeDisplay = {
  kind: TrackerCaseTypeKind;
  label: string;
};

export type TrackerPriorityLevel = "hoch" | "mittel" | "niedrig";

export type TrackerPriorityDisplay = {
  label: "Hoch" | "Mittel" | "Niedrig";
  level: TrackerPriorityLevel;
};

export type HeuteRelevantMetric = {
  id: TrackerCaseTypeKind | "aufgaben";
  count: number;
  label: string;
};

export function resolveTrackerCaseType(
  item: EnrichedSubmissionListItem
): TrackerCaseTypeDisplay {
  if (item.open_task_count > 0 && !isApprovalPending(item)) {
    return { kind: "praxisaufgabe", label: "Praxisaufgabe" };
  }

  if (
    isApprovalPending(item) ||
    item.message_draft_status === "draft" ||
    item.message_draft_status === "approved"
  ) {
    return { kind: "ki_freigabe", label: "KI-Freigabe" };
  }

  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) {
    const specific = trackerCaseTitle(item);
    const label =
      /nachsorge|kontroll|implantat|weisheitszahn/i.test(specific) && specific.length > 3
        ? specific
        : specific && specific !== "Laufende Anfrage"
          ? specific
          : "Nachsorge";
    return { kind: "nachsorge", label };
  }

  if (!item.seen_at && !item.is_draft) {
    return { kind: "neue_anfrage", label: "Neue Anfrage" };
  }

  if (hasPhotoTrail(item)) {
    return { kind: "nachsorge", label: trackerCaseTitle(item) };
  }

  return { kind: "neue_anfrage", label: "Neue Anfrage" };
}

export function trackerPriority(
  item: EnrichedSubmissionListItem
): TrackerPriorityDisplay {
  if (!item.seen_at && !item.is_draft) {
    return { label: "Hoch", level: "hoch" };
  }
  if (isApprovalPending(item)) {
    return { label: "Hoch", level: "hoch" };
  }
  if (item.urgency === "today" || item.open_task_count > 0) {
    return { label: "Hoch", level: "hoch" };
  }
  if (
    item.intake_channel === "follow_up" ||
    hasPhotoTrail(item) ||
    item.message_draft_status === "draft"
  ) {
    return { label: "Mittel", level: "mittel" };
  }
  if (
    item.message_draft_status === "approved" ||
    item.message_draft_status === "sent"
  ) {
    return { label: "Niedrig", level: "niedrig" };
  }
  return { label: "Mittel", level: "mittel" };
}

export function trackerNextActionLabel(item: EnrichedSubmissionListItem): string {
  const { label } = trackerActionNeeded(item);
  if (label === "—") return "Öffnen →";
  return `${label} →`;
}

export function trackerLastActivityShort(iso: string): string {
  const rel = formatLastActivityRelative(iso);
  if (rel.startsWith("Vor ")) return rel.replace(/^Vor /, "vor ");
  if (rel === "Gerade eben") return "gerade eben";
  return rel.toLowerCase();
}

/** KPI-Zeile „Heute relevant“ — nur vier klare Kategorien. */
export function buildHeuteRelevantMetrics(
  items: EnrichedSubmissionListItem[]
): HeuteRelevantMetric[] {
  let neue = 0;
  let nachsorge = 0;
  let freigabe = 0;
  let aufgaben = 0;

  for (const item of items) {
    const type = resolveTrackerCaseType(item);
    if (type.kind === "neue_anfrage") neue += 1;
    else if (type.kind === "nachsorge") nachsorge += 1;
    else if (type.kind === "ki_freigabe") freigabe += 1;
    else if (type.kind === "praxisaufgabe") aufgaben += 1;
  }

  return [
    { id: "neue_anfrage", count: neue, label: "Neue Anfragen" },
    { id: "nachsorge", count: nachsorge, label: "Nachsorgen" },
    { id: "ki_freigabe", count: freigabe, label: "Freigabe" },
    { id: "aufgaben", count: aufgaben, label: "Aufgaben" },
  ];
}

const PRIORITY_ORDER: Record<TrackerPriorityLevel, number> = {
  hoch: 0,
  mittel: 1,
  niedrig: 2,
};

/** Warteschlange: Dringlichkeit, dann bestehende Queue-Sortierung. */
export function sortTrackerWorkQueue(
  items: EnrichedSubmissionListItem[]
): EnrichedSubmissionListItem[] {
  const sorted = sortTrackerQueueItems(items);
  return [...sorted].sort((a, b) => {
    const pd =
      PRIORITY_ORDER[trackerPriority(a).level] -
      PRIORITY_ORDER[trackerPriority(b).level];
    if (pd !== 0) return pd;
    return 0;
  });
}

export function countWaitingCases(items: EnrichedSubmissionListItem[]): number {
  return items.filter((item) => {
    const p = trackerPriority(item);
    return p.level !== "niedrig" || !item.seen_at;
  }).length;
}
