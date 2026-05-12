import { ArrowLeft, Calendar, Clock, FileText, User } from "lucide-react";
import Link from "next/link";

import type { TaskComment, TaskDetail } from "@/lib/queries/task-detail";
import { clinicalCorePanel, clinicalDividerBorder } from "@/lib/pilot-surface";
import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";

import { CommentForm } from "./comment-form";
import { CommentThread } from "./comment-thread";
import { TaskActions } from "./task-actions";
import { TaskStatusBadge } from "./task-status-badge";

/**
 * Aufgaben-Detail-Shell — **Punkt 1 (Zweck)** s. `app/(protected)/my-tasks/[id]/page.tsx`: ruhige Koordination,
 * keine Ticket-/Chat-Inszenierung; Kommentarbereich sachlich (`CommentThread`, `CommentForm`).
 *
 * **Punkt 2 (Status / Stabilität):** Kein zweites Pending-Theater — Mutationen in Kindkomponenten (`TaskActions`,
 * `CommentForm`); Oberfläche folgt RSC nach Refresh. Struktur: feste Panel-Abstände (`clinicalCorePanel`), Back-Link
 * oben; s. `page.tsx` (Punkt 2).
 *
 * **Punkt 3 (Supabase / Auth):** Daten nur aus `getTaskWithComments` mit Server-`workspace_id`; Inbox-Link nur aus
 * Task-Row; keine zweite Datenquelle — s. `page.tsx` (Punkt 3).
 *
 * **Punkt 4 (Aktionen):** Interaktionen in `TaskActions` / `CommentForm` — koordinierend, nicht ticketartig; s.
 * `page.tsx` (Punkt 4).
 *
 * **Punkt 5 (Tot/Fake):** Kurze, ehrliche Hinweise in der UI (Datenmoment, kein Chat); s. `page.tsx` (Punkt 5).
 *
 * **Punkt 6 (Loading):** Initiales Laden nur `loading.tsx` / `ClinicalTaskDetailSkeleton` — keine doppelte globale
 * Lade-Inszenierung hier; s. `page.tsx` (Punkt 6).
 *
 * **Punkt 7 (Empty):** Leerer Kommentar-Thread = eine ruhige Zeile in `CommentThread` (kein Ticket-/Chat-Empty);
 * Kontext bleibt bei Überschrift + Untertitel; s. `page.tsx` (Punkt 7).
 *
 * **Punkt 8 (Error):** Fehler nur als ruhige Zeile in `TaskActions` / `CommentForm`; s. `page.tsx` (Punkt 8).
 *
 * **Punkt 9 (Mobile):** Eine vertikale Lesespur, `min-w-0`/`overflow-x-hidden` gegen lange Metadaten; Textareas
 * **16px** (iOS-Zoom); Touch-Ziele ≥44px in Aktionen/Notiz; s. `page.tsx` (Punkt 9).
 *
 * **Punkt 10 (Security):** Lesen nur `getTaskWithComments` + `isMyTask`/`notFound`; Schreiben nur Server Actions mit
 * Workspace- und Rollen-Guards; Inbox-Link nur aus workspace-konsistenter Submission-Zeile; s. `page.tsx` (Punkt 10).
 *
 * **Punkt 11 (MVP):** Fokussiertes Koordinations-MVP — kein PM-/Realtime-/Plattform-Scope; s. `page.tsx` (Punkt 11).
 *
 * **Punkt 12 (Nice/Future/Non-MVP):** Produktgrenzen, Nice-vs-Future-Trennung, Drift-Schutz; s. `page.tsx` (Punkt 12).
 *
 * **Punkt 13 (Priorität):** P0-Begründung, Regressionen, Freeze-Hinweis; s. `page.tsx` (Punkt 13).
 */

interface TaskDetailViewProps {
  task: TaskDetail;
  comments: TaskComment[];
  currentUserId: string;
  isDoctor: boolean;
  isMyTask: boolean;
  /** Ärztin hat die Aufgabe selbst angelegt — Submit schließt direkt ab (s. `submitTaskForReview`). */
  doctorSelfTask: boolean;
  /** Back target — `/relay` (Ärzte) or `/my-tasks` (Team). */
  listHref: "/relay" | "/my-tasks";
}

export function TaskDetailView({
  task,
  comments,
  currentUserId,
  isDoctor,
  isMyTask,
  doctorSelfTask,
  listHref,
}: TaskDetailViewProps) {
  return (
    <div
      className="min-h-0 min-w-0 flex-1 touch-manipulation overflow-x-hidden"
      style={{ background: "#F7F9FC" }}
    >
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="mx-auto w-full min-w-0 max-w-4xl">
        <Link
          href={listHref}
          className="mb-6 inline-flex min-h-10 touch-manipulation items-center gap-1 rounded-lg text-[13px] font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)] sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Zur Aufgabenübersicht
        </Link>

        <div className={`mb-8 p-4 sm:p-5 ${clinicalCorePanel}`}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#0F172A] sm:text-3xl">
                {task.title}
              </h1>
              {task.priority === "important" && (
                <p className="mt-1 text-xs font-medium text-danger">Priorität: wichtig</p>
              )}
            </div>
            <div className="shrink-0 self-start">
              <TaskStatusBadge status={task.status} size="md" />
            </div>
          </div>

          {task.description && (
            <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#64748B] sm:text-base">
              {task.description}
            </p>
          )}

          <div
            className={`grid min-w-0 grid-cols-1 gap-2 break-words border-t pt-4 text-sm leading-5 text-[#64748B] sm:grid-cols-2 xl:grid-cols-3 ${clinicalDividerBorder}`}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
              Kenntnisnahme: {task.receipt_summary.read} von {task.receipt_summary.total} gelesen
              <span className="text-[11px] font-normal text-[#94A3B8]">(Stand dieser Ansicht)</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" strokeWidth={1.75} />
              <span className="min-w-0 break-words">
                Erstellt von {task.created_by_email || "Unbekannt"}
              </span>
            </div>
            {task.recipient_type === "specific_person" &&
              (task.assignee_emails.length > 0 || task.specific_recipient_email) && (
                <div className="min-w-0 break-words">
                  Zugewiesen an{" "}
                  {task.assignee_emails.length > 0
                    ? task.assignee_emails.join(", ")
                    : task.specific_recipient_email}
                </div>
              )}
            {task.recipient_type === "all_team" && (
              <div className="min-w-0 break-words">Zugewiesen an gesamtes Team</div>
            )}
            {task.recipient_type === "doctor_only" && (
              <div className="min-w-0 break-words">Zugewiesen an Arzt</div>
            )}
            {task.submission_id ? (
              <Link
                href={`/inbox/${task.submission_id}`}
                title="Zugehörige Einreichung in der Inbox öffnen"
                className="flex min-w-0 items-center gap-1.5 break-words rounded-md text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)]"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Einreichung: {task.submission_patient_name || "Unbekannt"}
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
          <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
            Angaben und Kenntnisnahme entsprechen dem Stand beim Öffnen dieser Seite — ohne Live-Aktualisierung.
          </p>
        </div>

        {task.status !== "done" && (
          <section
            className={`mb-10 p-4 sm:p-5 ${clinicalCorePanel}`}
            aria-labelledby="task-actions-heading"
          >
            <h2 id="task-actions-heading" className="sr-only">
              Nächste Schritte
            </h2>
            <TaskActions
              taskId={task.id}
              status={task.status}
              isDoctor={isDoctor}
              isMyTask={isMyTask}
              doctorSelfTask={doctorSelfTask}
            />
          </section>
        )}

        <section className={`space-y-6 p-4 sm:p-5 ${clinicalCorePanel}`} aria-labelledby="task-comments-heading">
          <h2
            id="task-comments-heading"
            className="text-sm font-semibold leading-snug text-[#334155]"
          >
            Kommentare
            <span className="ml-1.5 font-normal tabular-nums text-[#94A3B8]">({comments.length})</span>
          </h2>
          <p className="text-xs leading-relaxed text-[#94A3B8]">
            Dokumentierende Notizen — kein Echtzeit-Chat oder Kanal.
          </p>
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
