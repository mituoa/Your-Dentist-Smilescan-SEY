import { getContentTypeLabel, inferContentType } from "@/lib/journal/content-categories";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { inferTrackerRecommendation } from "@/lib/relay/relay-ops-status";
import { resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type RelayWorkObjectType =
  | "journal_freigabe"
  | "patientenanfrage"
  | "patientenantwort"
  | "teamaufgabe"
  | "routine"
  | "uebergabe"
  | "entscheidung";

export const RELAY_WORK_OBJECT_LABELS: Record<RelayWorkObjectType, string> = {
  journal_freigabe: "Journal-Freigabe",
  patientenanfrage: "Patientenanfrage",
  patientenantwort: "Patientenantwort",
  teamaufgabe: "Teamaufgabe",
  routine: "Routine",
  uebergabe: "Übergabe",
  entscheidung: "Entscheidung",
};

export function formatRelayWaitingLabel(timeLabel: string, statusLabel?: string): string {
  if (!timeLabel) return statusLabel ?? "";
  if (timeLabel === "gerade eben") return "gerade eingegangen";
  if (timeLabel.startsWith("vor ")) return `wartet seit ${timeLabel.slice(4)}`;
  if (timeLabel === "gestern") return "wartet seit gestern";
  if (/^Heute|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag/i.test(timeLabel)) {
    return `${timeLabel.toLowerCase()} fällig`;
  }
  if (timeLabel === "Überfällig") return "überfällig";
  return `wartet seit ${timeLabel}`;
}

export function resolveRelayWorkObjectType(
  row: RelayWorkRow,
  options?: {
    task?: MyTask;
    journal?: JournalEntry;
    messageDraftStatus?: MessageDraftListStatus;
  }
): RelayWorkObjectType {
  const { task, journal, messageDraftStatus } = options ?? {};

  if (row.kind === "journal" || journal) return "journal_freigabe";

  if (row.kind === "message") return "uebergabe";

  if (task) {
    if (task.recurrence_type !== "once") return "routine";
    if (task.submission_id) {
      if (messageDraftStatus === "draft" || messageDraftStatus === "approved") {
        return "patientenantwort";
      }
      return "patientenanfrage";
    }
    if (row.typeLabel === "Übergabe") return "uebergabe";
    if (
      task.status === "pending_review" ||
      task.recipient_type === "doctor_only" ||
      resolveRelayTaskCategory(task) === "clinical_decision"
    ) {
      return "entscheidung";
    }
    return "teamaufgabe";
  }

  if (row.typeLabel === "Routine") return "routine";
  if (row.typeLabel === "Übergabe") return "uebergabe";
  if (row.typeLabel === "Freigabe") return "journal_freigabe";
  if (row.statusLabel.toLowerCase().includes("entscheidung")) return "entscheidung";
  return "teamaufgabe";
}

function truncateForTitle(text: string | null | undefined, maxLength = 64): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function enrichRelayWorkRowDisplay(
  row: RelayWorkRow,
  options?: {
    task?: MyTask;
    journal?: JournalEntry;
    messageDraftStatus?: MessageDraftListStatus;
  }
): RelayWorkRow {
  const { task, journal, messageDraftStatus } = options ?? {};
  const objectType = resolveRelayWorkObjectType(row, options);
  const workTypeLabel = RELAY_WORK_OBJECT_LABELS[objectType];

  if (journal) {
    const contentType = inferContentType(journal);
    const typeLabel = getContentTypeLabel(contentType);
    const ownTitle = journal.title?.trim();
    const excerpt = journal.excerpt?.trim();
    const title = ownTitle || truncateForTitle(excerpt) || typeLabel;
    const markdown = journal.content_markdown?.trim();
    const sectionCount = markdown ? markdown.split(/\n#{1,3}\s+/).length : 0;
    const sectionHint =
      sectionCount > 1
        ? `${Math.max(1, sectionCount - 1)} Abschnitte ergänzt`
        : ownTitle
          ? excerpt || typeLabel
          : "Entwurf — noch ohne Titel";

    return {
      ...row,
      workTypeLabel,
      primaryLabel: title,
      concernLine: sectionHint,
      waitingLabel: formatRelayWaitingLabel(row.timeLabel, row.statusLabel),
      typeLabel: typeLabel,
    };
  }

  if (task) {
    const patient = task.submission_patient_name?.trim();
    const recommendation = task.submission_id
      ? inferTrackerRecommendation(task.title, task.description)
      : null;
    const concern =
      recommendation ??
      task.description?.trim().split("\n")[0]?.trim() ??
      row.context;

    let primaryLabel = task.title;
    if (objectType === "patientenanfrage" || objectType === "patientenantwort") {
      primaryLabel = patient || task.title;
    }

    return {
      ...row,
      workTypeLabel,
      primaryLabel,
      concernLine: concern,
      waitingLabel: formatRelayWaitingLabel(row.timeLabel, row.dueLabel ?? row.statusLabel),
    };
  }

  return {
    ...row,
    workTypeLabel,
    concernLine: row.context || row.primaryLabel,
    waitingLabel: formatRelayWaitingLabel(row.timeLabel, row.statusLabel),
  };
}
