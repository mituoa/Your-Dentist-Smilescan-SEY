import {
  intakeSubjectLine,
  patientDisplayName,
} from "@/lib/dashboard/atlas-mobile-helpers";
import type { OpenTaskRow, SubmissionPreviewRow } from "@/lib/queries/dashboard";

export type PriorityLevel = "urgent" | "waiting";

export type PriorityFeedItem = {
  id: string;
  level: PriorityLevel;
  patientName: string;
  subject: string;
  detail?: string;
  aiLine?: string;
  actionLabel: string;
  href: string;
};

export function buildPriorityFeed(
  previewRows: SubmissionPreviewRow[] | null,
  openTasks: OpenTaskRow[] | null
): PriorityFeedItem[] {
  const items: PriorityFeedItem[] = [];
  const rows = [...(previewRows ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const row of rows.filter((r) => !r.seen_at).slice(0, 4)) {
    items.push({
      id: `sub-${row.id}`,
      level: "urgent",
      patientName: patientDisplayName(row),
      subject: intakeSubjectLine(row),
      detail: "Fotos · Anliegen eingegangen",
      aiLine: "KI-Vorschlag bereit",
      actionLabel: "Prüfen",
      href: `/inbox/${row.id}`,
    });
  }

  for (const row of rows.filter((r) => r.seen_at).slice(0, 2)) {
    items.push({
      id: `sub-seen-${row.id}`,
      level: "waiting",
      patientName: patientDisplayName(row),
      subject: intakeSubjectLine(row),
      aiLine: "Antwort vorbereitet",
      actionLabel: "Öffnen",
      href: `/inbox/${row.id}`,
    });
  }

  if (items.length === 0 && openTasks && openTasks.length > 0) {
    const task = openTasks[0];
    items.push({
      id: `task-${task.id}`,
      level: "waiting",
      patientName: "Aufgabe",
      subject: task.title?.trim() || task.content?.trim() || "Offener Schritt",
      actionLabel: "Öffnen",
      href: `/my-tasks/${task.id}`,
    });
  }

  return items.slice(0, 6);
}

export function buildCommandSuggestions(
  previewRows: SubmissionPreviewRow[] | null,
  openTaskCount: number
): string[] {
  const suggestions: string[] = [];
  const unread = previewRows?.filter((r) => !r.seen_at) ?? [];
  const first = unread[0];

  if (first) {
    const name = patientDisplayName(first);
    suggestions.push(`${name} antworten`);
    suggestions.push(`Terminvorschlag für ${name.split(" ").pop() ?? name}`);
  }

  if (openTaskCount > 0) {
    suggestions.push("Lisa an Rückruf erinnern");
  }

  suggestions.push("Heutige Eingänge zusammenfassen");

  return [...new Set(suggestions)].slice(0, 4);
}
