export type TaskRecurrenceType = "once" | "daily" | "weekly" | "monthly" | "custom";
export type TaskRemindBefore = "same_day" | "one_day" | "one_week";

export const RECURRENCE_LABELS: Record<TaskRecurrenceType, string> = {
  once: "Einmalig",
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  custom: "Eigener Rhythmus",
};

/** Kurz-Badge in Listen (Relay-Karten). */
export function recurrenceBadgeLabel(type: TaskRecurrenceType): string | null {
  if (type === "once") return null;
  if (type === "custom") return "Wiederkehrend";
  return RECURRENCE_LABELS[type].toLowerCase();
}

export function parseRecurrenceType(raw: string | null | undefined): TaskRecurrenceType {
  const v = (raw || "once").trim().toLowerCase();
  if (v === "daily" || v === "weekly" || v === "monthly" || v === "custom") return v;
  return "once";
}

export function parseRemindBefore(raw: string | null | undefined): TaskRemindBefore | null {
  const v = (raw || "").trim().toLowerCase();
  if (v === "same_day" || v === "one_day" || v === "one_week") return v;
  return null;
}

export function computeNextDueDate(
  from: Date,
  recurrence: TaskRecurrenceType,
  intervalDays: number | null
): Date | null {
  if (recurrence === "once") return null;
  const next = new Date(from);
  if (recurrence === "daily") {
    next.setDate(next.getDate() + 1);
    return next;
  }
  if (recurrence === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }
  if (recurrence === "monthly") {
    next.setMonth(next.getMonth() + 1);
    return next;
  }
  if (recurrence === "custom" && intervalDays && intervalDays > 0) {
    next.setDate(next.getDate() + intervalDays);
    return next;
  }
  return null;
}

export function computeRemindAt(
  dueDate: Date | null,
  remindBefore: TaskRemindBefore | null,
  remindSelf: boolean,
  remindAssignees: boolean
): string | null {
  if (!dueDate || (!remindSelf && !remindAssignees) || !remindBefore) return null;
  const remind = new Date(dueDate);
  remind.setHours(8, 0, 0, 0);
  if (remindBefore === "one_day") remind.setDate(remind.getDate() - 1);
  if (remindBefore === "one_week") remind.setDate(remind.getDate() - 7);
  return remind.toISOString();
}
