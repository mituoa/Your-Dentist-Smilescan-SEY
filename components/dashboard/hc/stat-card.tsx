import { MoreVertical, TrendingUp, type LucideIcon } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  footnote?: string;
  footnotePositive?: boolean;
  metricA?: { label: string; value: string | number };
  metricB?: { label: string; value: string | number };
};

export function HcStatCard({
  title,
  value,
  icon: Icon,
  footnote,
  footnotePositive = true,
  metricA,
  metricB,
}: StatCardProps) {
  return (
    <HcCard className="flex min-h-[188px] min-w-0 flex-col p-5 md:min-h-[200px] md:p-[22px]">
      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
          style={{
            background: HC.primaryIconGradient,
            boxShadow: "0 4px 12px rgba(30, 91, 189, 0.25)",
          }}
        >
          <Icon className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />
        </span>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center text-[#C5D0DC]"
          aria-hidden
          tabIndex={-1}
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      <p className="text-[12px] font-medium" style={{ color: HC.textSecondary }}>
        {title}
      </p>
      <p
        className="mt-1.5 text-[38px] font-bold leading-none tracking-[-0.04em] md:text-[42px]"
        style={{ color: HC.text }}
      >
        {value}
      </p>
      {footnote ? (
        <p
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium"
          style={{ color: footnotePositive ? HC.trendUp : HC.trendMuted }}
        >
          {footnotePositive ? (
            <TrendingUp className="h-3 w-3 shrink-0" strokeWidth={2.5} />
          ) : null}
          {footnote}
        </p>
      ) : null}
      {metricA || metricB ? (
        <div
          className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3.5 text-[11px]"
          style={{ borderColor: HC.borderSoft }}
        >
          {metricA ? (
            <span style={{ color: HC.textMuted }}>
              {metricA.label}{" "}
              <strong className="font-semibold" style={{ color: HC.text }}>
                {metricA.value}
              </strong>
            </span>
          ) : null}
          {metricA && metricB ? (
            <span className="font-light" style={{ color: "#CBD5E1" }}>
              |
            </span>
          ) : null}
          {metricB ? (
            <span style={{ color: HC.textMuted }}>
              {metricB.label}{" "}
              <strong className="font-semibold" style={{ color: HC.text }}>
                {metricB.value}
              </strong>
            </span>
          ) : null}
        </div>
      ) : null}
    </HcCard>
  );
}
