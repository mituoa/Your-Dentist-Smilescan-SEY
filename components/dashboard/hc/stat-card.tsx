"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { TrendingUp, type LucideIcon } from "lucide-react";

import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

export type StatCardInlinePreview = {
  names: string[];
  moreLabel?: string;
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  footnote?: string;
  footnotePositive?: boolean;
  /** Primary KPI — stronger emphasis in the row */
  primary?: boolean;
  href?: string;
  inlinePreview?: StatCardInlinePreview;
  hoverPreview?: ReactNode;
};

export function HcStatCard({
  title,
  value,
  icon: Icon,
  footnote,
  footnotePositive = true,
  primary = false,
  href,
  inlinePreview,
  hoverPreview,
}: StatCardProps) {
  const cardBody = (
      <div
        className={cn(
          "yd-dash-surface yd-dash-kpi-card flex min-w-0 flex-col p-4 md:p-5",
          href && "yd-dash-kpi-card--linked",
          primary ? "yd-dash-kpi-card--primary min-h-[168px] md:min-h-[176px]" : "min-h-[142px] md:min-h-[148px]"
        )}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full text-white",
              primary ? "h-10 w-10 md:h-11 md:w-11" : "h-9 w-9 md:h-10 md:w-10"
            )}
            style={{
              background: YD.accent.iconGradient,
              boxShadow: primary
                ? "0 6px 16px rgba(47, 128, 237, 0.28)"
                : "0 4px 12px rgba(47, 128, 237, 0.2)",
            }}
          >
            <Icon
              className={primary ? "h-[18px] w-[18px] md:h-[19px] md:w-[19px]" : "h-[16px] w-[16px] md:h-[17px] md:w-[17px]"}
              strokeWidth={1.65}
            />
          </span>
          <p
            className={cn(
              "leading-snug",
              primary ? "text-[14px] font-semibold" : "text-[13px] font-medium"
            )}
            style={{ color: primary ? YD.text.primary : YD.text.secondary }}
          >
            {title}
          </p>
        </div>
        <p
          className={cn(
            "yd-dash-kpi font-semibold",
            primary && "yd-dash-kpi--primary",
            !primary && "yd-dash-kpi-quiet text-[1.625rem]"
          )}
        >
          {value}
        </p>
        {footnote ? (
          <p
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-[11px] font-medium leading-snug",
              primary && "text-[12px]"
            )}
            style={{ color: footnotePositive ? YD.trend.up : YD.text.muted }}
          >
            {!primary && footnotePositive ? (
              <TrendingUp className="h-3 w-3 shrink-0 opacity-80" strokeWidth={2} />
            ) : null}
            {footnote}
          </p>
        ) : null}
        {inlinePreview && (inlinePreview.names.length > 0 || inlinePreview.moreLabel) ? (
          <div className="yd-dash-kpi-inline-preview mt-3 border-t pt-3">
            {inlinePreview.names.map((name) => (
              <p key={name} className="yd-dash-kpi-inline-preview__name truncate">
                {name}
              </p>
            ))}
            {inlinePreview.moreLabel ? (
              <p className="yd-dash-kpi-inline-preview__more">{inlinePreview.moreLabel}</p>
            ) : null}
          </div>
        ) : null}
      </div>
  );

  return (
    <div className={cn("group relative min-w-0", primary && "z-[1]")}>
      {href ? (
        <Link href={href} className="block min-w-0 no-underline">
          {cardBody}
        </Link>
      ) : (
        cardBody
      )}

      {hoverPreview ? (
        <div className="yd-dash-kpi-float-preview" role="tooltip">
          <div className="yd-dash-kpi-float-preview__panel">{hoverPreview}</div>
        </div>
      ) : null}
    </div>
  );
}
