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

  const isCreator = task.created_by === ctx.currentUserId;
  const isAssigned =
    task.assignee_ids.includes(ctx.currentUserId) ||
    task.specific_recipient_id === ctx.currentUserId;
  const isDoctorReviewer =
    ctx.isDoctor &&
    (task.recipient_type === "doctor_only" || isCreator || task.status === "pending_review");

  const isInternalSelfTask =
    task.submission_id === null && isCreator && task.assignee_ids.length === 0;

  if (isInternalSelfTask) {
    return (
      (from === "open" && (to === "pending" || to === "done")) ||
      (from === "pending" && (to === "open" || to === "done"))
    );
  }

  const canParticipate = isAssigned || isCreator || isDoctorReviewer;
  if (!canParticipate) return false;

  if ((from === "open" && to === "pending") || (from === "pending" && to === "open")) {
    return true;
  }

  if (from === "pending" && to === "done") {
    return ctx.isDoctor;
  }

  if (from === "open" && to === "done") {
    if (!canParticipate) return false;
    if (ctx.isDoctor) return true;
    return isAssigned;
  }

  if (from === "done" && to === "open") {
    return ctx.isDoctor;
  }

  if (from === "done" && to === "pending") {
    return ctx.isDoctor;
  }

  return false;
}
