import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";

export type RelayScope = "all" | "mine";

export function taskTouchesUser(task: MyTask, userId: string): boolean {
  if (task.created_by === userId) return true;
  if (task.specific_recipient_id === userId) return true;
  if (task.assignee_ids.includes(userId)) return true;
  return false;
}

export function filterColumnTasks(tasks: MyTask[], userId: string, scope: RelayScope): MyTask[] {
  if (scope === "all") return tasks;
  return tasks.filter((t) => taskTouchesUser(t, userId));
}

export function emailInitials(email: string): string {
  const local = email.split("@")[0]?.trim() || email;
  const parts = local.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

/** Stable pastel for avatar backgrounds from user id */
export function colorForUserId(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 55% 42%)`;
}

export function buildMemberAvatarMap(members: AssignableMember[]): Record<string, { initials: string; color: string }> {
  const map: Record<string, { initials: string; color: string }> = {};
  for (const m of members) {
    map[m.user_id] = {
      initials: emailInitials(m.email),
      color: colorForUserId(m.user_id),
    };
  }
  return map;
}
