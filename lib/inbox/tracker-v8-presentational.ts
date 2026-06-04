/**
 * Tracker V8 — Premium Medical SaaS (Praxis-Queue, Handlungsbedarf, Status)
 */
import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";

export {
  buildTrackerQueueRowMeta,
  computePraxisQueueSummary,
  sortTrackerQueueItems,
  trackerCaseCategory,
  trackerPatientSubtitle,
  trackerQueueReason,
  trackerQueueStatus,
  type PraxisQueueSummary,
  type TrackerQueueTone,
} from "@/lib/inbox/tracker-v7-presentational";

export type TrackerActionTone =
  | "review"
  | "approve"
  | "control"
  | "respond"
  | "schedule"
  | "task"
  | "quiet";

function notesLower(item: EnrichedSubmissionListItem): string {
  return (item.patient_notes ?? "").toLowerCase();
}

/** Kurzes Handlungslabel — sofort erkennbar, was zu tun ist. */
export function trackerActionNeeded(item: EnrichedSubmissionListItem): {
  label: string;
  tone: TrackerActionTone;
} {
  if (item.message_draft_status === "sent") {
    return { label: "—", tone: "quiet" };
  }
  if (!item.seen_at && !item.is_draft) {
    return { label: "Prüfen", tone: "review" };
  }
  if (isApprovalPending(item)) {
    return { label: "Freigeben", tone: "approve" };
  }
  if (item.open_task_count > 0) {
    if (/termin|vereinbar|rückruf/.test(notesLower(item))) {
      return { label: "Termin vereinbaren", tone: "schedule" };
    }
    return { label: "Aufgabe erledigen", tone: "task" };
  }
  if (item.message_draft_status === "approved") {
    return { label: "Antwort senden", tone: "respond" };
  }
  if (item.message_draft_status === "draft") {
    return { label: "Prüfen", tone: "review" };
  }
  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) {
    return { label: "Kontrollieren", tone: "control" };
  }
  if (/termin|vereinbar/.test(notesLower(item))) {
    return { label: "Termin vereinbaren", tone: "schedule" };
  }
  return { label: "Prüfen", tone: "review" };
}

export function trackerV8StatusClass(tone: string): string {
  return `yd-tracker-v8-status--${tone}`;
}

export function trackerV8ActionClass(tone: TrackerActionTone): string {
  return `yd-tracker-v8-action--${tone}`;
}
