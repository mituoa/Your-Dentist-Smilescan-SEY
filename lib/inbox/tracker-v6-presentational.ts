/**
 * Tracker V6 — Präsentation Patient → Vorgang → Verlauf
 * (technisch noch Submission-Zeile; UI spricht Vorgang-Sprache)
 */
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerCaseKind = "new_request" | "follow_up" | "control_trail";

export function trackerCaseKind(item: EnrichedSubmissionListItem): TrackerCaseKind {
  if (item.intake_channel === "follow_up") return "follow_up";
  if (hasPhotoTrail(item)) return "control_trail";
  return "new_request";
}

/** Aktiver Vorgang — Titel in Übersicht und Akte. */
export function trackerCaseTitle(item: EnrichedSubmissionListItem): string {
  const short = deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
    maxLen: 42,
    emptyLabel: "",
  });

  if (!item.seen_at && !item.is_draft && trackerCaseKind(item) === "new_request") {
    return "Neue Anfrage";
  }
  if (item.intake_channel === "follow_up") {
    return short || "Implantat Nachsorge";
  }
  if (hasPhotoTrail(item)) {
    return short || "Kontrollverlauf";
  }
  if (short) return short;
  return "Laufende Anfrage";
}

export type TrackerTodayKpis = {
  total: number;
  newSubmissions: number;
  approvalPending: number;
  followUp: number;
  openTasks: number;
};

function needsAttentionToday(item: EnrichedSubmissionListItem): boolean {
  if (!item.seen_at && !item.is_draft) return true;
  if (isApprovalPending(item)) return true;
  if (item.open_task_count > 0) return true;
  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) return true;
  return false;
}

export function computeTrackerTodayKpis(
  items: EnrichedSubmissionListItem[]
): TrackerTodayKpis {
  const attention = items.filter(needsAttentionToday);
  return {
    total: attention.length,
    newSubmissions: items.filter((i) => !i.seen_at && !i.is_draft).length,
    approvalPending: items.filter(isApprovalPending).length,
    followUp: items.filter(
      (i) => i.intake_channel === "follow_up" || hasPhotoTrail(i)
    ).length,
    openTasks: items.filter((i) => i.open_task_count > 0).length,
  };
}

/** Letzte Aktivität — relativ für die Tabelle. */
export function formatLastActivityRelative(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Gerade eben";
  if (diffMin < 60) return `Vor ${diffMin} Minuten`;

  const todayKey = now.toISOString().slice(0, 10);
  const key = iso.slice(0, 10);
  if (key === todayKey) return "Heute";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return "Gestern";

  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;

  return then.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function urgencyAssessmentDe(urgency: string | null): string {
  if (urgency === "today") return "hohe Dringlichkeit";
  if (urgency === "this_week") return "mittlere Dringlichkeit";
  if (urgency === "not_urgent") return "niedrige Dringlichkeit";
  return "Dringlichkeit noch nicht eingestuft";
}

/** Patientenbericht als kurze Zeilen (kein Prompt-Charakter). */
export function concernLinesFromNotes(notes: string | null, max = 4): string[] {
  if (!notes?.trim()) return [];
  const raw = notes
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && !/^sehr geehrte/i.test(l) && !/^mit freundlichen/i.test(l));
  if (raw.length >= 2) return raw.slice(0, max);
  const sentences = notes
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  return sentences.slice(0, max);
}
