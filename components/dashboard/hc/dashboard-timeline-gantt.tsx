import Link from "next/link";

import type { DashboardGanttRow } from "@/lib/dashboard/dashboard-bento-model";

type Props = {
  rows: DashboardGanttRow[];
};

const GANTT_WEEKS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function DashboardTimelineGantt({ rows }: Props) {
  return (
    <section className="yd-dash-ref-card yd-dash-ref-card--timeline" aria-label="Aktive Vorgänge">
      <header className="yd-dash-ref-card__head yd-dash-ref-card__head--row">
        <h2 className="yd-dash-ref-card__title">Aktive Vorgänge</h2>
        <Link href="/relay" className="yd-dash-ref-card__link yd-dash-ref-card__link--inline" prefetch>
          Alle in Relay
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="yd-dash-ref-card__empty">Keine weiteren aktiven Vorgänge.</p>
      ) : (
        <div className="yd-dash-gantt">
          <div className="yd-dash-gantt__axis" aria-hidden>
            <span className="yd-dash-gantt__axis-spacer" />
            {GANTT_WEEKS.map((day) => (
              <span key={day} className="yd-dash-gantt__axis-day">
                {day}
              </span>
            ))}
            <span className="yd-dash-gantt__axis-spacer yd-dash-gantt__axis-spacer--end" />
          </div>

          {rows.map((row) => (
            <div key={row.id} className="yd-dash-gantt__row">
              <div className="yd-dash-gantt__label">
                <p className="yd-dash-gantt__type">{row.typeLabel}</p>
                <p className="yd-dash-gantt__title">{row.title}</p>
              </div>
              <div className="yd-dash-gantt__track">
                <div className="yd-dash-gantt__grid" aria-hidden />
                <Link href={row.href} className="yd-dash-gantt__bar-link" prefetch>
                  <span className="yd-dash-gantt__bar" style={{ width: `${row.weight * 100}%` }} />
                </Link>
              </div>
              <div className="yd-dash-gantt__meta">
                <p className="yd-dash-gantt__route">{row.route}</p>
                <p className="yd-dash-gantt__when">{row.when}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
