import type { RelayKanbanColumnId } from "@/lib/relay/relay-work-center-model";
import type { BoardColumnId } from "@/lib/tasks/workflow-rules";

export function kanbanColumnToBoardColumn(column: RelayKanbanColumnId): BoardColumnId {
  if (column === "done") return "done";
  if (column === "in_progress") return "pending";
  return "open";
}

export function boardColumnToKanbanColumn(column: BoardColumnId): RelayKanbanColumnId {
  if (column === "done") return "done";
  if (column === "pending") return "in_progress";
  return "decision";
}

export function parseKanbanMobileColumn(value: string | null): RelayKanbanColumnId {
  if (value === "in_progress" || value === "done") return value;
  return "decision";
}
