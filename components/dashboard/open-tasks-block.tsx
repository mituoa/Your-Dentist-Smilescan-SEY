"use client";

import { useState, useTransition } from "react";
import { StatBlock } from "./stat-block";
import { toggleTaskDone } from "@/lib/queries/tasks";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  content: string;
  submission_id: string | null;
  created_at: string;
}

interface OpenTasksBlockProps {
  tasks: Task[];
  canCheckOff: boolean;
}

export function OpenTasksBlock({ tasks, canCheckOff }: OpenTasksBlockProps) {
  const [optimisticDone, setOptimisticDone] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string) => {
    if (!canCheckOff) return;

    setOptimisticDone((prev) => new Set(prev).add(taskId));

    startTransition(async () => {
      const result = await toggleTaskDone(taskId, true);
      if (result.error) {
        setOptimisticDone((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }
    });
  };

  const visibleTasks = tasks.filter((t) => !optimisticDone.has(t.id)).slice(0, 5);

  return (
    <StatBlock
      label="Offene Aufgaben"
      link={
        tasks.length > 5 ? { href: "/inbox", text: "Alle sehen" } : undefined
      }
    >
      {visibleTasks.length === 0 ? (
        <div className="flex items-center h-full">
          <p className="text-sm text-text-tertiary">
            {tasks.length === 0
              ? "Keine offenen Aufgaben."
              : "Alle Aufgaben erledigt."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibleTasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2.5 group">
              <button
                type="button"
                onClick={() => handleToggle(task.id)}
                disabled={!canCheckOff || isPending}
                className={cn(
                  "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                  canCheckOff
                    ? "border-border hover:border-brand cursor-pointer"
                    : "border-border/50 cursor-not-allowed"
                )}
                aria-label="Aufgabe abhaken"
              >
                {optimisticDone.has(task.id) && (
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
              <span
                className={cn(
                  "text-sm text-text-primary leading-snug",
                  optimisticDone.has(task.id) && "line-through text-text-tertiary"
                )}
              >
                {task.content}
              </span>
            </li>
          ))}
        </ul>
      )}
    </StatBlock>
  );
}
