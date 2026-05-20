import { Calendar, TrendingUp } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";

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
    <HcCard className="flex min-h-[320px] min-w-0 flex-col overflow-hidden p-5 md:p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold" style={{ color: HC.text }}>
            Einsendungen
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-[32px] font-bold leading-none tracking-[-0.03em]" style={{ color: HC.text }}>
              {counts === null ? "—" : weekTotal}
            </p>
            {counts !== null && weekTotal > 0 ? (
              <span
                className="inline-flex items-center gap-0.5 text-[12px] font-medium"
                style={{ color: HC.trendUp }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                7 Tage
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px]" style={{ color: HC.textMuted }}>
            {totalLabel}
          </p>
        </div>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" />}>7 Tage</HcFilterChip>
      </div>

      <div className="relative flex min-h-[220px] min-w-0 flex-1 items-end justify-between gap-1 overflow-hidden rounded-2xl px-0.5 pb-1 sm:gap-2">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            backgroundImage: HC.chartDotGrid,
            backgroundSize: "12px 12px",
            backgroundPosition: "bottom center",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: HC.chartAreaFade }}
          aria-hidden
        />
        {[0.25, 0.5, 0.75].map((line) => (
          <div
            key={line}
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed"
            style={{
              bottom: `${line * 100}%`,
              borderColor: "rgba(180, 198, 218, 0.75)",
            }}
            aria-hidden
          />
        ))}
        {values.map((count, i) => {
          const solidH = Math.max(16, Math.round((count / max) * 120));
          const stripeH = Math.max(10, Math.round(solidH * 0.45));
          return (
            <div key={DAY_LABELS[i]} className="relative z-[1] flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full max-w-[40px] items-end justify-center gap-[3px]">
                <div className="flex w-[46%] flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t-[6px]"
                    style={{
                      height: stripeH,
                      background: HC.chartStripe,
                    }}
                  />
                  <div
                    className="w-full rounded-t-[8px]"
                    style={{
                      height: Math.max(8, solidH * 0.35),
                      background: HC.chartBarLight,
                    }}
                  />
                </div>
                <div
                  className="w-[46%] rounded-t-[10px] shadow-sm"
                  style={{
                    height: solidH,
                    background: HC.chartBar,
                    boxShadow: "0 -2px 8px rgba(30, 91, 189, 0.2)",
                  }}
                />
              </div>
              <span className="text-[11px] font-medium" style={{ color: HC.textMuted }}>
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </HcCard>
  );
}
