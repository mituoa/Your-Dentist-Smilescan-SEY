import type { MyTask } from "@/lib/queries/my-tasks";

export type KanbanDueTone = "overdue" | "today" | "upcoming" | "none";

function isDueToday(dueDate: string): boolean {
  const due = new Date(`${dueDate}T12:00:00`);
  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

function isOverdue(dueDate: string): boolean {
  const due = new Date(`${dueDate}T23:59:59`);
  return due.getTime() < Date.now();
}

/** Fälligkeits-Anzeige für Kanban-Karten. */
export function formatKanbanDueMeta(task: MyTask | undefined): {
  dateLabel: string | null;
  dueTone: KanbanDueTone;
} {
  if (!task?.due_date || task.status === "done") {
    return { dateLabel: null, dueTone: "none" };
  }

  const dueDate = task.due_date;
  const formatted = new Date(`${dueDate}T12:00:00`).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });

  if (isOverdue(dueDate)) {
    return { dateLabel: `Überfällig · ${formatted}`, dueTone: "overdue" };
  }
  if (isDueToday(dueDate)) {
    return { dateLabel: `Heute · ${formatted}`, dueTone: "today" };
  }
  return { dateLabel: formatted, dueTone: "upcoming" };
}
