"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ListTodo,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import {
  KpiWorkContextPreview,
  type KpiWorkContextData,
} from "@/components/dashboard/hc/kpi-work-context-preview";
import { KpiHoverPreview } from "@/components/dashboard/hc/kpi-hover-preview";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

export type DashboardKpiIconName =
  | "clipboard-list"
  | "user-plus"
  | "sparkles"
  | "list-todo";

const KPI_ICON_BY_NAME: Record<DashboardKpiIconName, LucideIcon> = {
  "clipboard-list": ClipboardList,
  "user-plus": UserPlus,
  sparkles: Sparkles,
  "list-todo": ListTodo,
};

type StatCardProps = {
  title: string;
  value: string | number;
  iconName: DashboardKpiIconName;
  footnote?: string;
  href?: string;
  workContext?: KpiWorkContextData;
  hoverHint?: string;
  hoverLines?: string[];
  hoverPreview?: ReactNode;
};

export function HcStatCard({
  title,
  value,
  iconName,
  footnote,
  href,
  workContext,
  hoverHint,
  hoverLines,
  hoverPreview,
}: StatCardProps) {
  const Icon = KPI_ICON_BY_NAME[iconName] ?? ClipboardList;

  const resolvedHoverPreview =
    hoverPreview ??
    (workContext ? (
      <KpiWorkContextPreview data={workContext} />
    ) : hoverHint || hoverLines?.length ? (
      <KpiHoverPreview hint={hoverHint} lines={hoverLines} />
    ) : null);

  const cardBody = (
    <div
      className={cn(
        "yd-dash-surface yd-dash-kpi-card flex h-full min-w-0 flex-col justify-between p-5 md:px-6 md:py-[1.375rem]",
        href && "yd-dash-kpi-card--linked"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[12px] font-medium leading-snug tracking-[-0.01em] md:text-[13px]"
          style={{ color: YD.text.muted }}
        >
          {title}
        </p>
        <span className="yd-dash-kpi-card__icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-[2.625rem] md:w-[2.625rem]">
          <Icon className="h-[17px] w-[17px] md:h-[18px] md:w-[18px]" strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-auto pt-5">
        <p className="yd-dash-kpi yd-dash-kpi--balanced font-semibold">{value}</p>
        {footnote ? (
          <p
            className="mt-1.5 text-[10px] font-medium leading-snug md:text-[11px]"
            style={{ color: YD.text.faint }}
          >
            {footnote}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="group relative flex h-full min-w-0 flex-col">
      {href ? (
        <Link href={href} className="block h-full min-w-0 no-underline">
          {cardBody}
        </Link>
      ) : (
        cardBody
      )}

      {resolvedHoverPreview ? (
        <div className="yd-dash-kpi-float-preview" role="tooltip">
          <div className="yd-dash-kpi-float-preview__panel">{resolvedHoverPreview}</div>
        </div>
      ) : null}
    </div>
  );
}
