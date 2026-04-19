import { ArrowLeft, Calendar, Clock, FileText, User } from "lucide-react";
import Link from "next/link";

import type { TaskComment, TaskDetail } from "@/lib/queries/task-detail";

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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/my-tasks"
        className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary mb-8"
      >
        <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
        Zu meinen Aufgaben
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="font-serif text-3xl font-light tracking-tight leading-tight flex-1">
            {task.content}
          </h1>
          <TaskStatusBadge status={task.status} size="md" />
        </div>

        {task.description && (
          <p className="text-text-secondary whitespace-pre-wrap leading-relaxed mb-4">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-text-tertiary border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" strokeWidth={1.75} />
            Zugewiesen von {task.created_by_email || "Unbekannt"}
          </div>
          {task.recipient_type === "specific_person" &&
            task.specific_recipient_email && (
              <div>An {task.specific_recipient_email}</div>
            )}
          {task.recipient_type === "all_team" && (
            <div>An gesamtes Team</div>
          )}
          {task.recipient_type === "doctor_only" && <div>Nur Arzt</div>}
          <Link
            href={`/inbox/${task.submission_id}`}
            className="flex items-center gap-1.5 hover:text-text-primary"
          >
            <FileText className="w-3 h-3" strokeWidth={1.75} />
            Patient: {task.submission_patient_name || "—"}
          </Link>
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
        <div className="mb-10 p-5 bg-surface-card border border-border rounded-lg">
          <TaskActions
            taskId={task.id}
            status={task.status}
            isDoctor={isDoctor}
            isMyTask={isMyTask}
          />
        </div>
      )}

      <section className="space-y-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-text-tertiary font-mono">
          Kommentare · {comments.length}
        </h2>
        <CommentThread comments={comments} currentUserId={currentUserId} />
        <div className="pt-4 border-t border-border">
          <CommentForm taskId={task.id} />
        </div>
      </section>
    </div>
  );
}
