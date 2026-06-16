"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { TaskActions } from "@/components/my-tasks/task-actions";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { buildRelayDecisionWorkspace } from "@/lib/relay/build-relay-decision-workspace";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  isDoctor: boolean;
  columns: {
    open: MyTask[];
    pending: MyTask[];
    done: MyTask[];
  };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus: Record<string, MessageDraftListStatus>;
};

function DecisionActionBtn({
  href,
  variant,
  label,
}: {
  href?: string;
  variant: "primary" | "outline";
  label: string;
}) {
  if (!href) return null;
  return (
    <Link
      href={href}
      className={cn(
        "yd-relay-dw__action",
        variant === "primary" ? "yd-relay-dw__action--primary" : "yd-relay-dw__action--secondary"
      )}
    >
      {label}
    </Link>
  );
}

export function RelayDecisionWorkspace({
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations,
  journalDrafts,
  submissionDraftStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusRowId = searchParams.get("entscheidung");

  const model = useMemo(
    () =>
      buildRelayDecisionWorkspace({
        columns,
        assignableMembers,
        conversations,
        journalDrafts,
        submissionDraftStatus,
        isDoctor,
        userId,
        focusRowId,
      }),
    [
      columns,
      assignableMembers,
      conversations,
      journalDrafts,
      submissionDraftStatus,
      isDoctor,
      userId,
      focusRowId,
    ]
  );

  const selectDecision = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("entscheidung", id);
      router.replace(`/relay?${params.toString()}`, { scroll: false });
      document.querySelector(".yd-relay-dw__scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (!focusRowId) return;
    document.querySelector(".yd-relay-dw__scroll")?.scrollTo({ top: 0, behavior: "auto" });
  }, [focusRowId]);

  const { focus, actions, after, allClear } = model;

  return (
    <div className="yd-relay-dw flex min-h-0 flex-1 flex-col">
      <RelayCommandTaskPrefill />

      <div className="yd-relay-dw__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {allClear ? (
          <div className="yd-relay-dw__empty">
            <h1 className="yd-relay-dw__empty-title">Nichts wartet auf Sie</h1>
            <p className="yd-relay-dw__empty-text">
              Neue Entscheidungen erscheinen hier, sobald das Team oder ein Patient Ihre Aufmerksamkeit
              braucht.
            </p>
          </div>
        ) : focus ? (
          <article className="yd-relay-dw__workspace" aria-label="Aktuelle Entscheidung">
            {focus.total > 1 ? (
              <p className="yd-relay-dw__position">
                {focus.position} von {focus.total}
              </p>
            ) : null}

            <h1 className="yd-relay-dw__headline">{focus.headline}</h1>

            <p className="yd-relay-dw__situation">{focus.situation}</p>

            {focus.clinicalBody ? (
              <p className="yd-relay-dw__clinical">{focus.clinicalBody}</p>
            ) : null}

            {focus.outcome ? <p className="yd-relay-dw__outcome">{focus.outcome}</p> : null}

            <div className="yd-relay-dw__actions">
              {model.useTaskFlow && model.taskId && model.taskStatus ? (
                <TaskActions
                  taskId={model.taskId}
                  status={model.taskStatus}
                  isDoctor={isDoctor}
                  isMyTask={model.isMyTask}
                  doctorSelfTask={model.doctorSelfTask}
                />
              ) : (
                actions.map((action, index) => (
                  <DecisionActionBtn
                    key={action.id}
                    href={action.href}
                    variant={index === 0 ? "primary" : "outline"}
                    label={action.label}
                  />
                ))
              )}
            </div>
          </article>
        ) : null}

        {!allClear && after.length > 0 ? (
          <ul className="yd-relay-dw__more" aria-label="Weitere Entscheidungen">
            {after.map((item) => (
              <li key={item.id}>
                <button type="button" className="yd-relay-dw__more-item" onClick={() => selectDecision(item.id)}>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
