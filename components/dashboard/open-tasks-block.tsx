"use client";

import Link from "next/link";

import { StatBlock } from "./stat-block";

interface Task {
  id: string;
  content: string;
  submission_id: string | null;
  created_at: string;
}

interface OpenTasksBlockProps {
  tasks: Task[];
}

export function OpenTasksBlock({ tasks }: OpenTasksBlockProps) {
  const visibleTasks = tasks.slice(0, 5);

  return (
    <StatBlock
      label="Offene Aufgaben"
      link={
        tasks.length > 5 ? { href: "/my-tasks", text: "Alle sehen" } : undefined
      }
    >
      {visibleTasks.length === 0 ? (
        <div className="flex items-center h-full">
          <p className="text-sm text-text-tertiary">Keine offenen Aufgaben.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/my-tasks/${task.id}`}
                className="text-sm text-text-primary leading-snug hover:text-brand transition-colors block"
              >
                {task.content}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StatBlock>
  );
}
