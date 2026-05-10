import { ArrowLeft, Calendar, Clock, FileText, User } from "lucide-react";
import Link from "next/link";

import type { TaskComment, TaskDetail } from "@/lib/queries/task-detail";
import { clinicalCorePanel, clinicalDividerBorder } from "@/lib/pilot-surface";
import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";

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
  /** Back target — `/relay` (Ärzte) or `/my-tasks` (Team). */
  listHref: "/relay" | "/my-tasks";
}

export function TaskDetailView({
  task,
  comments,
  currentUserId,
  isDoctor,
  isMyTask,
  listHref,
}: TaskDetailViewProps) {
  return (
    <div className="min-h-0 flex-1" style={{ background: "#F7F9FC" }}>
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="mx-auto w-full max-w-4xl">
        <Link
          href={listHref}
          className="mb-6 inline-flex min-h-10 items-center gap-1 rounded-lg text-[13px] font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)] sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Zur Aufgabenübersicht
        </Link>

        <div className={`mb-8 p-4 sm:p-5 ${clinicalCorePanel}`}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#0F172A] sm:text-3xl">
                {task.title}
              </h1>
              {task.priority === "important" && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-danger">Wichtig</p>
              )}
            </div>
            <TaskStatusBadge status={task.status} size="md" />
          </div>

          {task.description && (
            <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-[#64748B] sm:text-base">
              {task.description}
            </p>
          )}

          <div
            className={`grid grid-cols-1 gap-2 border-t pt-4 text-sm leading-5 text-[#64748B] sm:grid-cols-2 xl:grid-cols-3 ${clinicalDividerBorder}`}
          >
            <div className="flex items-center gap-1.5">
              Zustellung: {task.receipt_summary.read}/{task.receipt_summary.total} gelesen
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#94A3B8]" strokeWidth={1.75} />
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
            {task.recipient_type === "all_team" && <div>Zugewiesen an gesamtes Team</div>}
            {task.recipient_type === "doctor_only" && <div>Zugewiesen an Arzt</div>}
            {task.submission_id ? (
              <Link
                href={`/inbox/${task.submission_id}`}
                className="flex items-center gap-1.5 break-words rounded-md text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)]"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Patient: {task.submission_patient_name || "Unbekannt"}
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" strokeWidth={1.75} />
                Interne Aufgabe
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" strokeWidth={1.75} />
                Fällig: {new Date(task.due_date).toLocaleDateString("de-DE")}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#94A3B8]" strokeWidth={1.75} />
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
          <div className={`mb-10 p-4 sm:p-5 ${clinicalCorePanel}`}>
            <TaskActions taskId={task.id} status={task.status} isDoctor={isDoctor} isMyTask={isMyTask} />
          </div>
        )}

        <section className={`space-y-6 p-4 sm:p-5 ${clinicalCorePanel}`}>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Kommentare · {comments.length}
          </h2>
          <CommentThread comments={comments} currentUserId={currentUserId} />
          <div className={`border-t pt-4 ${clinicalDividerBorder}`}>
            <CommentForm taskId={task.id} />
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
