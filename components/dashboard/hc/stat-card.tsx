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

import { KpiHoverPreview } from "@/components/dashboard/hc/kpi-hover-preview";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

export type StatCardInlinePreview = {
  names: string[];
  moreLabel?: string;
};

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
  /** Einzeiliger Hover-Hinweis (dezenter Tooltip) */
  hoverHint?: string;
  hoverLines?: string[];
  /** @deprecated Prefer hoverHint — kept for client-only usage */
  hoverPreview?: ReactNode;
};

export function HcStatCard({
  title,
  value,
  iconName,
  footnote,
  href,
  hoverHint,
  hoverLines,
  hoverPreview,
}: StatCardProps) {
  const Icon = KPI_ICON_BY_NAME[iconName] ?? ClipboardList;

  const resolvedHoverPreview =
    hoverPreview ??
    (hoverHint || hoverLines?.length ? (
      <KpiHoverPreview hint={hoverHint} lines={hoverLines} />
    ) : null);

  const cardBody = (
    <div
      className={cn(
        "yd-dash-surface yd-dash-kpi-card flex min-w-0 flex-col p-4 md:px-5 md:py-[1.125rem]",
        href && "yd-dash-kpi-card--linked"
      )}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="yd-dash-kpi-card__icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full md:h-[2.375rem] md:w-[2.375rem]">
          <Icon className="h-[16px] w-[16px] md:h-[17px] md:w-[17px]" strokeWidth={1.65} />
        </span>
        <p
          className="text-[13px] font-medium leading-snug tracking-[-0.01em]"
          style={{ color: YD.text.secondary }}
        >
          {title}
        </p>
      </div>
      <p className="yd-dash-kpi yd-dash-kpi--balanced font-semibold">{value}</p>
      {footnote ? (
        <p
          className="mt-1.5 text-[11px] font-medium leading-snug md:text-[12px]"
          style={{ color: YD.text.muted }}
        >
          {footnote}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="group relative min-w-0">
      {href ? (
        <Link href={href} className="block min-w-0 no-underline">
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
