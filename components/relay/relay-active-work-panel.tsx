"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TaskActions } from "@/components/my-tasks/task-actions";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { buildRelayWorkContextModel } from "@/lib/relay/relay-work-context-narrative";
import { resolveRelayWorkDecisions } from "@/lib/relay/relay-work-decisions";
import { resolveRelayWorkObjectType } from "@/lib/relay/relay-work-object";
import type { RelayWorkAreaId } from "@/lib/relay/relay-work-areas";
import { relayAreaAsPracticeSection } from "@/lib/relay/relay-work-areas";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { cn } from "@/lib/utils";

type Props = {
  row: RelayWorkRow | null;
  areaId: RelayWorkAreaId;
  task?: MyTask;
  journal?: JournalEntry;
  conversation?: RelayConversationRow;
  isDoctor: boolean;
  userId: string;
  messageDraftStatus?: MessageDraftListStatus;
  onBack?: () => void;
  onOpenMessage?: (conversationId: string) => void;
};

function isMyTask(task: MyTask, userId: string): boolean {
  return task.assignee_ids.includes(userId) || task.specific_recipient_id === userId;
}

function documentationBody(
  journal?: JournalEntry,
  task?: MyTask,
  row?: RelayWorkRow | null
): string | null {
  if (journal) {
    if (journal.excerpt?.trim()) return journal.excerpt.trim();
    const md = journal.content_markdown?.trim();
    if (md) {
      const plain = md
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\n+/g, " ")
        .trim();
      return plain.length > 600 ? `${plain.slice(0, 600).trimEnd()}…` : plain;
    }
  }
  const desc = task?.description?.trim();
  if (desc) return desc.length > 600 ? `${desc.slice(0, 600).trimEnd()}…` : desc;
  if (row?.concernLine?.trim()) return row.concernLine.trim();
  return null;
}

function communicationBody(
  row: RelayWorkRow,
  conversation?: RelayConversationRow,
  messageDraftStatus?: MessageDraftListStatus
): string | null {
  if (conversation?.last_message_preview?.trim()) {
    return conversation.last_message_preview.trim();
  }
  if (messageDraftStatus === "draft") {
    return "Patientenantwort liegt als Entwurf vor und wartet auf Freigabe.";
  }
  if (messageDraftStatus === "approved") {
    return "Patientenantwort ist freigegeben und kann versendet werden.";
  }
  if (row.kind === "message") {
    return row.context?.trim() || "Interne Übergabe — Antwort erforderlich.";
  }
  return null;
}

export function RelayActiveWorkPanel({
  row,
  areaId,
  task,
  journal,
  conversation,
  isDoctor,
  userId,
  messageDraftStatus,
  onBack,
  onOpenMessage,
}: Props) {
  if (!row) {
    return (
      <div className="yd-relay-cw__panel yd-relay-cw__panel--idle">
        <p className="yd-relay-cw__panel-idle">Vorgang in der Liste wählen.</p>
      </div>
    );
  }

  const section = relayAreaAsPracticeSection(areaId);
  const model = buildRelayWorkContextModel(row, section, {
    task,
    journal,
    conversation,
    isDoctor,
    messageDraftStatus,
  });

  const contextText = [model.narrative[0]?.body, model.narrative[1]?.body]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const explanationText = [model.narrative[2]?.body, model.narrative[3]?.body]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const doc = documentationBody(journal, task, row);
  const comm = communicationBody(row, conversation, messageDraftStatus);
  const trackerHref = task?.submission_id ? `/inbox/${task.submission_id}` : null;
  const wait = row.waitingLabel ?? row.timeLabel;

  const historyLines = [
    row.timeLabel ? `Eingang: ${row.timeLabel}` : null,
    row.statusLabel ? `Status: ${row.statusLabel}` : null,
    row.actionLabel ? `Nächster Schritt: ${row.actionLabel}` : null,
    task?.submission_patient_name?.trim()
      ? `Patient: ${task.submission_patient_name.trim()}`
      : null,
  ].filter((line): line is string => Boolean(line));

  const attachmentHint =
    journal?.content_markdown?.trim() || task?.submission_id
      ? journal
        ? "Journal-Entwurf mit Inhalt"
        : "Fallmaterial im Tracker"
      : null;

  const doctorSelfTask = isDoctor && task?.created_by === userId;
  const objectType = resolveRelayWorkObjectType(row, { task, journal, messageDraftStatus });
  const useTaskFlow =
    task &&
    task.status !== "done" &&
    (objectType === "entscheidung" ||
      objectType === "teamaufgabe" ||
      (task.status === "pending_review" && isDoctor));

  const decisions = resolveRelayWorkDecisions(row, {
    task,
    journal,
    conversation,
    messageDraftStatus,
  }).slice(0, 3);

  return (
    <div className="yd-relay-cw__panel">
      {onBack ? (
        <button type="button" className="yd-relay-cw__back md:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Liste
        </button>
      ) : null}

      <header className="yd-relay-cw__panel-bar">
        <div className="yd-relay-cw__panel-bar-main">
          <span className="yd-relay-cw__panel-kind">{model.kindLabel}</span>
          <h1 className="yd-relay-cw__panel-title">{row.primaryLabel}</h1>
        </div>
        <div className="yd-relay-cw__panel-bar-meta">
          <span>{row.fromLabel} → {row.toLabel}</span>
          {wait ? <span>{wait}</span> : null}
        </div>
      </header>

      <div className="yd-relay-cw__panel-body">
        {contextText ? (
          <section className="yd-relay-cw__section">
            <h2 className="yd-relay-cw__section-title">Kontext</h2>
            <p className="yd-relay-cw__section-text">{contextText}</p>
          </section>
        ) : null}

        {explanationText ? (
          <section className="yd-relay-cw__section">
            <h2 className="yd-relay-cw__section-title">Erklärung</h2>
            <p className="yd-relay-cw__section-text">{explanationText}</p>
          </section>
        ) : null}

        {doc ? (
          <section className="yd-relay-cw__section">
            <h2 className="yd-relay-cw__section-title">Dokumentation</h2>
            <p className="yd-relay-cw__section-text yd-relay-cw__section-text--doc">{doc}</p>
          </section>
        ) : null}

        {comm ? (
          <section className="yd-relay-cw__section">
            <h2 className="yd-relay-cw__section-title">Kommunikation</h2>
            <p className="yd-relay-cw__section-text">{comm}</p>
          </section>
        ) : null}

        {attachmentHint ? (
          <section className="yd-relay-cw__section">
            <h2 className="yd-relay-cw__section-title">Anhänge</h2>
            <p className="yd-relay-cw__section-text">{attachmentHint}</p>
          </section>
        ) : null}

        {historyLines.length > 0 ? (
          <section className="yd-relay-cw__section">
            <h2 className="yd-relay-cw__section-title">Historie</h2>
            <ul className="yd-relay-cw__history">
              {historyLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {trackerHref ? (
          <Link href={trackerHref} className="yd-relay-cw__tracker-link">
            Fall im Tracker öffnen
          </Link>
        ) : null}
      </div>

      <footer className="yd-relay-cw__panel-foot">
        <h2 className="yd-relay-cw__section-title">Entscheidung</h2>
        <div className="yd-relay-cw__panel-actions">
          {useTaskFlow && task ? (
            <TaskActions
              taskId={task.id}
              status={task.status}
              isDoctor={isDoctor}
              isMyTask={isMyTask(task, userId)}
              doctorSelfTask={doctorSelfTask}
            />
          ) : (
            decisions.map((decision, index) => {
              const onClick =
                decision.id === "reply" &&
                row.kind === "message" &&
                conversation &&
                onOpenMessage
                  ? () => onOpenMessage(conversation.id)
                  : undefined;

              if (onClick) {
                return (
                  <button
                    key={decision.id}
                    type="button"
                    className={cn(
                      "yd-relay-cw__action",
                      index === 0 ? "yd-relay-cw__action--primary" : "yd-relay-cw__action--secondary"
                    )}
                    onClick={onClick}
                  >
                    {decision.label}
                  </button>
                );
              }

              if (!decision.href) return null;
              return (
                <Link
                  key={decision.id}
                  href={decision.href}
                  className={cn(
                    "yd-relay-cw__action",
                    index === 0 ? "yd-relay-cw__action--primary" : "yd-relay-cw__action--secondary"
                  )}
                >
                  {decision.label}
                </Link>
              );
            })
          )}
        </div>
      </footer>
    </div>
  );
}
