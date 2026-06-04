import { isSubmissionReadyForReview } from "@/lib/message-drafts/list-status";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";
import type { SubmissionListItem } from "@/lib/queries/inbox";

export type PhotoDocumentationHint = {
  kind: "single" | "timeline" | "linked";
  photoCount: number;
  dayCount: number;
  dayLabels: string[];
  /** Nur bei `patient_external_id` — mehrere Fälle, kein Namens-Matching. */
  linkedSubmissionCount: number;
};

export type EnrichedSubmissionListItem = SubmissionListItem & {
  open_task_count: number;
  photo_documentation: PhotoDocumentationHint | null;
};

export type TrackerInboxFilter =
  | "all"
  | "new_submissions"
  | "draft_prepared"
  | "approval_pending"
  | "active_cases"
  | "open_tasks"
  | "photo_trail"
  | "follow_up"
  | "practice_cases"
  | "completed";

export type TrackerFilterChip = {
  id: TrackerInboxFilter;
  label: string;
};

/** Praxis-Inbox — alle Filter als Chips (Count 0 bleibt sichtbar). */
export const TRACKER_FILTER_CHIPS: TrackerFilterChip[] = [
  { id: "all", label: "Alle" },
  { id: "new_submissions", label: "Neue Einsendungen" },
  { id: "draft_prepared", label: "Antwort vorbereitet" },
  { id: "approval_pending", label: "Freigabe ausstehend" },
  { id: "open_tasks", label: "Offene Aufgaben" },
  { id: "follow_up", label: "Nachsorge" },
  { id: "practice_cases", label: "Praxisfälle" },
];

export const TRACKER_FILTER_EMPTY: Record<TrackerInboxFilter, string> = {
  all: "Keine Fälle in der Praxis-Inbox.",
  new_submissions: "Keine neuen Patienteneingänge.",
  draft_prepared: "Keine vorbereiteten Antworten offen.",
  approval_pending: "Keine Antworten warten auf Freigabe.",
  active_cases: "Keine aktiven Fälle in Bearbeitung.",
  open_tasks: "Keine offenen Aufgaben zu Fällen.",
  photo_trail: "Keine aktiven Fotoverläufe.",
  follow_up: "Keine aktiven Nachsorge-Einsendungen.",
  practice_cases: "Keine manuell angelegten Praxisfälle.",
  completed: "Keine abgeschlossenen Fälle.",
};

export function isApprovalPending(item: EnrichedSubmissionListItem): boolean {
  return (
    item.message_draft_status === "draft" && isSubmissionReadyForReview(item)
  );
}

export function hasPhotoTrail(item: EnrichedSubmissionListItem): boolean {
  if (item.photo_documentation?.kind === "timeline") return true;
  if (item.photo_documentation?.kind === "linked") return true;
  if (
    item.photo_documentation &&
    item.photo_documentation.photoCount >= 2 &&
    item.photo_documentation.dayCount >= 2
  ) {
    return true;
  }
  return false;
}

export function matchesTrackerFilter(
  item: EnrichedSubmissionListItem,
  filter: TrackerInboxFilter
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "new_submissions":
      return !item.seen_at && !item.is_draft && item.intake_channel === "patient_upload";
    case "draft_prepared":
      return item.message_draft_status === "draft";
    case "approval_pending":
      return isApprovalPending(item);
    case "active_cases":
      return (
        !item.is_draft &&
        item.message_draft_status !== "sent" &&
        Boolean(item.seen_at) &&
        !isApprovalPending(item)
      );
    case "open_tasks":
      return item.open_task_count > 0;
    case "photo_trail":
      return hasPhotoTrail(item);
    case "follow_up":
      return (
        item.intake_channel === "follow_up" ||
        (item.photo_documentation?.linkedSubmissionCount ?? 0) > 1
      );
    case "practice_cases":
      return item.intake_channel === "practice_manual";
    case "completed":
      return item.message_draft_status === "sent";
    default:
      return true;
  }
}

/** Kurzreferenz in der Tabelle (Figma: Fall-Nr.). */
export function formatTrackerCaseRef(
  id: string,
  externalId: string | null
): string {
  const ext = externalId?.trim();
  if (ext) return ext.length > 12 ? ext.slice(0, 12) : ext;
  const compact = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `F${compact}`;
}

/** Alter in Jahren für die Listenansicht. */
export function formatPatientAgeYears(birthDate: string | null): string | null {
  if (!birthDate) return null;
  const part = birthDate.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  const born = new Date(Date.UTC(y, m - 1, d));
  const now = new Date();
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - born.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < born.getUTCDate())) {
    age -= 1;
  }
  if (age < 0 || age > 130) return null;
  return age === 1 ? "1 Jahr" : `${age} Jahre`;
}

export function countByTrackerFilter(
  items: EnrichedSubmissionListItem[],
  filter: TrackerInboxFilter
): number {
  if (filter === "all") return items.length;
  return items.filter((item) => matchesTrackerFilter(item, filter)).length;
}

/** Clientseitige Suche (gleiche Felder wie Tracker-Liste). */
export function matchesTrackerSearch(
  item: EnrichedSubmissionListItem,
  qLower: string
): boolean {
  if (!qLower) return true;
  const haystack = [
    item.patient_name,
    item.patient_email,
    item.patient_notes,
    item.patient_external_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(qLower);
}

/** Abgeschlossene, gesehene Fälle — innerhalb einer Stufe nach unten sortieren. */
function isArchivedCompleted(item: EnrichedSubmissionListItem): boolean {
  return item.message_draft_status === "sent" && Boolean(item.seen_at);
}

/** Tagesliste: Handlungsbedarf oben, ältere bearbeitete Fälle unten. */
function priorityTier(item: EnrichedSubmissionListItem): number {
  if (!item.seen_at && !item.is_draft && item.intake_channel === "patient_upload") {
    return 1;
  }
  if (isApprovalPending(item)) return 2;
  if (item.open_task_count > 0) return 3;
  if (item.urgency === "today") return 4;
  if (item.urgency === "this_week") return 5;
  if (
    hasPhotoTrail(item) ||
    (item.intake_channel === "patient_upload" && Boolean(item.seen_at))
  ) {
    return 6;
  }
  return 7;
}

/** Handlungsbedarf zuerst, innerhalb der Stufe neueste zuerst. */
export function sortTrackerInboxItems(
  items: EnrichedSubmissionListItem[]
): EnrichedSubmissionListItem[] {
  return [...items].sort((a, b) => {
    const tierDiff = priorityTier(a) - priorityTier(b);
    if (tierDiff !== 0) return tierDiff;
    const archivedDiff = Number(isArchivedCompleted(a)) - Number(isArchivedCompleted(b));
    if (archivedDiff !== 0) return archivedDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export type TrackerAssistHint = {
  id: string;
  label: string;
  variant: "blue" | "amber" | "slate" | "green";
};

const ASSIST_PRIORITY = {
  approval: 1,
  draft: 2,
  tasks: 3,
  photos: 4,
} as const;

export function buildTrackerAssistHints(
  item: EnrichedSubmissionListItem
): TrackerAssistHint[] {
  const ranked: { priority: number; hint: TrackerAssistHint }[] = [];

  if (isApprovalPending(item)) {
    ranked.push({
      priority: ASSIST_PRIORITY.approval,
      hint: { id: "approval", label: "Freigabe ausstehend", variant: "amber" },
    });
  } else if (item.message_draft_status === "draft") {
    ranked.push({
      priority: ASSIST_PRIORITY.draft,
      hint: { id: "draft", label: "Antwort vorbereitet", variant: "blue" },
    });
  }

  if (item.open_task_count > 0) {
    ranked.push({
      priority: ASSIST_PRIORITY.tasks,
      hint: {
        id: "tasks",
        label:
          item.open_task_count === 1 ? "Aufgabe offen" : `${item.open_task_count} Aufgaben`,
        variant: "slate",
      },
    });
  }

  if (hasPhotoTrail(item)) {
    ranked.push({
      priority: ASSIST_PRIORITY.photos,
      hint: {
        id: "photos",
        label:
          item.photo_documentation?.kind === "linked" ? "Fotoverlauf" : "Foto-Dokumentation",
        variant: "slate",
      },
    });
  }

  return ranked
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2)
    .map((entry) => entry.hint);
}

export type TrackerStatusDisplay = {
  label: string;
  className: string;
};

function daysSinceIntake(createdAt: string): number {
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return 1;
  const diff = Date.now() - start;
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}

/**
 * Primäre Inbox-Zeile — Falltyp vor Patientenname.
 */
export function trackerInboxHeadline(item: EnrichedSubmissionListItem): string {
  if (item.is_draft) return "Entwurf";
  if (isApprovalPending(item)) return "Freigabe erforderlich";
  if (item.message_draft_status === "draft") return "KI Antwort bereit";
  if (item.open_task_count > 0) return "Praxisaufgabe";
  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) {
    return `Nachsorge Tag ${daysSinceIntake(item.created_at)}`;
  }
  if (!item.seen_at) return "Neue Anfrage";
  return "In Bearbeitung";
}

/** @deprecated Nutze trackerInboxHeadline — Alias für bestehende Aufrufer. */
export function trackerCaseTypeLabel(item: EnrichedSubmissionListItem): string {
  return trackerInboxHeadline(item);
}

export function trackerStatusForRow(item: EnrichedSubmissionListItem): TrackerStatusDisplay {
  if (item.is_draft) {
    return { label: "Entwurf", className: "yd-tracker-table__status--draft" };
  }
  if (isApprovalPending(item)) {
    return {
      label: "Freigabe ausstehend",
      className: "yd-tracker-table__status--pending",
    };
  }
  if (!item.seen_at) {
    return { label: "Neu", className: "yd-tracker-table__status--new" };
  }
  if (item.message_draft_status === "sent") {
    return { label: "Abgeschlossen", className: "yd-tracker-table__status--done" };
  }
  if (item.urgency === "today") {
    return { label: "Zeitnah", className: "yd-tracker-table__status--urgent" };
  }
  return { label: "In Bearbeitung", className: "yd-tracker-table__status--progress" };
}

export function photoTrailSummary(item: EnrichedSubmissionListItem): string | null {
  const doc = item.photo_documentation;
  if (!doc || doc.photoCount === 0) return null;

  const dayPart =
    doc.dayLabels.length > 0 ? doc.dayLabels.join(" · ") : `${doc.dayCount} Tage`;

  const isMultiDayTrail =
    doc.kind === "timeline" || (doc.photoCount >= 2 && doc.dayCount >= 2);
  const isLinkedTrail = doc.kind === "linked" && doc.linkedSubmissionCount > 1;

  if (isLinkedTrail || isMultiDayTrail) {
    return `Fotoverlauf · ${doc.photoCount} Fotos · ${dayPart}`;
  }

  return doc.photoCount === 1 ? "1 Foto" : `${doc.photoCount} Fotos`;
}

/** Relatives Datum für die Listen-Spalte (Eingang). */
/** Priorität für Inbox-Karten (Arbeitskontext, keine Verwaltungs-ID). */
export function trackerPriorityForRow(item: EnrichedSubmissionListItem): {
  label: string;
  className: string;
} {
  if (item.urgency === "today") {
    return { label: "Heute", className: "yd-tracker-inbox-card__priority--high" };
  }
  if (item.urgency === "this_week") {
    return { label: "Diese Woche", className: "yd-tracker-inbox-card__priority--mid" };
  }
  if (item.urgency === "not_urgent") {
    return { label: "Ruhig einplanen", className: "yd-tracker-inbox-card__priority--low" };
  }
  if (!item.seen_at) {
    return { label: "Einordnen", className: "yd-tracker-inbox-card__priority--open" };
  }
  return { label: "Normal", className: "yd-tracker-inbox-card__priority--low" };
}

export function formatTrackerListDate(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const key = iso.slice(0, 10);
  if (key === todayKey) return "Heute";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return "Gestern";
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function openTasksHintLabel(count: number): string | null {
  if (count <= 0) return null;
  return count === 1 ? "1 Aufgabe offen" : `${count} Aufgaben offen`;
}

export function intakeChannelLabel(channel: IntakeChannel): string {
  switch (channel) {
    case "patient_upload":
      return "Patienteneingang";
    case "practice_manual":
      return "Praxisfall";
    case "follow_up":
      return "Nachsorge";
    case "recall":
      return "Recall";
    default:
      return "Eingang";
  }
}
