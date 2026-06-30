import Link from "next/link";

import { DashboardPremiumCalendar } from "@/components/dashboard/hc/dashboard-premium-calendar";
import type { DashboardTodayItem } from "@/lib/dashboard/dashboard-bento-model";
import { cn } from "@/lib/utils";

type Props = {
  items: DashboardTodayItem[];
  weeklyCounts?: number[] | null;
};

export function DashboardTodayPanel({ items, weeklyCounts }: Props) {
  const hasLive = items.some((item) => !item.isExample);

  return (
    <aside className="yd-dash-ref-card yd-dash-ref-card--schedule" aria-label="Kalender und Tagesplan">
      <DashboardPremiumCalendar weeklyCounts={weeklyCounts} />

      <div className="yd-dash-calendar-agenda">
        <header className="yd-dash-ref-card__head yd-dash-calendar-agenda__head">
          <h2 className="yd-dash-ref-card__title">Heute relevant</h2>
        </header>

      <ul className="yd-dash-schedule-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "yd-dash-schedule-item",
                item.isExample && "yd-dash-schedule-item--example"
              )}
              prefetch={!item.isExample}
            >
              <span className="yd-dash-schedule-item__dot" aria-hidden />
              <span className="yd-dash-schedule-item__label">{item.label}</span>
              {item.when ? (
                <time className="yd-dash-schedule-item__when">{item.when}</time>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {hasLive ? (
        <Link href="/relay" className="yd-dash-ref-card__link" prefetch>
          Relay öffnen
        </Link>
      ) : null}
      </div>
    </aside>
  );
}
