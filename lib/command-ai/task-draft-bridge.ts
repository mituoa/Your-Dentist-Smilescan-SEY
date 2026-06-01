const STORAGE_KEY = "yd-command-pending-task";

export type PendingCommandTaskDraft = {
  title: string;
  notes: string;
  dueDate: string | null;
  assigneeHint: string | null;
  savedAt: string;
};

export function stashCommandTaskDraft(draft: PendingCommandTaskDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function consumeCommandTaskDraft(): PendingCommandTaskDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as PendingCommandTaskDraft;
  } catch {
    return null;
  }
}

export function dueDateForHint(hint: "today" | "tomorrow" | "this_week" | null): string | null {
  const d = new Date();
  if (hint === "today") return d.toISOString().slice(0, 10);
  if (hint === "tomorrow") {
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (hint === "this_week") {
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }
  return null;
}
