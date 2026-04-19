"use client";

import { useState, useTransition } from "react";
import { toggleTaskDone } from "@/app/(protected)/inbox/[id]/actions";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  content: string;
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  done_at: string | null;
}

interface TaskListProps {
  tasks: Task[];
  canCheckOff: boolean;
  submissionId: string;
}

const RECIPIENT_LABEL = {
  doctor_only: "Arzt",
  all_team: "Team",
  specific_person: "Person",
};

export function TaskList({ tasks, canCheckOff, submissionId }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggle = (taskId: string, currentDone: boolean) => {
    if (!canCheckOff) return;
    const newDone = !currentDone;
    setOptimisticDone((prev) => ({ ...prev, [taskId]: newDone }));
    startTransition(async () => {
      const result = await toggleTaskDone(taskId, submissionId);
      if (result.error) {
        setOptimisticDone((prev) => ({ ...prev, [taskId]: currentDone }));
      }
    });
  };

  if (tasks.length === 0) {
    return (
      <p className="text-xs text-text-tertiary italic">Noch keine Aufgaben.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const isDone =
          optimisticDone[task.id] !== undefined
            ? optimisticDone[task.id]
            : !!task.done_at;

        return (
          <li key={task.id} className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => handleToggle(task.id, isDone)}
              disabled={!canCheckOff || isPending}
              className={cn(
                "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                canCheckOff
                  ? "border-border hover:border-brand cursor-pointer"
                  : "border-border/50 cursor-not-allowed"
              )}
            >
              {isDone && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="text-brand"
                >
                  <path
                    d="M1 5L4 8L9 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm leading-snug",
                  isDone
                    ? "line-through text-text-tertiary"
                    : "text-text-primary"
                )}
              >
                {task.content}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                → {RECIPIENT_LABEL[task.recipient_type]}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
