import {
  buildTrackerClinicalDecisionFromListItem,
  clinicalHeadlineToWorkKind,
  clinicalPrimaryActionToInboxHeadline,
} from "@/lib/inbox/tracker-clinical-decision";
import { isSubmissionReadyForReview } from "@/lib/message-drafts/list-status";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";
import { normalizePracticeStatus, practiceStatusLabel } from "@/lib/practice-status";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import {
  EMPTY_OUTBOUND_SENT,
  type OutboundSentFlags,
} from "@/lib/outbound-messages/types";

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
  outbound_sent?: OutboundSentFlags;
};

export function outboundSentForItem(
  item: EnrichedSubmissionListItem
): OutboundSentFlags {
  return item.outbound_sent ?? EMPTY_OUTBOUND_SENT;
}

export type TrackerInboxFilter =
  | "all"
  | "new_submissions"
  | "draft_prepared"
  | "approval_pending"
  | "active_cases"
  | "open_tasks"
  | "photo_trail"
  | "follow_up"
  | "rueckfrage"
  | "practice_cases"
  | "completed";

export type TrackerFilterChip = {
  id: TrackerInboxFilter;
  label: string;
};

/** Praxis-Inbox — Arbeit filtern (nicht Kategorien anzeigen). */
export const TRACKER_FILTER_CHIPS: TrackerFilterChip[] = [
  { id: "all", label: "Alle" },
  { id: "new_submissions", label: "Neue Anfrage" },
  { id: "approval_pending", label: "Antwort freigeben" },
  { id: "draft_prepared", label: "Antwort prüfen" },
  { id: "open_tasks", label: "Praxisaufgabe" },
  { id: "follow_up", label: "Verlaufskontrolle" },
  { id: "rueckfrage", label: "Rückfrage offen" },
];

export const TRACKER_FILTER_EMPTY: Record<TrackerInboxFilter, string> = {
  all: "Keine offene Arbeit in der Praxis-Inbox.",
  new_submissions: "Keine neuen Patientenanfragen.",
  draft_prepared: "Keine Antworten zur Prüfung.",
  approval_pending: "Keine Antworten warten auf ärztliche Freigabe.",
  active_cases: "Keine weiteren Fälle in Bearbeitung.",
  open_tasks: "Keine offenen Praxisaufgaben zu Fällen.",
  photo_trail: "Keine Verlaufskontrollen mit Fotoverlauf.",
  follow_up: "Keine aktiven Verlaufskontrollen.",
  rueckfrage: "Keine offenen Rückfragen.",
  practice_cases: "Keine Praxisfälle ohne Patienteneingang.",
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

export function matchesTrackerWorkKind(
  item: EnrichedSubmissionListItem,
  kind: TrackerInboxWorkKind
): boolean {
  return trackerInboxWorkType(item).kind === kind;
}

export function matchesTrackerFilter(
  item: EnrichedSubmissionListItem,
  filter: TrackerInboxFilter
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "new_submissions":
      return matchesTrackerWorkKind(item, "neue_anfrage");
    case "draft_prepared":
      return matchesTrackerWorkKind(item, "antwort_pruefen");
    case "approval_pending":
      return matchesTrackerWorkKind(item, "freigabe");
    case "open_tasks":
      return matchesTrackerWorkKind(item, "praxisaufgabe");
    case "follow_up":
      return matchesTrackerWorkKind(item, "verlaufskontrolle");
    case "rueckfrage":
      return matchesTrackerWorkKind(item, "rueckfrage");
    case "active_cases":
      return (
        !matchesTrackerWorkKind(item, "abgeschlossen") &&
        !matchesTrackerWorkKind(item, "entwurf") &&
        item.message_draft_status !== "sent"
      );
    case "photo_trail":
      return (
        matchesTrackerWorkKind(item, "verlaufskontrolle") && hasPhotoTrail(item)
      );
    case "practice_cases":
      return item.intake_channel === "practice_manual";
    case "completed":
      return matchesTrackerWorkKind(item, "abgeschlossen");
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
  if (item.urgency === "within_24h") return 4;
  if (item.urgency === "this_week") return 5;
  if (hasVerlaufskontrolleContext(item)) return 6;
  if (item.photo_count === 0 && Boolean(item.seen_at)) return 7;
  return 8;
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

const VERLAUF_DAY_MARKERS = [1, 3, 7, 14] as const;

export type TrackerInboxWorkKind =
  | "entwurf"
  | "freigabe"
  | "antwort_pruefen"
  | "praxisaufgabe"
  | "verlaufskontrolle"
  | "neue_anfrage"
  | "rueckfrage"
  | "laufend"
  | "abgeschlossen";

export type TrackerInboxWorkType = {
  kind: TrackerInboxWorkKind;
  /** Primäre Zeile — Art der Arbeit (vor Patientenname). */
  headline: string;
  /** Kurzer klinischer Kontext (Anliegen, Verlauf, Aufgaben …). */
  context: string | null;
};

/**
 * Verlaufskontrolle — Nachsorge, Fotoverlauf oder spätere Verlaufskette
 * (`follow_up_series_id` / linked submissions). Kein Datenmodell-Zwang hier.
 */
export function hasVerlaufskontrolleContext(item: EnrichedSubmissionListItem): boolean {
  if (item.intake_channel === "follow_up") return true;
  const doc = item.photo_documentation;
  if (doc?.kind === "linked" && doc.linkedSubmissionCount > 1) return true;
  return hasPhotoTrail(item);
}

function verlaufskontrolleTag(item: EnrichedSubmissionListItem): number {
  const dayCount = Math.max(1, item.photo_documentation?.dayCount ?? 1);
  const idx = Math.min(dayCount - 1, VERLAUF_DAY_MARKERS.length - 1);
  return VERLAUF_DAY_MARKERS[idx] ?? 7;
}

function verlaufskontrolleHeadline(item: EnrichedSubmissionListItem): string {
  if (item.follow_up_series_id?.trim()) {
    const doc = item.photo_documentation;
    if (doc?.kind === "linked" && doc.linkedSubmissionCount > 1) {
      return "Verlaufskontrolle · Folgeeinsendung";
    }
    return `Verlaufskontrolle Tag ${verlaufskontrolleTag(item)}`;
  }
  const doc = item.photo_documentation;
  if (doc?.kind === "linked" && doc.linkedSubmissionCount > 1) {
    return "Möglicher Verlauf · Folgeeinsendung";
  }
  return `Möglicher Verlauf · Tag ${verlaufskontrolleTag(item)}`;
}

function verlaufskontrolleContext(item: EnrichedSubmissionListItem): string | null {
  const doc = item.photo_documentation;
  if (doc?.kind === "linked" && doc.linkedSubmissionCount > 1) {
    const n = doc.linkedSubmissionCount;
    return n === 2
      ? "2 Einsendungen · dieselbe Verlaufskette"
      : `${n} Einsendungen · dieselbe Verlaufskette`;
  }
  const trail = photoTrailSummary(item);
  if (trail) return trail;
  const count = item.photo_count ?? 0;
  if (count > 0) {
    return count === 1 ? "1 Verlaufsfoto" : `${count} Verlaufsfotos`;
  }
  return "Verlauf dokumentieren";
}

/**
 * Primäre Inbox-Zeile — welche Arbeit wartet (Falltyp vor Patient).
 */
export function trackerInboxWorkType(item: EnrichedSubmissionListItem): TrackerInboxWorkType {
  if (item.is_draft) {
    return { kind: "entwurf", headline: "Entwurf", context: "Noch nicht veröffentlicht" };
  }

  if (isApprovalPending(item)) {
    const decision = buildTrackerClinicalDecisionFromListItem(item);
    return {
      kind: "freigabe",
      headline: "Antwort freigeben",
      context: decision.confidenceNote,
    };
  }

  if (item.message_draft_status === "draft") {
    return {
      kind: "antwort_pruefen",
      headline: "Antwort prüfen",
      context: "Entwurf zur ärztlichen Sichtung",
    };
  }

  if (item.open_task_count > 0) {
    return {
      kind: "praxisaufgabe",
      headline: "Praxisaufgabe",
      context:
        item.open_task_count === 1 ? "1 offene Aufgabe" : `${item.open_task_count} offene Aufgaben`,
    };
  }

  if (hasVerlaufskontrolleContext(item)) {
    return {
      kind: "verlaufskontrolle",
      headline: verlaufskontrolleHeadline(item),
      context: verlaufskontrolleContext(item),
    };
  }

  const outbound = outboundSentForItem(item);
  if (outbound.reply) {
    return {
      kind: "abgeschlossen",
      headline: "Antwort gesendet",
      context: "Per E-Mail an Patient:innen",
    };
  }

  const decision = buildTrackerClinicalDecisionFromListItem(item);
  const headline = clinicalPrimaryActionToInboxHeadline(decision.primaryAction);
  const kind = clinicalHeadlineToWorkKind(headline);

  if (!item.seen_at && kind === "neue_anfrage") {
    return { kind: "neue_anfrage", headline: "Neue Anfrage", context: decision.confidenceNote };
  }

  if (item.photo_count === 0 && kind === "rueckfrage") {
    return {
      kind: "rueckfrage",
      headline: "Rückfrage offen",
      context: decision.missing[0] ?? decision.confidenceNote,
    };
  }

  return { kind, headline, context: decision.confidenceNote };
}

/**
 * Primäre Inbox-Zeile — Falltyp vor Patientenname.
 */
export function trackerInboxHeadline(item: EnrichedSubmissionListItem): string {
  return trackerInboxWorkType(item).headline;
}

/** @deprecated Nutze trackerInboxHeadline — Alias für bestehende Aufrufer. */
export function trackerCaseTypeLabel(item: EnrichedSubmissionListItem): string {
  return trackerInboxHeadline(item);
}

export function trackerStatusForRow(item: EnrichedSubmissionListItem): TrackerStatusDisplay {
  const practiceStatus = normalizePracticeStatus(item.practice_status);
  if (practiceStatus === "resolved") {
    return { label: "Abgeschlossen", className: "yd-tracker-table__status--done" };
  }
  if (practiceStatus === "waiting_for_patient") {
    return {
      label: practiceStatusLabel("waiting_for_patient"),
      className: "yd-tracker-table__status--pending",
    };
  }
  if (practiceStatus === "photo_requested") {
    return {
      label: practiceStatusLabel("photo_requested"),
      className: "yd-tracker-table__status--progress",
    };
  }
  if (item.is_draft) {
    return { label: "Entwurf", className: "yd-tracker-table__status--draft" };
  }
  if (isApprovalPending(item)) {
    return {
      label: "Freigabe ausstehend",
      className: "yd-tracker-table__status--pending",
    };
  }
  if (!item.seen_at || practiceStatus === "new") {
    return { label: "Neu", className: "yd-tracker-table__status--new" };
  }
  if (outboundSentForItem(item).reply) {
    return { label: "Antwort gesendet", className: "yd-tracker-table__status--done" };
  }
  if (item.urgency === "today") {
    return { label: "Zeitnah", className: "yd-tracker-table__status--urgent" };
  }
  const work = trackerInboxWorkType(item);
  return { label: work.headline, className: "yd-tracker-table__status--progress" };
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
  if (item.urgency === "within_24h") {
    return { label: "24 Std.", className: "yd-tracker-inbox-card__priority--high" };
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
      return "Verlaufskontrolle";
    case "recall":
      return "Recall";
    default:
      return "Eingang";
  }
}
