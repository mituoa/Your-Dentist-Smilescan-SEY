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
  specific_person: "Mitarbeitenden",
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
      <p className="text-sm italic leading-5 text-text-tertiary">
        Noch keine Aufgaben. Legen Sie die erste Aufgabe an.
      </p>
    );
  }

  const openTasks = tasks.filter((task) => (task.status ?? "open") === "open");
  const pendingTasks = tasks.filter(
    (task) => (task.status ?? "open") === "pending_review"
  );
  const doneTasks = tasks.filter((task) => (task.status ?? "open") === "done");

  const groupedTasks = [
    {
      id: "open",
      label: "Offen",
      items: openTasks,
      toneClass: "text-text-secondary",
    },
    {
      id: "pending",
      label: "Bestätigung ausstehend",
      items: pendingTasks,
      toneClass: "text-amber-900",
    },
    {
      id: "done",
      label: "Erledigt",
      items: doneTasks,
      toneClass: "text-text-tertiary",
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="space-y-5">
      {groupedTasks.map((group) => (
        <section key={group.id} className="space-y-3">
          <h4
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.08em]",
              group.toneClass
            )}
          >
            {group.label} ({group.items.length})
          </h4>
          <ul className="space-y-2.5">
            {group.items.map((task) => {
              const status = task.status ?? "open";
              const isDone = status === "done";
              const isPendingReview = status === "pending_review";
              const canSubmitHere =
                canCheckOff && status === "open" && !isMutating && !isDone;

              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors sm:px-3.5 sm:py-3",
                    isPendingReview
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-surface-page/60 hover:bg-surface-page/80"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSubmitForReview(task.id)}
                    disabled={!canSubmitHere || isMutating}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:h-4 sm:w-4",
                      canSubmitHere
                        ? "border-border hover:border-brand cursor-pointer"
                        : "border-border/50 cursor-not-allowed"
                    )}
                    title={
                      isDone
                        ? "Erledigt"
                        : isPendingReview
                          ? "Wartet auf ärztliche Bestätigung"
                          : "Als erledigt markieren"
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
                        "text-sm leading-6 sm:text-[0.95rem]",
                        isDone
                          ? "line-through text-text-tertiary"
                          : "text-text-primary"
                      )}
                    >
                      {task.content}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text-tertiary">
                      Zuständig: {RECIPIENT_LABEL[task.recipient_type]}
                      {isPendingReview && (
                        <span className="ml-2 text-amber-800">
                          · ärztliche Bestätigung ausstehend
                        </span>
                      )}
                    </p>
                    {errorById[task.id] && (
                      <p className="mt-1.5 text-xs leading-5 text-danger">
                        {errorById[task.id]}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
