"use client";

import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Pencil } from "lucide-react";

import { TaskActions } from "@/components/my-tasks/task-actions";
import { RelayPremiumEmpty } from "@/components/my-tasks/relay-premium-empty";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { RelayPracticeSection, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { buildRelayWorkContextModel } from "@/lib/relay/relay-work-context-narrative";
import { resolveRelayWorkDecisions } from "@/lib/relay/relay-work-decisions";
import { resolveRelayWorkObjectType } from "@/lib/relay/relay-work-object";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { cn } from "@/lib/utils";

type RelayWorkPanelsProps = {
  row: RelayWorkRow | null;
  section: RelayPracticeSection;
  sectionTitle: string;
  fallbackRows?: RelayWorkRow[];
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

type ActionBtnProps = {
  href?: string;
  onClick?: () => void;
  variant: "primary" | "outline";
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function RelayActionBtn({ href, onClick, variant, icon, children }: ActionBtnProps) {
  const className = cn("yd-relay-v7-action", `yd-relay-v7-action--${variant}`);
  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

/** Mittlere Spalte — Narrativ zuerst, Metadaten sekundär. */
export function RelayWorkContextPanel({
  row,
  section,
  sectionTitle,
  fallbackRows = [],
  task,
  journal,
  conversation,
  isDoctor,
  messageDraftStatus,
  onBack,
}: RelayWorkPanelsProps) {
  if (!row) {
    const first = fallbackRows[0];
    return (
      <div className="yd-relay-v4-context flex min-h-0 flex-1 flex-col overflow-hidden">
        {onBack ? (
          <div className="yd-relay-v3-context__bar lg:hidden">
            <button type="button" className="yd-relay-v3-context__back" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
              Zurück
            </button>
          </div>
        ) : null}
        <div className="yd-relay-v3-context__scroll min-h-0 flex-1 overflow-y-auto">
          <RelayPremiumEmpty
            variant="detail"
            title={first ? sectionTitle : "Arbeitsfläche bereit"}
            text={
              first
                ? "Vorgang links wählen — hier erscheint der Arbeitskontext."
                : "Neue Praxisarbeit erscheint automatisch in der Liste."
            }
            hint={first ? first.primaryLabel : undefined}
          />
        </div>
      </div>
    );
  }

  const model = buildRelayWorkContextModel(row, section, {
    task,
    journal,
    conversation,
    isDoctor,
    messageDraftStatus,
  });

  const contextBlocks = [
    model.narrative[0] || model.narrative[1]
      ? {
          heading: "Was ist das?",
          body: [model.narrative[0]?.body, model.narrative[1]?.body]
            .filter(Boolean)
            .join(" ")
            .replace(/\n+/g, " ")
            .trim(),
        }
      : null,
    model.narrative[2]
      ? {
          heading: "Warum bin ich hier?",
          body: model.narrative[2].body.replace(/\n+/g, " ").trim(),
        }
      : null,
    model.narrative[3]
      ? {
          heading: "Was passiert danach?",
          body: model.narrative[3].body.replace(/\n+/g, " ").trim(),
        }
      : null,
  ].filter((block): block is { heading: string; body: string } => Boolean(block?.body));

  return (
    <div className="yd-relay-v3-context flex min-h-0 flex-1 flex-col overflow-hidden">
      {onBack ? (
        <div className="yd-relay-v3-context__bar lg:hidden">
          <button type="button" className="yd-relay-v3-context__back" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            Zurück
          </button>
        </div>
      ) : null}

      <div className="yd-relay-v3-context__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="yd-relay-v8-context__inner">
          <header className="yd-relay-v8-context__header">
            <p className="yd-relay-v8-context__kind">{model.kindLabel}</p>
            <h1 className="yd-relay-v8-context__title">{row.primaryLabel}</h1>
          </header>

          {contextBlocks.length > 0 ? (
            <dl className="yd-relay-v8-context__brief">
              {contextBlocks.map((block) => (
                <div key={block.heading} className="yd-relay-v8-context__brief-item">
                  <dt className="yd-relay-v8-context__brief-label">{block.heading}</dt>
                  <dd className="yd-relay-v8-context__brief-text">{block.body}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Rechte Spalte — 2–3 Entscheidungen, keine Aktionen-Liste. */
export function RelayWorkActionsPanel({
  row,
  task,
  journal,
  conversation,
  isDoctor,
  userId,
  messageDraftStatus,
  onOpenMessage,
}: RelayWorkPanelsProps) {
  if (!row) {
    return (
      <div className="yd-relay-v8-decisions yd-relay-v8-decisions--empty" aria-hidden="true">
        <p className="yd-relay-v8-decisions__placeholder">Entscheidung</p>
      </div>
    );
  }

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
  }).slice(0, 2);

  const iconClass = "h-4 w-4 shrink-0";

  return (
    <div className="yd-relay-v8-decisions yd-tracker-v8-rail">
      <h2 className="yd-relay-v8-decisions__title">Entscheidung</h2>

      <div className="yd-relay-v8-decisions__stack">
        {useTaskFlow ? (
          <div className="yd-relay-v8-decisions__task-flow">
            <TaskActions
              taskId={task.id}
              status={task.status}
              isDoctor={isDoctor}
              isMyTask={isMyTask(task, userId)}
              doctorSelfTask={doctorSelfTask}
            />
          </div>
        ) : (
          decisions.map((decision, index) => {
            const icon =
              decision.id === "approve" || decision.id === "reply" || decision.id === "decide" ? (
                <Check className={iconClass} strokeWidth={2} aria-hidden />
              ) : decision.id === "revise" ? (
                <Pencil className={iconClass} strokeWidth={1.75} aria-hidden />
              ) : decision.id === "open-journal" || decision.id === "tracker" ? (
                <ExternalLink className={iconClass} strokeWidth={1.75} aria-hidden />
              ) : null;

            const onClick =
              decision.id === "reply" &&
              row.kind === "message" &&
              conversation &&
              onOpenMessage
                ? () => onOpenMessage(conversation.id)
                : undefined;

            return (
              <RelayActionBtn
                key={decision.id}
                href={onClick ? undefined : decision.href}
                onClick={onClick}
                variant={index === 0 ? "primary" : "outline"}
                icon={icon}
              >
                {decision.label}
              </RelayActionBtn>
            );
          })
        )}
      </div>
    </div>
  );
}

/** @deprecated Use RelayWorkContextPanel + RelayWorkActionsPanel */
export function RelayWorkDetailPanel(props: RelayWorkPanelsProps) {
  return (
    <div className="yd-relay-work-detail-legacy flex min-h-0 flex-1">
      <RelayWorkContextPanel {...props} />
      <RelayWorkActionsPanel {...props} />
    </div>
  );
}
