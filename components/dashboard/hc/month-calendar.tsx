"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { HcCard } from "@/components/design/hc-card";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";

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
    <HcCard className="flex min-h-[320px] min-w-0 flex-col p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] font-semibold" style={{ color: HC.text }}>
          Monatsübersicht
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium" style={{ color: HC.textMuted }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: HC.primary }} />
            Einsendung
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "#F472B6" }} />
            Aufgabe
          </span>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-2xl bg-white/50 px-1 py-1">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="h-4 w-4" style={{ color: HC.textSecondary }} />
        </button>
        <p className="text-[14px] font-semibold capitalize" style={{ color: HC.text }}>
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="h-4 w-4" style={{ color: HC.textSecondary }} />
        </button>
      </div>

      <div className="grid flex-1 grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="py-1 text-[10px] font-semibold tracking-[0.08em]"
            style={{ color: HC.textMuted }}
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e-${i}`} className="h-10" />
          ) : (
            <span
              key={`${day}-${i}`}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-medium transition"
              style={
                isToday(day)
                  ? {
                      backgroundColor: HC.primary,
                      color: "#fff",
                      boxShadow: "0 4px 12px rgba(30, 58, 138, 0.35)",
                    }
                  : { color: HC.textSecondary }
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
