import Link from "next/link";
import { ChevronDown, ClipboardList, ListTodo, UserPlus } from "lucide-react";

import { DashboardMobileActions } from "@/components/dashboard/hc/dashboard-mobile-actions";
import { DashboardTodayPriority } from "@/components/dashboard/hc/dashboard-today-priority";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcDistributionArc } from "@/components/dashboard/hc/distribution-arc";
import type { DashboardPriorityItem } from "@/lib/queries/dashboard";

type DashboardMobileShellProps = {
  greeting: string;
  displayName: string;
  pendingApprovals: number | null;
  newCount: number | null;
  openTaskCount: number;
  weeklyCounts: number[] | null;
  unseenCount: number | null;
  seenCount: number | null;
  totalCount: number | null;
  priorityItems: DashboardPriorityItem[] | null;
};

function MobileKpiCard({
  href,
  title,
  value,
  hint,
  icon: Icon,
  emphasis = false,
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
      className={`yd-dash-mobile-kpi ${emphasis ? "yd-dash-mobile-kpi--emphasis" : ""}`}
    >
      <div className="yd-dash-mobile-kpi__icon" aria-hidden>
        <Icon strokeWidth={1.65} className="h-[17px] w-[17px] text-white" />
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
  newCount,
  openTaskCount,
  weeklyCounts,
  unseenCount,
  seenCount,
  totalCount,
  priorityItems,
}: DashboardMobileShellProps) {
  const subtitle = "Praxis aktiv · Vorgänge und Patienten im Überblick";
  return (
    <div className="yd-dash-mobile md:hidden">
      <header className="yd-dash-mobile__header">
        <h1 className="yd-dash-mobile__title">
          {greeting}, {displayName}
        </h1>
        <p className="yd-dash-mobile__priority">{subtitle}</p>
      </header>

      <DashboardMobileActions className="mb-1" />

      <div className="yd-dash-mobile__status" role="status">
        <span className="yd-dash-mobile__status-pill yd-dash-mobile__status-pill--active">
          <span className="yd-dash-mobile__status-dot" aria-hidden />
          Praxis aktiv
        </span>
        <span className="yd-dash-mobile__status-pill">
          {pendingApprovals ?? 0}{" "}
          {(pendingApprovals ?? 0) === 1 ? "Freigabe" : "Freigaben"}
        </span>
        <span className="yd-dash-mobile__status-pill">
          {openTaskCount} {openTaskCount === 1 ? "Aufgabe" : "Aufgaben"}
        </span>
      </div>

      <section className="yd-dash-mobile__kpis" aria-label="Prioritäten">
        <MobileKpiCard
          href="/inbox"
          title="Bereit zur Prüfung"
          value={unseenCount === null ? "—" : unseenCount}
          hint="Antworten vorbereitet"
          icon={ClipboardList}
          emphasis
        />
        <div className="yd-dash-mobile__kpi-row">
          <MobileKpiCard
            href="/inbox"
            title="Neue Fälle"
            value={newCount === null ? "—" : newCount}
            hint={newCount ? "Heute eingegangen" : "Keine neuen"}
            icon={UserPlus}
          />
          <MobileKpiCard
            href="/relay"
            title="Offene Aufgaben"
            value={openTaskCount}
            hint={openTaskCount > 0 ? "Offen" : "Alles erledigt"}
            icon={ListTodo}
          />
        </div>
      </section>

      <section className="yd-dash-mobile__today">
        <DashboardTodayPriority items={priorityItems} readyCount={unseenCount} />
      </section>

      <details className="yd-dash-fold yd-dash-mobile__fold">
        <summary className="yd-dash-fold__summary">
          <span>
            <span className="yd-dash-fold__title">Praxisentwicklung</span>
            <span className="yd-dash-fold__hint">Analytics</span>
          </span>
          <ChevronDown className="yd-dash-fold__chevron" aria-hidden />
        </summary>
        <div className="yd-dash-fold__panel yd-dash-mobile__fold-panel">
          <HcAnalyticsBars counts={weeklyCounts} totalLabel="Patientenanfragen · 7 Tage" />
          <div className="mt-4">
            <HcDistributionArc unseen={unseenCount} seen={seenCount} total={totalCount} />
          </div>
        </div>
      </details>
    </div>
  );
}
