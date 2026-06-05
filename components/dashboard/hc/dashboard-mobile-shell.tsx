import Link from "next/link";
import { ChevronRight, ClipboardList, ListTodo, BookOpen, Plus } from "lucide-react";

import { buildMobilePriorityLine } from "@/lib/dashboard/dashboard-status-copy";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { createCaseFromQuery } from "@/lib/create-case-return";
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
};

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
}: DashboardMobileShellProps) {
  const attentionItems = (priorityItems ?? [])
    .filter((item) => !item.seen_at)
    .slice(0, 3);

  const taskRows = (openTasks ?? []).slice(0, 3);

  const statusLine = buildMobilePriorityLine(
    unseenCount,
    preparedAwaitingCount,
    tasksNeedingDecision ?? openTaskCount
  );
  const hasAttention =
    (unseenCount ?? 0) > 0 ||
    (preparedAwaitingCount ?? 0) > 0 ||
    (tasksNeedingDecision ?? 0) > 0;

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

      {taskRows.length > 0 ? (
        <section className="yd-dash-mobile__tasks" aria-label="Offene Aufgaben">
          <div className="yd-dash-mobile__section-head">
            <h2 className="yd-dash-mobile__section-title">Offene Aufgaben</h2>
            <Link href="/relay" className="yd-dash-mobile__section-link">
              Relay
            </Link>
          </div>
          <ul className="yd-dash-mobile-plain-list">
            {taskRows.map((task) => (
              <li key={task.id}>
                <Link href={`/my-tasks/${task.id}`} className="yd-dash-mobile-plain-row">
                  <span className="yd-dash-mobile-plain-row__main">{task.content}</span>
                  <ChevronRight className="yd-dash-mobile-plain-row__chevron" strokeWidth={1.75} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {attentionItems.length > 0 ? (
        <section className="yd-dash-mobile__attention" aria-label="Benötigt Aufmerksamkeit">
          <div className="yd-dash-mobile__section-head">
            <h2 className="yd-dash-mobile__section-title">Benötigt Aufmerksamkeit</h2>
            <Link href="/inbox" className="yd-dash-mobile__section-link">
              Tracker
            </Link>
          </div>
          <ul className="yd-dash-mobile-plain-list">
            {attentionItems.map((item) => {
              const name = item.patient_name?.trim() || "Unbekannter Patient";
              const subject = deriveSubmissionIssueShortLine(
                item.patient_notes,
                item.patient_name,
                { maxLen: 64, emptyLabel: "Einsendung" }
              );
              return (
                <li key={item.id}>
                  <Link href={`/inbox/${item.id}`} className="yd-dash-mobile-plain-row">
                    <span className="yd-dash-mobile-plain-row__stack">
                      <span className="yd-dash-mobile-plain-row__title">{name}</span>
                      {subject ? (
                        <span className="yd-dash-mobile-plain-row__sub">{subject}</span>
                      ) : null}
                    </span>
                    <span className="yd-dash-mobile-plain-row__meta">
                      <span className="yd-dash-mobile-plain-row__badge">Neu</span>
                      <span className="yd-dash-mobile-plain-row__date">
                        {formatRelativeDate(item.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="yd-dash-mobile__actions" aria-label="Wichtige Aktionen">
        <h2 className="yd-dash-mobile__section-title">Wichtige Aktionen</h2>
        <ul className="yd-dash-mobile-action-list">
          <li>
            <Link href="/inbox" className="yd-dash-mobile-action-row">
              <ClipboardList className="yd-dash-mobile-action-row__icon" strokeWidth={1.75} aria-hidden />
              <span>Tracker öffnen</span>
              <ChevronRight className="yd-dash-mobile-action-row__chevron" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
          <li>
            <Link href="/relay" className="yd-dash-mobile-action-row">
              <ListTodo className="yd-dash-mobile-action-row__icon" strokeWidth={1.75} aria-hidden />
              <span>Relay — Aufgaben & Entscheidungen</span>
              <ChevronRight className="yd-dash-mobile-action-row__chevron" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
          <li>
            <Link href="/journal" className="yd-dash-mobile-action-row">
              <BookOpen className="yd-dash-mobile-action-row__icon" strokeWidth={1.75} aria-hidden />
              <span>Journal — Praxiswissen</span>
              <ChevronRight className="yd-dash-mobile-action-row__chevron" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
          <li>
            <Link
              href={`/create-case?from=${createCaseFromQuery("/dashboard")}`}
              className="yd-dash-mobile-action-row"
            >
              <Plus className="yd-dash-mobile-action-row__icon" strokeWidth={1.75} aria-hidden />
              <span>Fall anlegen</span>
              <ChevronRight className="yd-dash-mobile-action-row__chevron" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
