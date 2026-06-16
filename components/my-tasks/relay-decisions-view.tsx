"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  buildRelayPracticeSnapshot,
  type RelayWorkRow,
} from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type RelayDecisionsViewProps = {
  basePath: "/my-tasks" | "/relay";
  userId: string;
  isDoctor: boolean;
  columns: {
    open: MyTask[];
    pending: MyTask[];
    done: MyTask[];
  };
  assignableMembers: AssignableMember[];
  conversations?: RelayConversationRow[];
  journalDrafts?: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

function RelayWorkRowItem({ row }: { row: RelayWorkRow }) {
  return (
    <li>
      <Link
        href={row.href}
        className={cn(
          "yd-relay-decisions__row",
          row.isGhost && "yd-relay-decisions__row--ghost",
          row.isCritical && "yd-relay-decisions__row--critical"
        )}
      >
        <span className="yd-relay-decisions__row-main">
          <span className="yd-relay-decisions__row-top">
            <span className="yd-relay-decisions__row-primary">{row.primaryLabel}</span>
            {row.timeLabel ? (
              <span className="yd-relay-decisions__row-wait">{row.timeLabel}</span>
            ) : null}
          </span>
          <span className="yd-relay-decisions__row-context">{row.context}</span>
        </span>
        <span className="yd-relay-decisions__row-action">{row.actionLabel}</span>
      </Link>
    </li>
  );
}

function RelayWorkSection({
  title,
  rows,
  ghosts,
  createHref,
  createLabel,
  secondaryAction,
}: {
  title: string;
  rows: RelayWorkRow[];
  ghosts: RelayWorkRow[];
  createHref?: string;
  createLabel?: string;
  secondaryAction?: ReactNode;
}) {
  const displayRows = rows.length > 0 ? rows : ghosts;

  return (
    <section className="yd-relay-decisions__section" aria-label={title}>
      <h2 className="yd-relay-decisions__section-title">{title}</h2>
      <ul className="yd-relay-decisions__list">
        {displayRows.map((row) => (
          <RelayWorkRowItem key={row.id} row={row} />
        ))}
      </ul>
      {rows.length === 0 && ghosts.length > 0 ? (
        <p className="yd-relay-decisions__section-hint">
          Beispiele — so erscheinen Vorgänge, sobald das Team arbeitet.
        </p>
      ) : null}
      <div className="yd-relay-decisions__section-actions">
        {createHref && createLabel ? (
          <Link href={createHref} className="yd-relay-decisions__section-cta">
            {createLabel}
          </Link>
        ) : null}
        {secondaryAction}
      </div>
    </section>
  );
}

export function RelayDecisionsView({
  basePath,
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations = [],
  journalDrafts = [],
  submissionDraftStatus = {},
}: RelayDecisionsViewProps) {
  const isRelay = basePath === "/relay";

  const snapshot = useMemo(
    () =>
      buildRelayPracticeSnapshot({
        open: columns.open,
        pending: columns.pending,
        members: assignableMembers,
        draftBySubmissionId: submissionDraftStatus,
        conversations: isRelay ? conversations : [],
        journalDrafts,
        isDoctor,
        userId,
        basePath,
      }),
    [
      columns.open,
      columns.pending,
      assignableMembers,
      submissionDraftStatus,
      conversations,
      journalDrafts,
      isDoctor,
      userId,
      basePath,
      isRelay,
    ]
  );

  return (
    <div className="yd-relay yd-relay-shell yd-relay-decisions flex min-h-0 flex-1 flex-col">
      <RelayCommandTaskPrefill />
      <div className="yd-relay-decisions__frame flex min-h-0 flex-1 flex-col">
        <header className="yd-relay-decisions__head">
          <h1 className="yd-relay-decisions__title">{isRelay ? "Relay" : "Meine Aufgaben"}</h1>
          <p className="yd-relay-decisions__lead">
            Praxiszentrale
            {snapshot.summaryLine ? (
              <>
                {" "}
                · <span className="yd-relay-decisions__summary">{snapshot.summaryLine}</span>
              </>
            ) : null}
          </p>
          <p className="yd-relay-decisions__lead-sub">
            Alle offenen Übergaben, Freigaben und Teamaufgaben an einem Ort.
          </p>
        </header>

        <div className="yd-relay-decisions__body min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <RelayWorkSection
            title="Benötigt Ihre Aufmerksamkeit"
            rows={snapshot.attention}
            ghosts={snapshot.ghostAttention}
            createHref={isDoctor ? "/journal/new" : "/my-tasks/new"}
            createLabel={isDoctor ? "Journal-Entwurf anlegen" : "Praxisaufgabe erstellen"}
          />

          <RelayWorkSection
            title="Team wartet"
            rows={snapshot.teamwork}
            ghosts={snapshot.ghostTeamwork}
            createHref="/my-tasks/new"
            createLabel="Teamaufgabe zuweisen"
          />

          <RelayWorkSection
            title="Patient wartet"
            rows={snapshot.patientWaiting}
            ghosts={snapshot.ghostPatientWaiting}
          />

          <RelayWorkSection
            title="Routinen"
            rows={snapshot.routines}
            ghosts={snapshot.ghostRoutines}
            createHref="/my-tasks/new"
            createLabel="Routine anlegen"
          />

          <RelayWorkSection
            title="Praxisaufgaben"
            rows={snapshot.practiceTasks}
            ghosts={snapshot.ghostPractice}
            createHref="/my-tasks/new"
            createLabel="Praxisaufgabe erstellen"
          />
        </div>
      </div>
    </div>
  );
}
