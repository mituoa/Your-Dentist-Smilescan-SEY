"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";

const WEEKDAYS = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];

export function HcMonthCalendar() {
  const today = new Date();
  const [view, setView] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const { cells, monthLabel } = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
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

  return (
    <HcCard tone="quiet" ambient={false} className="yd-dash-surface flex min-h-[300px] min-w-0 flex-col p-5 md:p-6">
      <div className="mb-4">
        <p className="yd-dash-section">Monatliche Aktivität</p>
      </div>

      <div
        className="mb-5 flex items-center justify-between rounded-[18px] px-1 py-1"
        style={{ background: "rgba(255,255,255,0.45)" }}
      >
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition duration-300 hover:bg-white/80"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="h-4 w-4" style={{ color: YD.text.muted }} strokeWidth={1.65} />
        </button>
        <p className="text-[13px] font-medium capitalize tracking-tight" style={{ color: YD.text.primary }}>
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition duration-300 hover:bg-white/80"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="h-4 w-4" style={{ color: YD.text.muted }} strokeWidth={1.65} />
        </button>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="yd-dash-meta py-1">
            {d}
          </span>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e-${i}`} className="h-9" />
          ) : (
            <span
              key={`${day}-${i}`}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-medium transition duration-300"
              style={
                isToday(day)
                  ? {
                      background: YD.accent.iconGradient,
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(47, 128, 237, 0.28)",
                    }
                  : { color: YD.text.muted }
              }
            >
              {day}
            </span>
          )
        )}
      </div>
    </HcCard>
  );
}
