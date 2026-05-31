import Link from "next/link";

import type { DailyStatusMetrics } from "@/lib/dashboard/command-center";

type DashboardDailyStatusProps = {
  metrics: DailyStatusMetrics;
};

export function DashboardDailyStatus({ metrics }: DashboardDailyStatusProps) {
  const intakeLabel =
    metrics.intake === null
      ? "— Eingänge"
      : `${metrics.intake} ${metrics.intake === 1 ? "Eingang" : "Eingänge"}`;
  const tasksLabel = `${metrics.tasks} ${metrics.tasks === 1 ? "Aufgabe" : "Aufgaben"}`;
  const repliesLabel = `${metrics.replies} ${
    metrics.replies === 1 ? "Rückmeldung" : "Rückmeldungen"
  }`;

  return (
    <div className="yd-cockpit-status" role="status">
      <div className="yd-cockpit-status-pulse">
        <span
          className={
            metrics.practiceRunning
              ? "yd-cockpit-status-dot yd-cockpit-status-dot--ok"
              : "yd-cockpit-status-dot yd-cockpit-status-dot--active"
          }
          aria-hidden
        />
        <span className="yd-cockpit-status-label">
          {metrics.practiceRunning ? "Praxis läuft" : "Aktion nötig"}
        </span>
      </div>
      <ul className="yd-cockpit-metrics">
        <li>
          <Link href="/inbox" className="yd-cockpit-metric">
            {intakeLabel}
          </Link>
        </li>
        <li>
          <Link href="/my-tasks" className="yd-cockpit-metric">
            {tasksLabel}
          </Link>
        </li>
        <li>
          <Link href="/relay" className="yd-cockpit-metric">
            {repliesLabel}
          </Link>
        </li>
      </ul>
    </div>
  );
}
