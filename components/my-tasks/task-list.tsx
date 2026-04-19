import { Check } from "lucide-react";
import Link from "next/link";

import { groupTasksByUrgency } from "@/lib/task-grouping";
import type { MyTask } from "@/lib/queries/my-tasks";

import { TaskStatusBadge } from "./task-status-badge";

interface TaskListProps {
  tasks: MyTask[];
  status: "open" | "pending" | "done";
}

export function TaskList({ tasks, status }: TaskListProps) {
  if (tasks.length === 0) {
    const messages = {
      open: { title: "Keine offenen Aufgaben", text: "Alles erledigt für jetzt." },
      pending: {
        title: "Keine zu bestätigenden Aufgaben",
        text: "Keine Aufgaben warten auf Bestätigung.",
      },
      done: {
        title: "Keine erledigten Aufgaben",
        text: "In den letzten 90 Tagen wurde noch nichts abgeschlossen.",
      },
    };
    const m = messages[status];
    return (
      <div className="border border-border rounded-lg p-12 text-center bg-surface-card">
        <Check className="w-10 h-10 text-brand mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="font-serif text-2xl font-light mb-2">{m.title}</h2>
        <p className="text-text-secondary text-sm">{m.text}</p>
      </div>
    );
  }

  if (status === "open") {
    const groups = groupTasksByUrgency(tasks);
    return (
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.urgency}>
            <h2
              className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-3 ${
                group.urgency === "overdue"
                  ? "text-danger"
                  : "text-text-tertiary"
              }`}
            >
              {group.label} · {group.tasks.length}
            </h2>
            <div className="border-t border-border">
              {group.tasks.map((task) => (
                <TaskRow key={task.id} task={task} urgency={group.urgency} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskRow({
  task,
  urgency,
}: {
  task: MyTask;
  urgency?: "overdue" | "today" | "tomorrow" | "week" | "later" | "no-date";
}) {
  return (
    <Link
      href={`/my-tasks/${task.id}`}
      className={`flex items-center justify-between gap-4 py-4 border-b border-border hover:bg-surface-card transition-colors -mx-2 px-2 rounded ${
        urgency === "overdue" ? "bg-danger/5" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.status !== "open" && <TaskStatusBadge status={task.status} />}
        </div>
        <div className="text-xs text-text-tertiary">
          Patient: {task.submission_patient_name || "—"}
          {task.due_date &&
            ` · Fällig ${new Date(task.due_date).toLocaleDateString("de-DE")}`}
        </div>
      </div>
    </Link>
  );
}
