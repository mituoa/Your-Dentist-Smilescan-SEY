"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { moveTaskStatusByDrag } from "@/app/(protected)/my-tasks/actions";
import { YdInlineBusy } from "@/components/design-system/yd-skeleton";
import type { MyTask } from "@/lib/queries/my-tasks";
import { taskMutationClientFailureMessage } from "@/lib/tasks/task-mutation-client-error";
import {
  canMoveTask,
  type BoardColumnId,
  taskStatusToColumn,
} from "@/lib/tasks/workflow-rules";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { column: BoardColumnId; label: string }[] = [
  { column: "open", label: "Offen" },
  { column: "pending", label: "In Bearbeitung" },
  { column: "done", label: "Erledigt" },
];

type TaskStatusControlProps = {
  taskId: string;
  status: MyTask["status"];
  task: Pick<
    MyTask,
    | "created_by"
    | "assignee_ids"
    | "specific_recipient_id"
    | "recipient_type"
    | "submission_id"
    | "recurrence_type"
  >;
  currentUserId: string;
  isDoctor: boolean;
};

export function TaskStatusControl({
  taskId,
  status,
  task,
  currentUserId,
  isDoctor,
}: TaskStatusControlProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentColumn = taskStatusToColumn(status);

  const ruleTask: MyTask = {
    id: taskId,
    title: "",
    raw_title: null,
    description: null,
    due_date: null,
    priority: "normal",
    recipient_type: task.recipient_type,
    specific_recipient_id: task.specific_recipient_id,
    assignee_ids: task.assignee_ids,
    created_by: task.created_by,
    status,
    done_at: null,
    done_by: null,
    done_by_email: null,
    recurrence_type: task.recurrence_type,
    submitted_for_review_at: null,
    sort_order: 0,
    completed: status === "done",
    created_at: "",
    submission_id: task.submission_id,
    submission_patient_name: null,
    submission_created_at: null,
    delivery_status: "none",
    receipt_summary: { total: 0, sent: 0, delivered: 0, read: 0 },
  };

  const allowed = STATUS_OPTIONS.filter((opt) =>
    canMoveTask(ruleTask, currentColumn, opt.column, { currentUserId, isDoctor })
  );

  if (status === "done" || allowed.length <= 1) {
    return null;
  }

  const onSelect = (column: BoardColumnId) => {
    if (column === currentColumn || isPending) return;
    startTransition(async () => {
      try {
        const result = await moveTaskStatusByDrag(taskId, column);
        if (result.error || result.notAllowed) return;
        router.refresh();
      } catch {
        /* moveTaskStatusByDrag liefert Fehler im Result — still refresh vermeiden */
      }
    });
  };

  return (
    <fieldset
      disabled={isPending}
      aria-busy={isPending}
      className="mb-4 min-w-0 border-0 p-0 disabled:opacity-60"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
        Status
      </p>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Aufgabenstatus ändern"
      >
        {STATUS_OPTIONS.map((opt) => {
          const canSelect = allowed.some((a) => a.column === opt.column);
          if (!canSelect) return null;
          const active = opt.column === currentColumn;
          return (
            <button
              key={opt.column}
              type="button"
              disabled={active || isPending}
              onClick={() => onSelect(opt.column)}
              className={cn(
                "inline-flex min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#1a4f9c] text-white shadow-sm"
                  : "border border-[rgba(15,23,42,0.1)] bg-white text-[#475569] hover:border-[rgba(26,79,156,0.2)] hover:text-[#1a4f9c]"
              )}
            >
              {active && isPending ? <YdInlineBusy inverse /> : opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
