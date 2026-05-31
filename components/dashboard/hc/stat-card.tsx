import { TrendingUp, type LucideIcon } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import type { YdCardTone } from "@/components/design-system/yd-card";
import { YD } from "@/lib/design/yd-design-tokens";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  footnote?: string;
  footnotePositive?: boolean;
  metricA?: { label: string; value: string | number };
  metricB?: { label: string; value: string | number };
  tone?: YdCardTone;
};

/** Reference KPI card — icon + title, metric, trend, split footer */
export function HcStatCard({
  title,
  value,
  icon: Icon,
  footnote,
  footnotePositive = true,
  metricA,
  metricB,
  tone = "default",
}: StatCardProps) {
  return (
    <HcCard
      tone={tone}
      ambient={false}
      className="yd-dash-surface yd-dash-kpi-card flex min-h-[142px] min-w-0 flex-col p-4 md:min-h-[148px] md:p-5"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full md:h-10 md:w-10"
          style={{
            background: YD.accent.iconGradient,
            boxShadow: "0 4px 12px rgba(47, 128, 237, 0.2)",
          }}
        >
          <Icon className="h-[16px] w-[16px] text-white md:h-[17px] md:w-[17px]" strokeWidth={1.65} />
        </span>
        <p className="yd-dash-kpi-title text-[13px] font-medium leading-snug">{title}</p>
      </div>
      <p className={`yd-dash-kpi ${tone === "quiet" ? "yd-dash-kpi-quiet" : ""}`}>{value}</p>
      {footnote ? (
        <p
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium leading-snug"
          style={{ color: footnotePositive ? YD.trend.up : YD.text.muted }}
        >
          {footnotePositive ? (
            <TrendingUp className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2} />
          ) : null}
          {footnote}
        </p>
      ) : null}
      {metricA || metricB ? (
        <div
          className="yd-dash-kpi-metrics mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-[11px] leading-relaxed md:pt-3.5"
          style={{ borderColor: "rgba(180, 198, 218, 0.32)" }}
        >
          {metricA ? (
            <span className="yd-dash-meta normal-case tracking-normal">
              {metricA.label}{" "}
              <span className="font-semibold" style={{ color: YD.text.secondary }}>
                {metricA.value}
              </span>
            </span>
          ) : null}
          {metricB ? (
            <span className="yd-dash-meta normal-case tracking-normal">
              {metricB.label}{" "}
              <span className="font-semibold" style={{ color: YD.text.secondary }}>
                {metricB.value}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </HcCard>
  );
}
