import { Calendar } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import type { PracticeDevelopmentSnapshot } from "@/lib/command-ai/practice-intelligence";
import { YD } from "@/lib/design/yd-design-tokens";

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

type AnalyticsBarsProps = {
  counts: number[] | null;
  development?: PracticeDevelopmentSnapshot | null;
};

export function HcAnalyticsBars({ counts, development = null }: AnalyticsBarsProps) {
  const values = counts ?? [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...values, 1);
  const weekTotal = values.reduce((a, b) => a + b, 0);
  const activeDays = values.filter((c) => c > 0).length;

  const prepared = development?.preparedResponses ?? null;
  const activeCases = development?.activeCases ?? null;
  const decisions = development?.decisionsPending ?? null;

  return (
    <HcCard
      tone="primary"
      ambient={false}
      className="yd-dash-surface yd-dash-analytics-card flex min-w-0 flex-col overflow-hidden p-5 md:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="yd-dash-section yd-dash-section--secondary">Praxisentwicklung</p>
          <p className="mt-2 text-[13px] font-medium leading-snug" style={{ color: YD.text.secondary }}>
            Wert durch Assistenz — diese Woche
          </p>
          <p className="yd-dash-kpi-quiet mt-3 text-[1.5rem] md:text-[1.625rem]">
            {counts === null ? "—" : weekTotal}
          </p>
          <p className="yd-dash-meta mt-1 normal-case tracking-normal" style={{ color: YD.text.muted }}>
            Neue Patientenfälle · 7 Tage
            {counts !== null && activeDays > 0 ? ` · ${activeDays} aktive Tage` : ""}
          </p>

          {development ? (
            <ul className="mt-4 space-y-1.5">
              {prepared !== null ? (
                <li className="text-[12px] leading-snug text-[#475569]">
                  <span className="font-medium text-[#334155]">{prepared}</span>{" "}
                  {prepared === 1 ? "Antwort vorbereitet" : "Antworten vorbereitet"}
                </li>
              ) : null}
              {activeCases !== null && activeCases > 0 ? (
                <li className="text-[12px] leading-snug text-[#475569]">
                  <span className="font-medium text-[#334155]">{activeCases}</span>{" "}
                  {activeCases === 1 ? "Fall aktiv bearbeitet" : "Fälle aktiv bearbeitet"}
                </li>
              ) : null}
              {decisions !== null && decisions > 0 ? (
                <li className="text-[12px] leading-snug text-[#475569]">
                  <span className="font-medium text-[#334155]">{decisions}</span>{" "}
                  {decisions === 1 ? "Entscheidung ausstehend" : "Entscheidungen ausstehend"}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.65} />}>
          Woche
        </HcFilterChip>
      </div>

      <div className="relative flex min-h-[200px] min-w-0 flex-1 items-end justify-between gap-1 overflow-hidden rounded-[18px] px-1 pb-2 sm:gap-2">
        <div
          className="pointer-events-none absolute inset-0 rounded-[18px]"
          style={{
            backgroundImage: YD.chart.grid,
            backgroundSize: "14px 14px",
            opacity: 0.45,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[18px]"
          style={{ background: YD.chart.areaFade }}
          aria-hidden
        />
        {values.map((count, i) => {
          const solidH = Math.max(12, Math.round((count / max) * 96));
          return (
            <div key={DAY_LABELS[i]} className="relative z-[1] flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full max-w-[40px] items-end justify-center">
                <div
                  className="w-full rounded-t-[8px] transition-[height] duration-300 ease-out"
                  style={{
                    height: solidH,
                    background: count > 0 ? YD.accent.chartBar : "rgba(180, 198, 218, 0.35)",
                    boxShadow: count > 0 ? "0 -3px 12px rgba(47, 128, 237, 0.12)" : "none",
                  }}
                />
              </div>
              <span className="yd-dash-meta normal-case">{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </HcCard>
  );
}
