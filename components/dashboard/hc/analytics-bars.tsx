import { Calendar } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import { YD } from "@/lib/design/yd-design-tokens";

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

type AnalyticsBarsProps = {
  counts: number[] | null;
  totalLabel: string;
};

export function HcAnalyticsBars({ counts, totalLabel }: AnalyticsBarsProps) {
  const values = counts ?? [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...values, 1);
  const weekTotal = values.reduce((a, b) => a + b, 0);

  return (
    <HcCard
      tone="primary"
      className="yd-awaken-chart yd-dash-chart-card flex min-h-[340px] min-w-0 flex-col overflow-hidden p-6 md:min-h-[360px] md:p-7"
      style={{ ["--yd-chart-stagger" as string]: "0ms" }}
    >
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="yd-dash-section">Einsendungsverlauf</p>
          <p className="yd-dash-kpi mt-3">{counts === null ? "—" : weekTotal}</p>
          <p className="yd-dash-meta mt-2 normal-case tracking-normal">{totalLabel}</p>
        </div>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.65} />}>
          7 Tage
        </HcFilterChip>
      </div>

      <div className="relative flex min-h-[240px] min-w-0 flex-1 items-end justify-between gap-1 overflow-hidden rounded-[20px] px-1 pb-2 sm:gap-2.5">
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{
            backgroundImage: YD.chart.grid,
            backgroundSize: "14px 14px",
            opacity: 0.55,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{ background: YD.chart.areaFade }}
          aria-hidden
        />
        {[0.33, 0.66].map((line) => (
          <div
            key={line}
            className="pointer-events-none absolute left-2 right-2 border-t"
            style={{
              bottom: `${line * 100}%`,
              borderColor: "rgba(180, 198, 218, 0.35)",
            }}
            aria-hidden
          />
        ))}
        {values.map((count, i) => {
          const solidH = Math.max(14, Math.round((count / max) * 108));
          const stripeH = Math.max(8, Math.round(solidH * 0.4));
          return (
            <div key={DAY_LABELS[i]} className="relative z-[1] flex flex-1 flex-col items-center gap-2.5">
              <div className="flex w-full max-w-[44px] items-end justify-center gap-[4px]">
                <div className="flex w-[44%] flex-col items-center justify-end opacity-90">
                  <div
                    className="w-full rounded-t-[5px]"
                    style={{ height: stripeH, background: YD.accent.chartStripe, opacity: 0.85 }}
                  />
                  <div
                    className="w-full rounded-t-[6px]"
                    style={{
                      height: Math.max(6, solidH * 0.32),
                      background: YD.accent.chartBarSoft,
                      opacity: 0.9,
                    }}
                  />
                </div>
                <div
                  className="w-[44%] rounded-t-[9px]"
                  style={{
                    height: solidH,
                    background: YD.accent.chartBar,
                    boxShadow: "0 -4px 14px rgba(47, 128, 237, 0.16)",
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
