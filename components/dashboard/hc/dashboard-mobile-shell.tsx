import Link from "next/link";
import { Plus } from "lucide-react";

import { MorningBriefing } from "@/components/dashboard/hc/morning-briefing";
import { buildMobilePriorityLine } from "@/lib/dashboard/dashboard-status-copy";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { createCaseFromQuery } from "@/lib/create-case-return";
import type { PracticeBriefing } from "@/lib/command-ai/practice-intelligence";
import type { DashboardPriorityItem, OpenTaskRow } from "@/lib/queries/dashboard";

type DashboardMobileShellProps = {
  greeting: string;
  displayName: string;
  unseenCount: number | null;
  openTaskCount: number;
  preparedAwaitingCount: number | null;
  tasksNeedingDecision: number | null;
  priorityItems: DashboardPriorityItem[] | null;
  openTasks: OpenTaskRow[] | null;
  briefing?: PracticeBriefing | null;
};

const MOBILE_INBOX_PREVIEW_LIMIT = 5;

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function DashboardMobileShell({
  greeting,
  displayName,
  unseenCount,
  openTaskCount,
  preparedAwaitingCount,
  tasksNeedingDecision,
  priorityItems,
  openTasks,
  briefing = null,
}: DashboardMobileShellProps) {
  const newItems = (priorityItems ?? []).filter((item) => !item.seen_at);
  const inboxPreview = newItems.slice(0, MOBILE_INBOX_PREVIEW_LIMIT);
  const hasMoreInbox = newItems.length > MOBILE_INBOX_PREVIEW_LIMIT;

  const taskRows = (openTasks ?? []).slice(0, 3);
  const decisionCount = tasksNeedingDecision !== null ? tasksNeedingDecision : openTaskCount;

  const statusLine = buildMobilePriorityLine(
    unseenCount,
    preparedAwaitingCount,
    decisionCount
  );
  const hasAttention =
    (unseenCount ?? 0) > 0 ||
    (preparedAwaitingCount ?? 0) > 0 ||
    (decisionCount ?? 0) > 0;

  return (
    <div className="yd-dash-mobile md:hidden">
      <header className="yd-dash-mobile__hero">
        <h1 className="yd-dash-mobile__title">
          {greeting}, {displayName}
        </h1>
        {hasAttention ? (
          <p className="yd-dash-mobile__status-line" role="status">
            {statusLine}
          </p>
        ) : (
          <p className="yd-dash-mobile__status-empty" role="status">
            Heute liegen keine dringenden Vorgänge vor.
          </p>
        )}
      </header>

      {briefing ? (
        <section className="yd-dash-mobile__briefing" aria-label="Tagesüberblick">
          <MorningBriefing briefing={briefing} />
        </section>
      ) : null}

      <section className="yd-dash-mobile__inbox" aria-label="Neu eingegangen">
        <div className="yd-dash-mobile__section-head">
          <div className="yd-dash-mobile__section-head-main">
            <h2 className="yd-dash-mobile__section-title yd-dash-mobile__section-title--prominent">
              Neu eingegangen
            </h2>
            {(unseenCount ?? 0) > 0 ? (
              <span className="yd-dash-mobile__section-count" aria-hidden>
                {unseenCount}
              </span>
            ) : null}
          </div>
          {(unseenCount ?? 0) > 0 ? (
            <Link href="/inbox" className="yd-dash-mobile__section-link">
              Alle
            </Link>
          ) : null}
        </div>

        {inboxPreview.length > 0 ? (
          <>
            <ul className="yd-dash-mobile-inbox-cards">
              {inboxPreview.map((item) => {
                const name = item.patient_name?.trim() || "Unbekannter Patient";
                const subject = deriveSubmissionIssueShortLine(
                  item.patient_notes,
                  item.patient_name,
                  { maxLen: 64, emptyLabel: "Einsendung" }
                );
                return (
                  <li key={item.id} className="yd-dash-mobile-inbox-cards__item">
                    <Link
                      href={`/inbox/${item.id}`}
                      className="yd-tracker-mobile-card yd-tracker-mobile-card--fresh"
                    >
                      <span className="yd-tracker-mobile-card__headline-row">
                        <span className="yd-tracker-mobile-card__headline">
                          {subject || "Neue Einsendung"}
                        </span>
                        <span className="yd-tracker-mobile-card__fresh" aria-label="Neu">
                          Neu
                        </span>
                        <span className="yd-tracker-mobile-card__time">
                          {formatRelativeDate(item.created_at)}
                        </span>
                      </span>
                      <span className="yd-tracker-mobile-card__patient">{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {hasMoreInbox ? (
              <Link href="/inbox" className="yd-dash-mobile-inbox-more">
                Alle {newItems.length} neuen Einsendungen anzeigen
              </Link>
            ) : null}
          </>
        ) : (
          <p className="yd-dash-mobile-inbox-quiet" role="status">
            Keine neuen Einsendungen — alles erledigt für den Moment.
          </p>
        )}
      </section>

      {taskRows.length > 0 ? (
        <section className="yd-dash-mobile__tasks" aria-label="Offene Aufgaben">
          <div className="yd-dash-mobile__section-head">
            <h2 className="yd-dash-mobile__section-title yd-dash-mobile__section-title--prominent">
              Offene Aufgaben
            </h2>
            <Link href="/relay" className="yd-dash-mobile__section-link">
              Alle
            </Link>
          </div>
          <ul className="yd-dash-mobile-inbox-cards">
            {taskRows.map((task) => (
              <li key={task.id} className="yd-dash-mobile-inbox-cards__item">
                <Link href={`/my-tasks/${task.id}`} className="yd-tracker-mobile-card">
                  <span className="yd-tracker-mobile-card__headline-row">
                    <span className="yd-tracker-mobile-card__headline">Aufgabe</span>
                  </span>
                  <span className="yd-tracker-mobile-card__patient">{task.content}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="yd-dash-mobile__footer-action">
        <Link
          href={`/create-case?from=${createCaseFromQuery("/dashboard")}`}
          className="yd-dash-mobile-create-case"
        >
          <Plus className="yd-dash-mobile-create-case__icon" strokeWidth={1.75} aria-hidden />
          Fall anlegen
        </Link>
      </div>
    </div>
  );
}
