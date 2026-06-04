/**
 * Tracker V11 — Klinische Arbeitswarteschlange (Arbeitsobjekte, keine Tabelle)
 */
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
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
  sortTrackerQueueItems,
  trackerActionNeeded,
} from "@/lib/inbox/tracker-v8-presentational";
import type {
  HeuteRelevantMetric,
  TrackerCaseTypeDisplay,
  TrackerCaseTypeKind,
  TrackerPriorityDisplay,
  TrackerPriorityLevel,
} from "@/lib/inbox/tracker-v10-presentational";
import {
  buildHeuteRelevantMetrics,
  countWaitingCases,
  trackerLastActivityShort,
  trackerNextActionLabel,
  trackerPriority,
} from "@/lib/inbox/tracker-v10-presentational";

export {
  buildHeuteRelevantMetrics,
  countWaitingCases,
  trackerLastActivityShort,
  trackerNextActionLabel,
  trackerPriority,
  type HeuteRelevantMetric,
  type TrackerCaseTypeKind,
};

const VERLAUF_DAY_MARKERS = [1, 3, 7, 14] as const;

export type QueueVisualAccent = "urgent" | "follow" | "approval" | "task";

export type ClinicalQueueCardModel = {
  id: string;
  accent: QueueVisualAccent;
  patientName: string;
  headline: string;
  subline: string | null;
  summary: string;
  photoLabel: string | null;
  activityLabel: string;
  actionLabel: string;
  priority: TrackerPriorityDisplay;
  caseType: TrackerCaseTypeDisplay;
};

/** Verlaufsserie — `follow_up_series_id` sobald im Datenmodell; bis dahin Kanal/Link-Hinweis. */
export function hasFollowUpSeries(item: EnrichedSubmissionListItem): boolean {
  const withSeries = item as EnrichedSubmissionListItem & {
    follow_up_series_id?: string | null;
  };
  if (withSeries.follow_up_series_id?.trim()) return true;
  if (item.intake_channel === "follow_up") return true;
  const doc = item.photo_documentation;
  return Boolean(doc?.kind === "linked" && doc.linkedSubmissionCount > 1);
}

/** Nachsorge nur bei echtem Nachsorge-/Verlaufskontext — nicht bei jeder Einsendung mit Fotos. */
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

  if (hasFollowUpSeries(item)) {
    const specific = trackerCaseTitle(item);
    return {
      kind: "nachsorge",
      label:
        /nachsorge|kontroll|implantat|weisheitszahn/i.test(specific) && specific.length > 3
          ? specific
          : "Nachsorge",
    };
  }

  return { kind: "neue_anfrage", label: "Neue Anfrage" };
}

export function isVerlaufskontrolle(item: EnrichedSubmissionListItem): boolean {
  if (!item.follow_up_series_id?.trim()) return false;
  return resolveTrackerCaseType(item).kind === "nachsorge" && hasFollowUpSeries(item);
}

export function verlaufTagHeadline(item: EnrichedSubmissionListItem): string | null {
  const dayCount =
    item.photo_documentation?.dayCount ??
    Math.max(1, item.photo_count ?? 1);
  const idx = Math.min(dayCount - 1, VERLAUF_DAY_MARKERS.length - 1);
  const tag = VERLAUF_DAY_MARKERS[idx] ?? 7;
  if (isVerlaufskontrolle(item)) {
    return `Verlaufskontrolle Tag ${tag}`;
  }
  if (hasFollowUpSeries(item) || item.intake_channel === "follow_up" || hasPhotoTrail(item)) {
    return `Möglicher Verlauf · Tag ${tag}`;
  }
  return null;
}

export function queueVisualAccent(item: EnrichedSubmissionListItem): QueueVisualAccent {
  const kind = resolveTrackerCaseType(item).kind;
  if (kind === "ki_freigabe") return "approval";
  if (kind === "nachsorge") return "follow";
  if (kind === "praxisaufgabe") return "task";
  return "urgent";
}

function photoLabelForItem(item: EnrichedSubmissionListItem): string | null {
  const count =
    item.photo_count ?? item.photo_documentation?.photoCount ?? 0;
  if (count <= 0) return null;

  if (isVerlaufskontrolle(item)) {
    return count === 1 ? "1 Verlaufsfoto" : `${count} Verlaufsfotos`;
  }
  return count === 1 ? "1 Foto" : `${count} Fotos`;
}

function activityIngressLabel(
  iso: string,
  isNewIngress: boolean
): string {
  if (isNewIngress) {
    const rel = trackerLastActivityShort(iso);
    return rel === "gerade eben" ? "Gerade eingegangen" : `${rel} eingegangen`;
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  if (iso.slice(0, 10) === todayKey) {
    const d = new Date(iso);
    const time = d.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Heute ${time}`;
  }

  return trackerLastActivityShort(iso);
}

export function buildClinicalQueueCard(
  item: EnrichedSubmissionListItem
): ClinicalQueueCardModel {
  const caseType = resolveTrackerCaseType(item);
  const priority = trackerPriority(item);
  const accent = queueVisualAccent(item);
  const isNew = !item.seen_at && !item.is_draft;

  let headline = caseType.label;
  let subline: string | null = null;

  if (caseType.kind === "ki_freigabe") {
    headline = "Antwort vorbereitet";
    subline = "KI wartet auf Freigabe";
  } else if (caseType.kind === "nachsorge") {
    const tag = verlaufTagHeadline(item);
    if (tag) {
      headline = tag;
      subline =
        caseType.label !== tag && caseType.label !== "Nachsorge"
          ? caseType.label
          : null;
    }
  } else if (caseType.kind === "neue_anfrage") {
    headline = "Neue Anfrage";
  }

  const summary = deriveSubmissionIssueShortLine(
    item.patient_notes,
    item.patient_name,
    { maxLen: 72, emptyLabel: "—" }
  );

  return {
    id: item.id,
    accent,
    patientName: item.patient_name?.trim() || "Unbekannter Patient",
    headline,
    subline,
    summary: summary === "—" ? "Kurzbeschreibung in der Akte" : summary,
    photoLabel: photoLabelForItem(item),
    activityLabel: activityIngressLabel(item.created_at, isNew),
    actionLabel: trackerNextActionLabel(item),
    priority,
    caseType,
  };
}

const PRIORITY_ORDER: Record<TrackerPriorityLevel, number> = {
  hoch: 0,
  mittel: 1,
  niedrig: 2,
};

const ACCENT_ORDER: Record<QueueVisualAccent, number> = {
  urgent: 0,
  approval: 1,
  follow: 2,
  task: 3,
};

export function sortClinicalWorkQueue(
  items: EnrichedSubmissionListItem[]
): EnrichedSubmissionListItem[] {
  const base = sortTrackerQueueItems(items);
  return [...base].sort((a, b) => {
    const pa = PRIORITY_ORDER[trackerPriority(a).level];
    const pb = PRIORITY_ORDER[trackerPriority(b).level];
    if (pa !== pb) return pa - pb;

    const aa = ACCENT_ORDER[queueVisualAccent(a)];
    const ab = ACCENT_ORDER[queueVisualAccent(b)];
    if (aa !== ab) return aa - ab;

    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });
}

export function countAttentionCases(
  items: EnrichedSubmissionListItem[]
): number {
  return items.filter((item) => {
    const p = trackerPriority(item);
    return p.level === "hoch" || p.level === "mittel";
  }).length;
}
