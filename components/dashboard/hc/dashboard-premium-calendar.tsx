"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardWeekStrip } from "@/components/dashboard/hc/dashboard-week-strip";

const WEEKDAYS = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

type Props = {
  weeklyCounts?: number[] | null;
  compact?: boolean;
};

function buildActivityMap(weeklyCounts: number[] | null | undefined): Map<string, number> {
  const map = new Map<string, number>();
  if (!weeklyCounts?.length) return map;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  weeklyCounts.forEach((count, index) => {
    if (count <= 0) return;
    const d = new Date(today);
    d.setDate(today.getDate() - (weeklyCounts.length - 1 - index));
    map.set(d.toISOString().slice(0, 10), count);
  });

  return map;
}

function mondayPadding(year: number, month: number): number {
  const dow = new Date(year, month, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function DashboardPremiumCalendar({ weeklyCounts, compact = false }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [view, setView] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const activityMap = useMemo(() => buildActivityMap(weeklyCounts), [weeklyCounts]);

  const { cells, monthLabel } = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const startPad = mondayPadding(year, month);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const monthLabel = view.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    });

    return { cells, monthLabel };
  }, [view]);

  const shiftMonth = (delta: number) => {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    view.getMonth() === today.getMonth() &&
    view.getFullYear() === today.getFullYear();

  const activityForDay = (day: number): number => {
    const key = new Date(view.getFullYear(), view.getMonth(), day).toISOString().slice(0, 10);
    return activityMap.get(key) ?? 0;
  };

  return (
    <div
      className={compact ? "yd-dash-premium-calendar yd-dash-premium-calendar--compact" : "yd-dash-premium-calendar"}
      aria-label="Kalender"
    >
      <header className="yd-dash-premium-calendar__head">
        <div className="yd-dash-premium-calendar__title-row">
          <h2 className="yd-dash-ref-card__title">Kalender</h2>
          <p className="yd-dash-premium-calendar__subtitle">Praxis & Termine</p>
        </div>
        <div className="yd-dash-premium-calendar__month-nav">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="yd-dash-premium-calendar__nav-btn"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <p className="yd-dash-premium-calendar__month-label">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="yd-dash-premium-calendar__nav-btn"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <DashboardWeekStrip />

      <div className="yd-dash-premium-calendar__grid-wrap">
        <div className="yd-dash-premium-calendar__weekdays" aria-hidden>
          {WEEKDAYS.map((d) => (
            <span key={d} className="yd-dash-premium-calendar__weekday">
              {d}
            </span>
          ))}
        </div>
        <div className="yd-dash-premium-calendar__grid" role="grid" aria-label={monthLabel}>
          {cells.map((day, i) => {
            if (day === null) {
              return <span key={`e-${i}`} className="yd-dash-premium-calendar__cell yd-dash-premium-calendar__cell--empty" />;
            }

            const activity = activityForDay(day);
            const todayCell = isToday(day);

            return (
              <span
                key={`${day}-${i}`}
                role="gridcell"
                className={[
                  "yd-dash-premium-calendar__cell",
                  todayCell && "yd-dash-premium-calendar__cell--today",
                  activity > 0 && "yd-dash-premium-calendar__cell--activity",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={todayCell ? "date" : undefined}
                title={activity > 0 ? `${activity} Einsendung${activity === 1 ? "" : "en"}` : undefined}
              >
                <span className="yd-dash-premium-calendar__day-num">{day}</span>
                {activity > 0 ? (
                  <span className="yd-dash-premium-calendar__dot" aria-hidden />
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
