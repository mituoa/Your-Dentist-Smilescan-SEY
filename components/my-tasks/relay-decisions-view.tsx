"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayDecisionsSnapshot,
  type RelayDecisionBucket,
  type RelayDecisionRow,
  type RelayDecisionsSnapshot,
} from "@/lib/relay/build-relay-decisions-snapshot";
import { cn } from "@/lib/utils";

type RelayDecisionsViewProps = {
  basePath: "/my-tasks" | "/relay";
  isDoctor: boolean;
  columns: {
    open: MyTask[];
    pending: MyTask[];
    done: MyTask[];
  };
  assignableMembers: AssignableMember[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

type MobileFilter = "all" | RelayDecisionBucket | "today";

const SECTION_META: {
  id: RelayDecisionBucket;
  title: string;
  empty: string;
}[] = [
  {
    id: "patient_waiting",
    title: "Patient wartet",
    empty: "Kein Patient wartet derzeit auf die Praxis.",
  },
  {
    id: "team_waiting",
    title: "Team wartet",
    empty: "Keine offenen Teamentscheidungen.",
  },
  {
    id: "approvals",
    title: "Freigaben",
    empty: "Keine ausstehenden Freigaben.",
  },
  {
    id: "overdue",
    title: "Überfällig",
    empty: "",
  },
];

function sectionRows(snapshot: RelayDecisionsSnapshot, id: RelayDecisionBucket): RelayDecisionRow[] {
  switch (id) {
    case "patient_waiting":
      return snapshot.patientWaiting;
    case "team_waiting":
      return snapshot.teamWaiting;
    case "approvals":
      return snapshot.approvals;
    case "overdue":
      return snapshot.overdue;
  }
}

function RelayDecisionRowItem({ row }: { row: RelayDecisionRow }) {
  return (
    <li>
      <Link href={row.href} className="yd-relay-decisions__row">
        <span className="yd-relay-decisions__row-main">
          <span className="yd-relay-decisions__row-top">
            <span className="yd-relay-decisions__row-primary">{row.primaryLabel}</span>
            <span className="yd-relay-decisions__row-wait">{row.waitingLabel}</span>
          </span>
          <span className="yd-relay-decisions__row-context">{row.context}</span>
        </span>
        <span className="yd-relay-decisions__row-action">{row.actionLabel}</span>
      </Link>
    </li>
  );
}

function RelayDecisionSection({
  title,
  rows,
  emptyCopy,
  hideWhenEmpty = false,
}: {
  title: string;
  rows: RelayDecisionRow[];
  emptyCopy?: string;
  hideWhenEmpty?: boolean;
}) {
  if (hideWhenEmpty && rows.length === 0) return null;

  return (
    <section className="yd-relay-decisions__section" aria-label={title}>
      <h2 className="yd-relay-decisions__section-title">{title}</h2>
      {rows.length === 0 ? (
        emptyCopy ? <p className="yd-relay-decisions__section-empty">{emptyCopy}</p> : null
      ) : (
        <ul className="yd-relay-decisions__list">
          {rows.map((row) => (
            <RelayDecisionRowItem key={row.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function RelayDecisionsView({
  basePath,
  isDoctor,
  columns,
  assignableMembers,
  submissionDraftStatus = {},
}: RelayDecisionsViewProps) {
  const isRelay = basePath === "/relay";
  const [mobileFilter, setMobileFilter] = useState<MobileFilter>("all");

  const snapshot = useMemo(
    () =>
      buildRelayDecisionsSnapshot({
        open: columns.open,
        pending: columns.pending,
        members: assignableMembers,
        draftBySubmissionId: submissionDraftStatus,
        isDoctor,
      }),
    [columns.open, columns.pending, assignableMembers, submissionDraftStatus, isDoctor]
  );

  const mobileFilters: { id: MobileFilter; label: string; count?: number }[] = [
    { id: "all", label: "Heute" },
    {
      id: "patient_waiting",
      label: "Patient wartet",
      count: snapshot.summary.patientWaiting,
    },
    {
      id: "team_waiting",
      label: "Team wartet",
      count: snapshot.summary.teamWaiting,
    },
    {
      id: "approvals",
      label: "Freigaben",
      count: snapshot.summary.approvals,
    },
    ...(snapshot.summary.overdue > 0
      ? [{ id: "overdue" as const, label: "Überfällig", count: snapshot.summary.overdue }]
      : []),
  ];

  const showSection = (id: RelayDecisionBucket) =>
    mobileFilter === "all" || mobileFilter === id;

  const allClear = snapshot.summary.areaCount === 0;

  return (
    <div className="yd-relay yd-relay-shell yd-relay-decisions flex min-h-0 flex-1 flex-col">
      <RelayCommandTaskPrefill />
      <div className="yd-relay-decisions__frame flex min-h-0 flex-1 flex-col">
        <header className="yd-relay-decisions__head">
          <h1 className="yd-relay-decisions__title">{isRelay ? "Relay" : "Meine Aufgaben"}</h1>
          <p className="yd-relay-decisions__lead">
            {isRelay
              ? "Wo heute Ihre Entscheidung benötigt wird."
              : isDoctor
                ? "Entscheidungen und Freigaben für Ihre Praxis."
                : "Offene Schritte, die auf die Praxis warten."}
          </p>
        </header>

        <section className="yd-relay-decisions__today" aria-label="Heute">
          {allClear ? (
            <>
              <p className="yd-relay-decisions__today-intro">Heute ist alles entschieden.</p>
              <p className="yd-relay-decisions__today-line yd-relay-decisions__today-line--calm">
                Neue Entscheidungen erscheinen hier, sobald Patienten oder Team auf Sie warten.
              </p>
            </>
          ) : (
            <>
              {snapshot.summary.intro ? (
                <p className="yd-relay-decisions__today-intro">{snapshot.summary.intro}</p>
              ) : null}
              <ul className="yd-relay-decisions__today-lines">
                {snapshot.summary.lines.map((line) => (
                  <li key={line} className="yd-relay-decisions__today-line">
                    {line}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div
          className="yd-relay-decisions__filters md:hidden"
          role="tablist"
          aria-label="Entscheidungsbereiche"
        >
          {mobileFilters.map((chip) => {
            const active = mobileFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn(
                  "yd-relay-decisions__filter",
                  active && "yd-relay-decisions__filter--active"
                )}
                onClick={() => setMobileFilter(chip.id)}
              >
                {chip.label}
                {chip.count != null && chip.count > 0 ? (
                  <span className="yd-relay-decisions__filter-count">{chip.count}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="yd-relay-decisions__body min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {SECTION_META.map((section) => {
            const rows = sectionRows(snapshot, section.id);
            if (!showSection(section.id)) return null;
            return (
              <RelayDecisionSection
                key={section.id}
                title={section.title}
                rows={rows}
                emptyCopy={section.empty}
                hideWhenEmpty={section.id === "overdue"}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
