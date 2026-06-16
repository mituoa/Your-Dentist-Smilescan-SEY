"use client";

import Link from "next/link";

import { TaskActions } from "@/components/my-tasks/task-actions";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { buildRelayWorkContextModel } from "@/lib/relay/relay-work-context-narrative";
import { resolveRelayWorkDecisions } from "@/lib/relay/relay-work-decisions";
import { relayAreaAsPracticeSection, type RelayWorkAreaId } from "@/lib/relay/relay-work-areas";
import type { JournalEntry } from "@/lib/types/journal-entry";

type Props = {
  row: RelayWorkRow | null;
  areaId: RelayWorkAreaId;
  task?: MyTask;
  journal?: JournalEntry;
  conversation?: RelayConversationRow;
  isDoctor: boolean;
  userId: string;
  messageDraftStatus?: MessageDraftListStatus;
  onOpenMessage?: (conversationId: string) => void;
};

function isMyTask(task: MyTask, userId: string): boolean {
  return task.assignee_ids.includes(userId) || task.specific_recipient_id === userId;
}

function docText(journal?: JournalEntry, task?: MyTask): string | null {
  if (journal?.excerpt?.trim()) return journal.excerpt.trim();
  const md = journal?.content_markdown?.trim();
  if (md) {
    const plain = md.replace(/^#+\s+/gm, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\n+/g, " ").trim();
    return plain.length > 500 ? `${plain.slice(0, 500).trimEnd()}…` : plain;
  }
  const d = task?.description?.trim();
  return d || null;
}

function commText(
  row: RelayWorkRow,
  conversation?: RelayConversationRow,
  messageDraftStatus?: MessageDraftListStatus
): string | null {
  if (conversation?.last_message_preview?.trim()) return conversation.last_message_preview.trim();
  if (messageDraftStatus === "draft") return "Patientenantwort wartet auf Freigabe.";
  if (messageDraftStatus === "approved") return "Antwort freigegeben — Versand möglich.";
  if (row.kind === "message") return row.context?.trim() || null;
  return null;
}

export function RelayWorkContextPanel({
  row,
  areaId,
  task,
  journal,
  conversation,
  isDoctor,
  userId,
  messageDraftStatus,
  onOpenMessage,
}: Props) {
  if (!row) {
    return (
      <div className="rw-ctx rw-ctx--idle">
        <p>Vorgang in der Liste wählen.</p>
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

  const description = [model.narrative[0]?.body, model.narrative[1]?.body].filter(Boolean).join("\n\n");
  const whyHere = model.narrative[2]?.body ?? "";
  const whatNext = model.narrative[3]?.body ?? "";
  const decision = row.actionLabel || (task?.status === "pending_review" ? "Freigabe" : "Entscheidung");
  const doc = docText(journal, task);
  const comm = commText(row, conversation, messageDraftStatus);
  const attach =
    journal?.content_markdown?.trim() || task?.submission_id
      ? journal
        ? "Journal-Entwurf"
        : "Fallmaterial im Tracker"
      : null;
  const history = [
    row.timeLabel ? `Eingang: ${row.timeLabel}` : null,
    row.statusLabel ? `Status: ${row.statusLabel}` : null,
    task?.submission_patient_name?.trim() ? `Patient: ${task.submission_patient_name.trim()}` : null,
  ].filter((l): l is string => Boolean(l));
  const trackerHref = task?.submission_id ? `/inbox/${task.submission_id}` : null;

  const decisions = resolveRelayWorkDecisions(row, {
    task,
    journal,
    conversation,
    messageDraftStatus,
  }).slice(0, 3);

  const useTaskFlow = task && task.status !== "done";

  return (
    <div className="rw-ctx">
      <header className="rw-ctx__head">
        <span className="rw-ctx__kind">{model.kindLabel}</span>
        <h2 className="rw-ctx__title">{row.primaryLabel}</h2>
      </header>

      <div className="rw-ctx__body">
        {whyHere ? (
          <section className="rw-ctx__block">
            <h3>Warum hier</h3>
            <p>{whyHere}</p>
          </section>
        ) : null}

        <section className="rw-ctx__block">
          <h3>Entscheidung</h3>
          <p>{decision}</p>
        </section>

        {whatNext ? (
          <section className="rw-ctx__block">
            <h3>Was danach</h3>
            <p>{whatNext}</p>
          </section>
        ) : null}

        {description ? (
          <section className="rw-ctx__block">
            <h3>Beschreibung</h3>
            <p>{description}</p>
          </section>
        ) : null}

        {comm ? (
          <section className="rw-ctx__block">
            <h3>Kommunikation</h3>
            <p>{comm}</p>
          </section>
        ) : null}

        {doc ? (
          <section className="rw-ctx__block">
            <h3>Dokumentation</h3>
            <p>{doc}</p>
          </section>
        ) : null}

        {attach ? (
          <section className="rw-ctx__block">
            <h3>Anhänge</h3>
            <p>{attach}</p>
          </section>
        ) : null}

        {history.length > 0 ? (
          <section className="rw-ctx__block">
            <h3>Historie</h3>
            <ul className="rw-ctx__history">
              {history.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {trackerHref ? (
          <Link href={trackerHref} className="rw-ctx__link">
            Fall im Tracker öffnen
          </Link>
        ) : null}
      </div>

      <footer className="rw-ctx__foot">
        {useTaskFlow && task ? (
          <TaskActions
            taskId={task.id}
            status={task.status}
            isDoctor={isDoctor}
            isMyTask={isMyTask(task, userId)}
            doctorSelfTask={isDoctor && task.created_by === userId}
          />
        ) : (
          <div className="rw-ctx__actions">
            {decisions.map((d) => {
              if (
                d.id === "reply" &&
                row.kind === "message" &&
                conversation &&
                onOpenMessage
              ) {
                return (
                  <button key={d.id} type="button" className="rw-ctx__btn rw-ctx__btn--primary" onClick={() => onOpenMessage(conversation.id)}>
                    {d.label}
                  </button>
                );
              }
              if (!d.href) return null;
              return (
                <Link key={d.id} href={d.href} className="rw-ctx__btn rw-ctx__btn--primary">
                  {d.label}
                </Link>
              );
            })}
          </div>
        )}
      </footer>
    </div>
  );
}
