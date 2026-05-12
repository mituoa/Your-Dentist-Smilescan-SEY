import type { MyTask } from "@/lib/queries/my-tasks";

/**
 * **Workflow-Regeln Kanban / Relay** — **Punkt 10 (Security):** Eine **Quelle der Wahrheit** für erlaubte
 * Statusübergänge. `moveTaskStatusByDrag` in `my-tasks/actions` **muss** dieselbe `canMoveTask`-Logik nutzen
 * (Import); UI (`CardBoard`) darf nur **vorschlagen**, was hier `true` ist — Server entscheidet erneut am **DB-Stand**.
 * **Punkt 11 (MVP):** Feste Rollen-/Status-Regeln im Code — **keine** konfigurierbaren Workflows oder zusätzlichen
 * Spalten; Scope s. `relay/page.tsx` (Punkt 11).
 * **Punkt 12:** Neue Übergangsregeln = **Future** mit Produktbeschluss und Vertrags-Update (`relay/page.tsx` Punkt 12),
 * **kein** schleichendes Nachziehen im Zuge von „Board-Verbesserungen“.
 * **Punkt 13:** Regeln nur bei **fachlich nötigem** Fix oder nachgelagertem Roadmap-Beschluss anpassen — P0-Stabilität
 * vor Erweiterung; s. `relay/page.tsx` (Punkt 13).
 */
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
