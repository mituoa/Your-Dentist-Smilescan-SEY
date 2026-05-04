import { ArrowLeft, Calendar, Clock, FileText, User } from "lucide-react";
import Link from "next/link";

import type { TaskComment, TaskDetail } from "@/lib/queries/task-detail";
import { pilotGlassPanel } from "@/lib/pilot-surface";

import { CommentForm } from "./comment-form";
import { CommentThread } from "./comment-thread";
import { TaskActions } from "./task-actions";
import { TaskStatusBadge } from "./task-status-badge";

interface TaskDetailViewProps {
  task: TaskDetail;
  comments: TaskComment[];
  currentUserId: string;
  isDoctor: boolean;
  isMyTask: boolean;
}

export function TaskDetailView({
  task,
  comments,
  currentUserId,
  isDoctor,
  isMyTask,
}: TaskDetailViewProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/relay"
        className="mb-6 inline-flex items-center gap-1 rounded-md text-xs text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:mb-8"
      >
        <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
        Zur Aufgabenübersicht
      </Link>

      <div className={`mb-8 p-4 sm:p-5 ${pilotGlassPanel}`}>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-light leading-tight tracking-tight text-text-primary sm:text-3xl">
              {task.title}
            </h1>
            {task.priority === "important" && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-danger">
                Wichtig
              </p>
            )}
          </div>
          <TaskStatusBadge status={task.status} size="md" />
        </div>

        {task.description && (
          <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-text-secondary sm:text-base">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 border-t border-border pt-4 text-sm leading-5 text-text-secondary sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex items-center gap-1.5">
            Zustellung: {task.receipt_summary.read}/{task.receipt_summary.total} gelesen
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" strokeWidth={1.75} />
            Erstellt von {task.created_by_email || "Unbekannt"}
          </div>
          {task.recipient_type === "specific_person" &&
            (task.assignee_emails.length > 0 || task.specific_recipient_email) && (
              <div>
                Zugewiesen an{" "}
                {task.assignee_emails.length > 0
                  ? task.assignee_emails.join(", ")
                  : task.specific_recipient_email}
              </div>
            )}
          {task.recipient_type === "all_team" && (
            <div>Zugewiesen an gesamtes Team</div>
          )}
          {task.recipient_type === "doctor_only" && <div>Zugewiesen an Arzt</div>}
          {task.submission_id ? (
            <Link
              href={`/inbox/${task.submission_id}`}
              className="flex items-center gap-1.5 break-words rounded-sm transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <FileText className="w-3 h-3" strokeWidth={1.75} />
              Patient: {task.submission_patient_name || "Unbekannt"}
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3" strokeWidth={1.75} />
              Interne Aufgabe
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" strokeWidth={1.75} />
              Fällig: {new Date(task.due_date).toLocaleDateString("de-DE")}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" strokeWidth={1.75} />
            Erstellt{" "}
            {new Date(task.created_at).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {task.status !== "done" && (
        <div className={`mb-10 p-4 sm:p-5 ${pilotGlassPanel}`}>
          <TaskActions
            taskId={task.id}
            status={task.status}
            isDoctor={isDoctor}
            isMyTask={isMyTask}
          />
        </div>
      )}

      <section className={`space-y-6 p-4 sm:p-5 ${pilotGlassPanel}`}>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Kommentare · {comments.length}
        </h2>
        <CommentThread comments={comments} currentUserId={currentUserId} />
        <div className="border-t border-border pt-4">
          <CommentForm taskId={task.id} />
        </div>
      </section>
    </div>
  );
}
