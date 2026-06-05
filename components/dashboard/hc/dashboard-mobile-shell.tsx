import Link from "next/link";
import { ClipboardList, ListTodo, BookOpen, Plus } from "lucide-react";

import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import { MorningBriefing } from "@/components/dashboard/hc/morning-briefing";
import {
  buildDecisionsKpiValue,
  buildNewSubmissionsKpiValue,
  buildPreparedKpiValue,
  buildMobilePriorityLine,
} from "@/lib/dashboard/dashboard-status-copy";
import {
  buildNewSubmissionsWorkContext,
  buildOpenTasksWorkContext,
} from "@/lib/dashboard/kpi-work-context";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { createCaseFromQuery } from "@/lib/create-case-return";
import type { PracticeBriefing } from "@/lib/command-ai/practice-intelligence";
import type { DashboardPriorityItem, OpenTaskRow } from "@/lib/queries/dashboard";
import type { KpiWorkContextData } from "@/components/dashboard/hc/kpi-work-context-preview";

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
  newSubmissionsContext?: KpiWorkContextData;
  openTasksContext?: KpiWorkContextData;
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
  newSubmissionsContext,
  openTasksContext,
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

  const actionTiles = [
    {
      href: "/inbox",
      icon: ClipboardList,
      label: "Tracker",
      sub:
        (unseenCount ?? 0) > 0
          ? `${unseenCount} neu eingegangen`
          : "Einsendungen & Fälle",
      highlight: (unseenCount ?? 0) > 0,
    },
    {
      href: "/relay",
      icon: ListTodo,
      label: "Relay",
      sub:
        decisionCount > 0
          ? `${decisionCount} wartet auf Sie`
          : "Aufgaben & Freigaben",
      highlight: decisionCount > 0,
    },
    {
      href: `/create-case?from=${createCaseFromQuery("/dashboard")}`,
      icon: Plus,
      label: "Fall anlegen",
      sub: "Neuer Patient",
      highlight: false,
    },
    {
      href: "/journal",
      icon: BookOpen,
      label: "Journal",
      sub: "Praxiswissen",
      highlight: false,
    },
  ] as const;

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
          <Link href="/inbox" className="yd-dash-mobile__section-link">
            Alle
          </Link>
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
          <Link href="/inbox" className="yd-dash-mobile-inbox-empty">
            <span className="yd-dash-mobile-inbox-empty__title">Keine neuen Einsendungen</span>
            <span className="yd-dash-mobile-inbox-empty__sub">Tracker öffnen</span>
          </Link>
        )}
      </section>

      <section className="yd-dash-mobile__actions" aria-label="Wichtige Aktionen">
        <h2 className="yd-dash-mobile__section-title yd-dash-mobile__section-title--prominent">
          Wichtige Aktionen
        </h2>
        <ul className="yd-dash-mobile-action-grid">
          {actionTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <li key={tile.href} className="yd-dash-mobile-action-grid__item">
                <Link
                  href={tile.href}
                  className={
                    tile.highlight
                      ? "yd-dash-mobile-action-tile yd-dash-mobile-action-tile--highlight"
                      : "yd-dash-mobile-action-tile"
                  }
                >
                  <span className="yd-dash-mobile-action-tile__icon-shell" aria-hidden>
                    <Icon className="yd-dash-mobile-action-tile__icon" strokeWidth={1.75} />
                  </span>
                  <span className="yd-dash-mobile-action-tile__stack">
                    <span className="yd-dash-mobile-action-tile__label">{tile.label}</span>
                    <span className="yd-dash-mobile-action-tile__sub">{tile.sub}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="yd-dash-mobile__kpis yd-dash-mobile__kpis--secondary" aria-label="Überblick">
        <h2 className="yd-dash-mobile__section-title">Überblick</h2>
        <div className="yd-dash-mobile__kpi-grid">
          <HcStatCard
            href="/inbox"
            title="Neue Anfragen"
            value={buildNewSubmissionsKpiValue(unseenCount)}
            valueVariant="prose"
            iconName="clipboard-list"
            footnote="Heute eingegangen"
            workContext={newSubmissionsContext}
            hoverHint="Neue Patientenanfragen, die noch nicht gesehen wurden."
          />
          <HcStatCard
            href="/inbox"
            title="Wartet auf Freigabe"
            value={buildPreparedKpiValue(preparedAwaitingCount)}
            valueVariant="prose"
            iconName="sparkles"
            footnote="Von Ihnen freigeben"
            hoverHint="Antworten und nächste Schritte warten auf Ihre Freigabe."
          />
          <HcStatCard
            href="/relay"
            title="Patient wartet"
            value={buildDecisionsKpiValue(decisionCount)}
            valueVariant="prose"
            iconName="list-todo"
            footnote="Rückmeldung ausstehend"
            workContext={openTasksContext}
            hoverHint="Patienten, die auf Ihre Antwort warten."
          />
        </div>
      </section>

      {taskRows.length > 0 ? (
        <section className="yd-dash-mobile__tasks" aria-label="Offene Aufgaben">
          <div className="yd-dash-mobile__section-head">
            <h2 className="yd-dash-mobile__section-title">Offene Aufgaben</h2>
            <Link href="/relay" className="yd-dash-mobile__section-link">
              Relay
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

      {briefing ? (
        <section className="yd-dash-mobile__briefing" aria-label="Tagesüberblick">
          <MorningBriefing briefing={briefing} />
        </section>
      ) : null}
    </div>
  );
}
