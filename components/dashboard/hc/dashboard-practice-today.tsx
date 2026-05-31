import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";

type DashboardPracticeTodayProps = {
  readyCount: number | null;
  openTasksCount: number | null;
  nextPatientName: string | null;
  nextHref: string | null;
};

export function DashboardPracticeToday({
  readyCount,
  openTasksCount,
  nextPatientName,
  nextHref,
}: DashboardPracticeTodayProps) {
  const ready = readyCount ?? 0;
  const tasks = openTasksCount ?? 0;

  return (
    <aside className="yd-dash-practice-today min-w-0 lg:sticky lg:top-2" aria-labelledby="yd-dash-practice-title">
      <HcCard tone="quiet" className="yd-dash-surface p-5 md:p-6">
        <h2 id="yd-dash-practice-title" className="yd-dash-section text-[1rem]">
          Praxis heute
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="yd-dash-practice-stat rounded-[18px] px-3 py-3">
            <p className="yd-dash-kpi text-[1.5rem]">{readyCount === null ? "—" : ready}</p>
            <p className="mt-1 text-[11px] font-medium leading-snug" style={{ color: YD.text.muted }}>
              Antworten bereit
            </p>
          </div>
          <div className="yd-dash-practice-stat rounded-[18px] px-3 py-3">
            <p className="yd-dash-kpi text-[1.5rem]">{openTasksCount === null ? "—" : tasks}</p>
            <p className="mt-1 text-[11px] font-medium leading-snug" style={{ color: YD.text.muted }}>
              offene Aufgaben
            </p>
          </div>
        </div>

        <div
          className="mt-4 rounded-[18px] px-3.5 py-3.5"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(241,247,252,0.9) 100%)",
            border: `1px solid ${YD.border.soft}`,
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: YD.text.faint }}>
            Nächster Schritt
          </p>
          {nextHref && nextPatientName ? (
            <Link
              href={nextHref}
              className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold transition hover:opacity-85"
              style={{ color: YD.accent.core }}
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              {nextPatientName} prüfen
            </Link>
          ) : (
            <p className="mt-2 text-[13px] font-medium" style={{ color: YD.text.secondary }}>
              Alles erledigt
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-[12px]">
          <Link href="/inbox" className="font-medium transition hover:opacity-80" style={{ color: YD.accent.core }}>
            Posteingang öffnen
          </Link>
          {tasks > 0 ? (
            <Link href="/my-tasks" className="font-medium transition hover:opacity-80" style={{ color: YD.text.secondary }}>
              Aufgaben ({tasks})
            </Link>
          ) : null}
        </div>
      </HcCard>
    </aside>
  );
}
