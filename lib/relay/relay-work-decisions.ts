import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { resolveRelayWorkObjectType } from "@/lib/relay/relay-work-object";
import type { JournalEntry } from "@/lib/types/journal-entry";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";

export type RelayDecisionOption = {
  id: string;
  label: string;
  href?: string;
  variant: "primary" | "outline";
};

export function resolveRelayWorkDecisions(
  row: RelayWorkRow,
  options: {
    task?: MyTask;
    journal?: JournalEntry;
    conversation?: RelayConversationRow;
    messageDraftStatus?: MessageDraftListStatus;
  }
): RelayDecisionOption[] {
  const { task, journal, conversation, messageDraftStatus } = options;
  const objectType = resolveRelayWorkObjectType(row, {
    task,
    journal,
    messageDraftStatus,
  });

  const journalId = journal?.id ?? (row.kind === "journal" ? row.id.replace(/^journal-/, "") : null);
  const journalHref = journalId ? `/journal/${journalId}/edit` : null;
  const taskHref = task ? `/my-tasks/${task.id}` : row.href;
  const inboxHref = task?.submission_id ? `/inbox/${task.submission_id}` : null;

  if (objectType === "journal_freigabe" && journalHref) {
    return [
      { id: "approve", label: "Freigeben", href: journalHref, variant: "primary" },
      { id: "revise", label: "Änderung anfordern", href: journalHref, variant: "outline" },
      { id: "open-journal", label: "Im Journal öffnen", href: journalHref, variant: "outline" },
    ];
  }

  if (objectType === "patientenanfrage" || objectType === "patientenantwort") {
    const primaryHref = inboxHref ?? taskHref;
    return [
      { id: "reply", label: "Antwort senden", href: primaryHref, variant: "primary" },
      { id: "appointment", label: "Termin anbieten", href: primaryHref, variant: "outline" },
      { id: "question", label: "Rückfrage stellen", href: taskHref, variant: "outline" },
    ];
  }

  if (objectType === "routine") {
    return [
      { id: "open", label: "Routine öffnen", href: taskHref, variant: "primary" },
      { id: "done", label: "Erledigt", href: taskHref, variant: "outline" },
    ];
  }

  if (objectType === "uebergabe") {
    const href =
      conversation && row.kind === "message"
        ? `/relay?bereich=teamwork&item=${row.id}`
        : taskHref;
    return [
      { id: "reply", label: "Antworten", href, variant: "primary" },
      { id: "forward", label: "Weitergeben", href: taskHref, variant: "outline" },
    ];
  }

  if (objectType === "entscheidung" && task) {
    return [
      { id: "decide", label: row.actionLabel || "Entscheiden", href: taskHref, variant: "primary" },
      { id: "revise", label: "Änderung anfordern", href: taskHref, variant: "outline" },
      ...(inboxHref
        ? [{ id: "tracker", label: "Fall im Tracker", href: inboxHref, variant: "outline" as const }]
        : []),
    ];
  }

  if (task) {
    return [
      { id: "done", label: "Erledigt", href: taskHref, variant: "primary" },
      { id: "forward", label: "Weitergeben", href: taskHref, variant: "outline" },
      ...(task.due_date
        ? [{ id: "due", label: "Fälligkeit ändern", href: taskHref, variant: "outline" as const }]
        : []),
    ];
  }

  return [{ id: "open", label: row.actionLabel || "Bearbeiten", href: row.href, variant: "primary" }];
}
