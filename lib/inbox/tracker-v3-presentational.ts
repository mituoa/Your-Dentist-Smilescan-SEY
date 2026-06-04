/**
 * Tracker V3 — Informationsarchitektur (Referenz: Control-Leiste → Queue-Tabelle)
 */
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  hasPhotoTrail,
  isApprovalPending,
  photoTrailSummary,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import {
  formatLastActivityRelative,
  trackerCaseKind,
  trackerCaseTitle,
} from "@/lib/inbox/tracker-v6-presentational";
import {
  isVerlaufskontrolle,
  trackerLastActivityShort,
  verlaufTagHeadline,
} from "@/lib/inbox/tracker-v11-presentational";
import {
  computePraxisQueueSummary,
  sortTrackerQueueItems,
  trackerActionNeeded,
  trackerQueueStatus,
  type PraxisQueueSummary,
} from "@/lib/inbox/tracker-v8-presentational";

export {
  computePraxisQueueSummary,
  sortTrackerQueueItems,
  type PraxisQueueSummary,
};

export type TrackerControlMetric = {
  id: string;
  count: number;
  title: string;
  footnote: string;
};

export function buildTrackerControlMetrics(
  summary: PraxisQueueSummary
): TrackerControlMetric[] {
  return [
    {
      id: "new",
      count: summary.newSubmissions,
      title: "Neue Einsendungen",
      footnote: "Neue Patientenanfragen",
    },
    {
      id: "follow",
      count: summary.followUpControls,
      title: "Nachsorgen",
      footnote: "Verlaufskontrollen aktiv",
    },
    {
      id: "approval",
      count: summary.approvalPending + summary.draftPrepared,
      title: "Antworten freigeben",
      footnote: "KI-Antworten warten",
    },
    {
      id: "tasks",
      count: summary.openTasks,
      title: "Offene Aufgaben",
      footnote: "Relay-Aufgaben offen",
    },
  ];
}

/** Status — medizinischer Arbeitszustand, nicht CRM-Badge. */
export function trackerStatusLabel(item: EnrichedSubmissionListItem): string {
  if (isApprovalPending(item)) return "Freigabe ausstehend";
  const status = trackerQueueStatus(item);
  if (status.tone === "draft") return "Antwort vorbereitet";
  if (status.tone === "new") return "Neu";
  if (status.tone === "done") return "Abgeschlossen";
  return status.label;
}

export function trackerStatusTone(item: EnrichedSubmissionListItem): string {
  return trackerQueueStatus(item).tone;
}

/** Falltyp — eine Zeile Titel + optionale Detailzeile (Fotos, Kontext). */
export function trackerFalltypPresentation(item: EnrichedSubmissionListItem): {
  title: string;
  detail: string | null;
} {
  if (isApprovalPending(item)) {
    return { title: "Antwort vorbereitet", detail: null };
  }
  if (item.message_draft_status === "draft" && !isApprovalPending(item)) {
    return { title: "KI-Antwort bereit", detail: "Zur Prüfung" };
  }

  const kind = trackerCaseKind(item);
  const title = trackerCaseTitle(item);

  if (kind === "follow_up" || kind === "control_trail" || hasPhotoTrail(item)) {
    const count = item.photo_count ?? 0;
    const trail = photoTrailSummary(item);
    let detail: string | null = null;
    if (count > 0) {
      detail =
        count === 1 ? "1 neues Foto" : `${count} neue Fotos`;
    } else if (trail) {
      detail = trail.replace(/^Fotoverlauf · /, "");
    }
    return { title, detail };
  }

  if (!item.seen_at && !item.is_draft) {
    const concern = deriveSubmissionIssueShortLine(
      item.patient_notes,
      item.patient_name,
      { maxLen: 48, emptyLabel: "" }
    );
    return { title: "Neue Anfrage", detail: concern || null };
  }

  const concern = deriveSubmissionIssueShortLine(
    item.patient_notes,
    item.patient_name,
    { maxLen: 48, emptyLabel: "" }
  );
  return { title, detail: concern || null };
}

/** Nächste Aktion mit Pfeil — primäre Handlungsführung. */
export function trackerNextActionLabel(item: EnrichedSubmissionListItem): string {
  const { label } = trackerActionNeeded(item);
  if (label === "—") return "Akte öffnen";
  return `${label} →`;
}

const VERLAUF_DAY_MARKERS = [1, 3, 7, 14] as const;

export type VerlaufSummary = {
  title: string;
  progressLabel: string;
  submissionsLabel: string;
  lastLabel: string;
  isVerlauf: boolean;
};

export function buildVerlaufSummary(
  item: Pick<
    EnrichedSubmissionListItem,
    | "intake_channel"
    | "photo_count"
    | "created_at"
    | "patient_notes"
    | "photo_documentation"
    | "patient_name"
    | "seen_at"
    | "is_draft"
    | "open_task_count"
    | "message_draft_status"
    | "urgency"
    | "id"
  >,
  photoDayCount: number
): VerlaufSummary | null {
  const row = item as EnrichedSubmissionListItem;
  if (!isVerlaufskontrolle(row)) return null;

  const title = trackerCaseTitle(row);
  const tagLine = verlaufTagHeadline(row);
  const dayNum = tagLine?.match(/Tag (\d+)/)?.[1] ?? "7";
  const maxDay = VERLAUF_DAY_MARKERS[VERLAUF_DAY_MARKERS.length - 1];
  const count = item.photo_count ?? photoDayCount;

  return {
    title,
    progressLabel: `Tag ${dayNum} von ${maxDay}`,
    submissionsLabel:
      count === 1
        ? "1 Einsendung erhalten"
        : `${count} Einsendungen erhalten`,
    lastLabel: `Letzte Einsendung ${trackerLastActivityShort(item.created_at)}`,
    isVerlauf: true,
  };
}
