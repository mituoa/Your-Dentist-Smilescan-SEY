import { Check } from "lucide-react";
import Link from "next/link";

import { clinicalCorePanel } from "@/lib/pilot-surface";
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
      open: {
        title: "Keine offenen Aufgaben",
        text: "Aktuell gibt es keine offenen Aufgaben.",
      },
      pending: {
        title: "Keine Aufgaben zur Bestätigung",
        text: "Aktuell wartet keine Aufgabe auf ärztliche Bestätigung.",
      },
      done: {
        title: "Keine erledigten Aufgaben",
        text: "In den letzten 90 Tagen wurde noch keine Aufgabe abgeschlossen.",
      },
    };
    const m = messages[status];
    return (
      <div className={`p-8 text-center sm:p-12 ${clinicalCorePanel}`}>
        <Check className="mx-auto mb-4 h-10 w-10 text-[#2563EB]" strokeWidth={1.5} />
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0F172A]">{m.title}</h2>
        <p className="text-sm leading-6 text-[#64748B]">{m.text}</p>
      </div>
    );
  }

  if (status === "open") {
    const groups = groupTasksByUrgency(tasks);
    return (
      <div className="space-y-7 sm:space-y-9">
        {groups.map((group) => (
          <section key={group.urgency} className="space-y-2.5">
            <h2
              className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
                group.urgency === "overdue" ? "text-danger" : "text-[#94A3B8]"
              }`}
            >
              {group.label} · {group.tasks.length}
            </h2>
            <div className={`overflow-hidden ${clinicalCorePanel}`}>
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
    <div className={`overflow-hidden ${clinicalCorePanel}`}>
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
      className={`yd-inbox-row-ambient yd-ambient-surface group grid grid-cols-1 gap-2 border-b border-[rgba(15,23,42,0.06)] px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(43,111,232,0.25)] last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-4 sm:py-3.5 ${
        urgency === "overdue" ? "bg-danger/5" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2.5">
          <h3 className="truncate break-words text-sm font-semibold leading-6 text-[#0F172A] sm:text-[0.98rem]">
            {task.title}
          </h3>
          {task.priority === "important" && (
            <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-danger">
              Wichtig
            </span>
          )}
          {task.status !== "open" && <TaskStatusBadge status={task.status} />}
        </div>
        <div className="break-words text-sm leading-5 text-[#64748B]">
          {task.submission_id
            ? `Patient: ${task.submission_patient_name || "Unbekannt"}`
            : "Interne Aufgabe"}
          {task.due_date &&
            ` · Fällig ${new Date(task.due_date).toLocaleDateString("de-DE")}`}
        </div>
      </div>
      <div className="text-xs font-medium tabular-nums text-[#94A3B8] sm:text-right">
        {new Date(task.created_at).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </div>
      <div className="yd-ambient-preview col-span-full space-y-1 border-t border-[rgba(180,198,218,0.3)] pt-2 text-[11px] text-[#5E7389] sm:col-span-2">
        <p>
          <span className="font-medium text-[#3D5266]">Workflow: </span>
          {task.status === "open" ? "Offen" : task.status === "pending_review" ? "Zur Bestätigung" : "Erledigt"}
        </p>
        {task.due_date ? (
          <p>
            <span className="font-medium text-[#3D5266]">Frist: </span>
            {new Date(task.due_date).toLocaleDateString("de-DE", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
        ) : (
          <p>
            <span className="font-medium text-[#3D5266]">Frist: </span>
            Keine Frist gesetzt
          </p>
        )}
        <p>
          <span className="font-medium text-[#3D5266]">Empfänger: </span>
          {task.recipient_type === "doctor_only"
            ? "Arzt"
            : task.recipient_type === "specific_person"
              ? "Zugewiesene Person"
              : "Praxis-Team"}
        </p>
      </div>
    </Link>
  );
}
