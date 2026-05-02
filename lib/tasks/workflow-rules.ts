import type { MyTask } from "@/lib/queries/my-tasks";

export type BoardColumnId = "open" | "pending" | "done";
export type TaskDbStatus = "open" | "pending_review" | "done";

interface RuleContext {
  currentUserId: string;
  isDoctor: boolean;
}

export function columnToTaskStatus(column: BoardColumnId): TaskDbStatus {
  if (column === "pending") return "pending_review";
  return column;
}

export function taskStatusToColumn(status: TaskDbStatus): BoardColumnId {
  if (status === "pending_review") return "pending";
  return status;
}

export function canMoveTask(task: MyTask, from: BoardColumnId, to: BoardColumnId, ctx: RuleContext): boolean {
  if (from === to) return true;

  const isInternalSelfTask = task.submission_id === null && task.created_by === ctx.currentUserId;
  if (isInternalSelfTask) {
    return from === "open" && to === "done";
  }

  const isAssignedTask = task.assignee_ids.includes(ctx.currentUserId);
  if (isAssignedTask) {
    return from === "open" && to === "pending";
  }

  if (from === "pending" && to === "done") {
    return ctx.isDoctor && task.created_by === ctx.currentUserId;
  }

  if (ctx.isDoctor && task.created_by === ctx.currentUserId) {
    return (
      (from === "open" && to === "pending") ||
      (from === "open" && to === "done") ||
      (from === "pending" && to === "done")
    );
  }

  return false;
}
