import Link from "next/link";

import type { DashboardTodayItem } from "@/lib/dashboard/dashboard-bento-model";
import { cn } from "@/lib/utils";

import { DashboardWeekStrip } from "./dashboard-week-strip";

type Props = {
  items: DashboardTodayItem[];
};

export function DashboardTodayPanel({ items }: Props) {
  return (
    <aside className="yd-dash-ref-card yd-dash-ref-card--schedule" aria-label="Heute relevant">
      <header className="yd-dash-ref-card__head">
        <h2 className="yd-dash-ref-card__title">Heute relevant</h2>
      </header>

      <DashboardWeekStrip />

      {items.length === 0 ? (
        <p className="yd-dash-ref-card__empty">Keine anstehenden Termine oder Entscheidungen.</p>
      ) : (
        <ul className="yd-dash-schedule-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="yd-dash-schedule-item" prefetch>
                <span
                  className={cn(
                    "yd-dash-schedule-item__dot",
                    item.kind === "routine" && "yd-dash-schedule-item__dot--routine"
                  )}
                  aria-hidden
                />
                <span className="yd-dash-schedule-item__label">{item.label}</span>
                <time className="yd-dash-schedule-item__when">{item.when}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/relay" className="yd-dash-ref-card__link" prefetch>
        Relay öffnen
      </Link>
    </aside>
  );
}
