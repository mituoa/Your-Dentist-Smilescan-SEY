import type { MyTask } from "@/lib/queries/my-tasks";

export type TaskGroup = {
  label: string;
  urgency: "overdue" | "today" | "tomorrow" | "week" | "later" | "no-date";
  tasks: MyTask[];
};

/**
 * Groups tasks by due-date urgency. Without `due_date` on tasks, everything
 * lands in "Ohne Fälligkeit" (sorted by caller / query).
 * TODO: extend when `tasks.due_date` is added.
 */
export function groupTasksByUrgency(tasks: MyTask[]): TaskGroup[] {
  const withDue = tasks.filter((t) => t.due_date);
  const noDue = tasks.filter((t) => !t.due_date);

  if (withDue.length === 0) {
    if (noDue.length === 0) return [];
    return [
      {
        label: "Ohne Fälligkeit",
        urgency: "no-date",
        tasks: noDue,
      },
    ];
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const groups: Record<TaskGroup["urgency"], MyTask[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    week: [],
    later: [],
    "no-date": [...noDue],
  };

  for (const t of withDue) {
    if (!t.due_date) continue;
    const due = new Date(t.due_date);
    if (due < today) {
      groups.overdue.push(t);
    } else if (due < tomorrow) {
      groups.today.push(t);
    } else if (due < new Date(tomorrow.getTime() + 86400000)) {
      groups.tomorrow.push(t);
    } else if (due < weekEnd) {
      groups.week.push(t);
    } else {
      groups.later.push(t);
    }
  }

  const result: TaskGroup[] = [];
  if (groups.overdue.length)
    result.push({
      label: "Überfällig",
      urgency: "overdue",
      tasks: groups.overdue,
    });
  if (groups.today.length)
    result.push({ label: "Heute", urgency: "today", tasks: groups.today });
  if (groups.tomorrow.length)
    result.push({
      label: "Morgen",
      urgency: "tomorrow",
      tasks: groups.tomorrow,
    });
  if (groups.week.length)
    result.push({
      label: "Diese Woche",
      urgency: "week",
      tasks: groups.week,
    });
  if (groups.later.length)
    result.push({ label: "Später", urgency: "later", tasks: groups.later });
  if (groups["no-date"].length)
    result.push({
      label: "Ohne Fälligkeit",
      urgency: "no-date",
      tasks: groups["no-date"],
    });

  return result;
}
