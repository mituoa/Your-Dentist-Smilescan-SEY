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
        "yd-dash-surface yd-dash-kpi-card flex h-full min-w-0 flex-col p-5 md:p-[1.375rem]",
        href && "yd-dash-kpi-card--linked"
      )}
    >
      <div className="yd-dash-kpi-card__head flex min-w-0 items-center gap-3">
        <span className="yd-dash-kpi-card__icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
        </span>
        <p className="yd-dash-kpi-card__title min-w-0 text-[13px] font-semibold leading-snug tracking-[-0.015em] md:text-[14px]">
          {title}
        </p>
      </div>
      <div className="yd-dash-kpi-card__body mt-auto pt-4 md:pt-[1.125rem]">
        <p className="yd-dash-kpi yd-dash-kpi--balanced font-semibold">{value}</p>
        {footnote ? (
          <p className="yd-dash-kpi-card__footnote mt-1.5 text-[11px] font-medium leading-snug md:text-[12px]">
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
