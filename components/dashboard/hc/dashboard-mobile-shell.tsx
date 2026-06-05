import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  ListTodo,
  Plus,
  UserPlus,
} from "lucide-react";

import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcPracticeStatus } from "@/components/dashboard/hc/practice-status";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

type DashboardMobileShellProps = {
  greeting: string;
  displayName: string;
  pendingApprovals: number | null;
  openTaskCount: number;
  weeklyCounts: number[] | null;
  unseenCount: number | null;
  seenCount: number | null;
  previewRows: SubmissionPreviewRow[] | null;
};

function MobileKpiCard({
  href,
  title,
  value,
  hint,
  icon: Icon,
  emphasis,
}: {
  href: string;
  title: string;
  value: string | number;
  hint: string;
  icon: typeof ClipboardList;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`yd-dash-mobile-kpi${emphasis ? " yd-dash-mobile-kpi--emphasis" : ""}`}
    >
      <div className="yd-dash-mobile-kpi__icon" aria-hidden>
        <Icon strokeWidth={1.65} className="h-[16px] w-[16px]" />
      </div>
      <div className="yd-dash-mobile-kpi__body min-w-0">
        <p className="yd-dash-mobile-kpi__title">{title}</p>
        <p className="yd-dash-mobile-kpi__value">{value}</p>
        <p className="yd-dash-mobile-kpi__hint">{hint}</p>
      </div>
    </Link>
  );
}

export function DashboardMobileShell({
  greeting,
  displayName,
  pendingApprovals,
  openTaskCount,
  weeklyCounts,
  unseenCount,
  seenCount,
  previewRows,
}: DashboardMobileShellProps) {
  const reviewCount = pendingApprovals ?? 0;
  const statusLine =
    reviewCount > 0 && openTaskCount > 0
      ? `${reviewCount} zur Durchsicht · ${openTaskCount} Aufgaben`
      : reviewCount > 0
        ? `${reviewCount} ${reviewCount === 1 ? "Einsendung" : "Einsendungen"} zur Durchsicht`
        : openTaskCount > 0
          ? `${openTaskCount} ${openTaskCount === 1 ? "Aufgabe" : "Aufgaben"} offen`
          : "Praxis aktiv — keine offenen Vorgänge";

  return (
    <div className="yd-dash-mobile md:hidden">
      {reviewCount > 0 ? (
        <Link href="/inbox" className="yd-dash-mobile-critical">
          <div className="min-w-0">
            <p className="yd-dash-mobile-critical__label">Kritisch · Heute</p>
            <p className="yd-dash-mobile-critical__title">
              {reviewCount} {reviewCount === 1 ? "Einsendung" : "Einsendungen"} zur Durchsicht
            </p>
          </div>
          <span className="yd-dash-mobile-critical__cta">Öffnen</span>
        </Link>
      ) : null}

      <section className="yd-dash-mobile__actions" aria-label="Wichtigste Aktionen">
        <div className="yd-dash-mobile-actions-grid">
          <Link href="/inbox" className="yd-dash-mobile-action yd-dash-mobile-action--primary">
            <ClipboardList className="yd-dash-mobile-action__icon" strokeWidth={1.75} aria-hidden />
            <span className="yd-dash-mobile-action__label">Tracker</span>
            {unseenCount != null && unseenCount > 0 ? (
              <span className="yd-dash-mobile-action__badge">{unseenCount > 9 ? "9+" : unseenCount}</span>
            ) : null}
          </Link>
          <Link href="/relay" className="yd-dash-mobile-action">
            <ListTodo className="yd-dash-mobile-action__icon" strokeWidth={1.75} aria-hidden />
            <span className="yd-dash-mobile-action__label">Relay</span>
            {openTaskCount > 0 ? (
              <span className="yd-dash-mobile-action__badge">
                {openTaskCount > 9 ? "9+" : openTaskCount}
              </span>
            ) : null}
          </Link>
          <Link href="/journal" className="yd-dash-mobile-action">
            <BookOpen className="yd-dash-mobile-action__icon" strokeWidth={1.75} aria-hidden />
            <span className="yd-dash-mobile-action__label">Journal</span>
          </Link>
          <Link href="/create-case" className="yd-dash-mobile-action">
            <Plus className="yd-dash-mobile-action__icon" strokeWidth={1.75} aria-hidden />
            <span className="yd-dash-mobile-action__label">Fall</span>
          </Link>
        </div>
      </section>

      <header className="yd-dash-mobile__header">
        <p className="yd-dash-mobile__eyebrow">Praxisüberblick</p>
        <h1 className="yd-dash-mobile__title">
          {greeting}, {displayName}
        </h1>
        <p className="yd-dash-mobile__status-line" role="status">
          {statusLine}
        </p>
      </header>

      <section className="yd-dash-mobile__kpis" aria-label="Heute">
        <p className="yd-dash-mobile__section-label">Heute</p>
        <div className="yd-dash-mobile__kpi-stack">
          <MobileKpiCard
            href="/inbox"
            title="Neue Einsendungen"
            value={unseenCount === null ? "—" : unseenCount}
            hint="Zur Durchsicht im Tracker"
            icon={ClipboardList}
            emphasis={reviewCount > 0}
          />
          <div className="yd-dash-mobile__kpi-row">
            <MobileKpiCard
              href="/relay"
              title="Offene Aufgaben"
              value={openTaskCount}
              hint="Praxisworkflow"
              icon={ListTodo}
            />
            <MobileKpiCard
              href="/inbox"
              title="Aktive Fälle"
              value={seenCount === null ? "—" : seenCount}
              hint="Laufende Prozesse"
              icon={UserPlus}
            />
          </div>
        </div>
      </section>

      <section className="yd-dash-mobile__submissions" aria-label="Patienten">
        <p className="yd-dash-mobile__section-label">Patienten</p>
        <HcRecentTable rows={previewRows} mobileLimit={3} compactMobile />
      </section>

      <Link href="/journal" className="yd-dash-mobile-journal-teaser">
        <div className="yd-dash-mobile-journal-teaser__body">
          <p className="yd-dash-mobile-journal-teaser__eyebrow">Praxiswissen</p>
          <p className="yd-dash-mobile-journal-teaser__title">Journal öffnen</p>
          <p className="yd-dash-mobile-journal-teaser__copy">
            Antworten, Nachsorge und Erklärungen für Patienten
          </p>
        </div>
        <BookOpen className="yd-dash-mobile-journal-teaser__icon" strokeWidth={1.5} aria-hidden />
      </Link>

      <details className="yd-dash-fold yd-dash-mobile__fold">
        <summary className="yd-dash-fold__summary">
          <span>
            <span className="yd-dash-fold__title">Praxisentwicklung</span>
            <span className="yd-dash-fold__hint">Analytics</span>
          </span>
          <ChevronDown className="yd-dash-fold__chevron" aria-hidden />
        </summary>
        <div className="yd-dash-fold__panel yd-dash-mobile__fold-panel">
          <HcAnalyticsBars counts={weeklyCounts} />
          <div className="mt-3">
            <HcPracticeStatus
              unseen={unseenCount}
              seen={seenCount}
              openTaskCount={openTaskCount}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
