"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitInboxTaskForReview } from "@/app/(protected)/inbox/[id]/actions";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  content: string;
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  done_at: string | null;
  status: "open" | "pending_review" | "done";
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
  const [isMutating, startTransition] = useTransition();
  const router = useRouter();
  const [errorById, setErrorById] = useState<Record<string, string | undefined>>(
    {}
  );

  const handleSubmitForReview = (taskId: string) => {
    setErrorById((prev) => ({ ...prev, [taskId]: undefined }));
    startTransition(async () => {
      const result = await submitInboxTaskForReview(taskId, submissionId);
      if (result.error) {
        setErrorById((prev) => ({ ...prev, [taskId]: result.error }));
      } else {
        router.refresh();
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
        const status = task.status ?? "open";
        const isDone = status === "done";
        const isPendingReview = status === "pending_review";
        const canSubmitHere =
          canCheckOff && status === "open" && !isMutating && !isDone;

        return (
          <li key={task.id} className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => handleSubmitForReview(task.id)}
              disabled={!canSubmitHere || isMutating}
              className={cn(
                "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                canSubmitHere
                  ? "border-border hover:border-brand cursor-pointer"
                  : "border-border/50 cursor-not-allowed"
              )}
              title={
                isDone
                  ? "Erledigt"
                  : isPendingReview
                    ? "Wartet auf Bestätigung"
                    : "Als erledigt melden"
              }
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
            <div className="min-w-0 flex-1">
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
                {isPendingReview && (
                  <span className="ml-2 text-amber-800">· Auf Bestätigung</span>
                )}
              </p>
              {errorById[task.id] && (
                <p className="text-xs text-danger mt-1">{errorById[task.id]}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
