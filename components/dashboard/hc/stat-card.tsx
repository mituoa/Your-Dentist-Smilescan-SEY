import type { ReactNode } from "react";
import { TrendingUp, type LucideIcon } from "lucide-react";

import { YdFloatingContext } from "@/components/ambient/yd-floating-context";
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
  lift?: boolean;
  glow?: boolean;
  tone?: YdCardTone;
  hero?: boolean;
  /** Floating OS context layer — does not resize card */
  floatingPreview?: ReactNode;
};

export function HcStatCard({
  title,
  value,
  icon: Icon,
  footnote,
  footnotePositive = true,
  metricA,
  metricB,
  lift,
  glow,
  tone = "default",
  hero = false,
  floatingPreview,
}: StatCardProps) {
  const card = (
    <HcCard
      lift={lift}
      glow={glow}
      tone={tone}
      className={`flex min-w-0 flex-col ${hero ? "min-h-[156px] p-4 md:min-h-[216px] md:p-7" : "min-h-[132px] p-4 md:min-h-[188px] md:p-6"}`}
    >
      <div className={`flex items-start justify-between gap-3 ${hero ? "mb-3 md:mb-5" : "mb-2.5 md:mb-4"}`}>
        <span
          className={`flex items-center justify-center rounded-full ${hero ? "h-9 w-9 md:h-11 md:w-11" : "h-8 w-8 md:h-10 md:w-10"}`}
          style={{
            background: YD.accent.iconGradient,
            boxShadow: hero
              ? "0 6px 18px rgba(47, 128, 237, 0.28)"
              : "0 4px 14px rgba(30, 91, 189, 0.2)",
          }}
        >
          <Icon
            className={`text-white ${hero ? "h-[19px] w-[19px]" : "h-[17px] w-[17px]"}`}
            strokeWidth={1.65}
          />
        </span>
      </div>
      <p className="yd-dash-label">{title}</p>
      <p className={`mt-2 ${hero ? "yd-dash-kpi-hero" : tone === "quiet" ? "yd-dash-kpi-quiet" : "yd-dash-kpi"}`}>
        {value}
      </p>
      {footnote ? (
        <p
          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium leading-relaxed"
          style={{ color: footnotePositive ? YD.trend.up : YD.text.faint }}
        >
          {footnotePositive ? (
            <TrendingUp className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2} />
          ) : null}
          {footnote}
        </p>
      ) : null}
      {metricA || metricB ? (
        <div
          className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-[11px] leading-relaxed md:gap-x-4 md:pt-4"
          style={{ borderColor: "rgba(180, 198, 218, 0.32)" }}
        >
          {metricA ? (
            <span className="yd-dash-meta">
              {metricA.label}{" "}
              <span className="font-medium" style={{ color: YD.text.secondary }}>
                {metricA.value}
              </span>
            </span>
          ) : null}
          {metricB ? (
            <span className="yd-dash-meta">
              {metricB.label}{" "}
              <span className="font-medium" style={{ color: YD.text.secondary }}>
                {metricB.value}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </HcCard>
  );

  if (!floatingPreview) return card;

  return <YdFloatingContext preview={floatingPreview}>{card}</YdFloatingContext>;
}
