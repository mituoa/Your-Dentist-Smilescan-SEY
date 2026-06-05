import Link from "next/link";

import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import type { DashboardPriorityItem } from "@/lib/queries/dashboard";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

type DashboardMobileShellProps = {
  greeting: string;
  displayName: string;
  openTaskCount: number;
  unseenCount: number | null;
  seenCount: number | null;
  preparedAwaitingCount: number | null;
  priorityItems: DashboardPriorityItem[] | null;
  previewRows: SubmissionPreviewRow[] | null;
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function buildStatusParts(
  seenCount: number | null,
  openTaskCount: number,
  preparedAwaitingCount: number | null
): string[] {
  const parts: string[] = [];
  if (seenCount != null && seenCount > 0) {
    parts.push(
      seenCount === 1 ? "1 aktiver Fall" : `${seenCount} aktive Fälle`
    );
  }
  if (openTaskCount > 0) {
    parts.push(
      openTaskCount === 1 ? "1 offene Aufgabe" : `${openTaskCount} offene Aufgaben`
    );
  }
  if (preparedAwaitingCount != null && preparedAwaitingCount > 0) {
    parts.push(
      preparedAwaitingCount === 1
        ? "1 Antwort wartet"
        : `${preparedAwaitingCount} Antworten warten`
    );
  }
  return parts;
}

export function DashboardMobileShell({
  greeting,
  displayName,
  openTaskCount,
  unseenCount,
  seenCount,
  preparedAwaitingCount,
  priorityItems,
  previewRows,
}: DashboardMobileShellProps) {
  const statusParts = buildStatusParts(seenCount, openTaskCount, preparedAwaitingCount);
  const attentionItems = (priorityItems ?? [])
    .filter((item) => !item.seen_at)
    .slice(0, 3);

  const submissionRows = previewRows?.slice(0, 6) ?? [];

  return (
    <div className="yd-dash-mobile md:hidden">
      <header className="yd-dash-mobile__hero">
        <h1 className="yd-dash-mobile__title">
          {greeting}, {displayName}
        </h1>
        {statusParts.length > 0 ? (
          <ul className="yd-dash-mobile__status-list" role="status">
            {statusParts.map((part) => (
              <li key={part}>{part}</li>
            ))}
          </ul>
        ) : (
          <p className="yd-dash-mobile__status-empty" role="status">
            Praxis aktiv — keine offenen Vorgänge
          </p>
        )}
      </header>

      {attentionItems.length > 0 ? (
        <section className="yd-dash-mobile__attention" aria-label="Benötigt Aufmerksamkeit">
          <h2 className="yd-dash-mobile__section-title">Benötigt Aufmerksamkeit</h2>
          <ul className="yd-dash-mobile-attention-list">
            {attentionItems.map((item) => {
              const name = item.patient_name?.trim() || "Unbekannter Patient";
              const subject = deriveSubmissionIssueShortLine(
                item.patient_notes,
                item.patient_name,
                { maxLen: 72, emptyLabel: "Einsendung" }
              );
              return (
                <li key={item.id}>
                  <Link href={`/inbox/${item.id}`} className="yd-dash-mobile-attention-row">
                    <span className="yd-dash-mobile-attention-row__main">
                      <span className="yd-dash-mobile-attention-row__name">{name}</span>
                      {subject ? (
                        <span className="yd-dash-mobile-attention-row__subject">{subject}</span>
                      ) : null}
                    </span>
                    <span className="yd-dash-mobile-attention-row__meta">
                      <span className="yd-dash-mobile-attention-row__badge">Neu</span>
                      <span className="yd-dash-mobile-attention-row__date">
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

      <section className="yd-dash-mobile__inbox" aria-label="Aktuelle Einsendungen">
        <div className="yd-dash-mobile__section-head">
          <h2 className="yd-dash-mobile__section-title">Aktuelle Einsendungen</h2>
          <Link href="/inbox" className="yd-dash-mobile__section-link">
            Alle
          </Link>
        </div>
        {submissionRows.length > 0 ? (
          <ul className="yd-dash-mobile-inbox-list">
            {submissionRows.map((row) => {
              const name = row.patient_name?.trim() || "Unbekannter Patient";
              const subject = deriveSubmissionIssueShortLine(
                row.patient_notes,
                row.patient_name,
                { maxLen: 72, emptyLabel: "Einsendung" }
              );
              const isNew = !row.seen_at;
              return (
                <li key={row.id}>
                  <Link href={`/inbox/${row.id}`} className="yd-dash-mobile-inbox-row">
                    <span className="yd-dash-mobile-inbox-row__name">{name}</span>
                    <span className="yd-dash-mobile-inbox-row__subject">
                      {subject || "Einsendung"}
                    </span>
                    <span className="yd-dash-mobile-inbox-row__status">
                      {isNew ? "Neu" : "In Bearbeitung"}
                    </span>
                    <span className="yd-dash-mobile-inbox-row__date">
                      {formatRelativeDate(row.created_at)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="yd-dash-mobile__empty">Keine aktuellen Einsendungen.</p>
        )}
      </section>

      <section className="yd-dash-mobile__overview" aria-label="Praxisübersicht">
        <h2 className="yd-dash-mobile__section-title yd-dash-mobile__section-title--subtle">
          Praxisübersicht
        </h2>
        <div className="yd-dash-mobile-overview-grid">
          <Link href="/inbox" className="yd-dash-mobile-overview-stat">
            <span className="yd-dash-mobile-overview-stat__value">
              {seenCount === null ? "—" : seenCount}
            </span>
            <span className="yd-dash-mobile-overview-stat__label">Aktive Fälle</span>
          </Link>
          <Link href="/relay" className="yd-dash-mobile-overview-stat">
            <span className="yd-dash-mobile-overview-stat__value">{openTaskCount}</span>
            <span className="yd-dash-mobile-overview-stat__label">Offene Aufgaben</span>
          </Link>
          <Link href="/inbox" className="yd-dash-mobile-overview-stat">
            <span className="yd-dash-mobile-overview-stat__value">
              {unseenCount === null ? "—" : unseenCount}
            </span>
            <span className="yd-dash-mobile-overview-stat__label">Neue Einsendungen</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
