"use client";

import { ClipboardList, ListTodo, Sparkles } from "lucide-react";

import type {
  TrackerInboxPulseId,
  TrackerInboxPulseMetric,
} from "@/lib/inbox/tracker-inbox-metrics";
import type { TrackerInboxFilter } from "@/lib/inbox/tracker-inbox-logic";
import { cn } from "@/lib/utils";

const ICONS: Record<TrackerInboxPulseId, typeof ClipboardList> = {
  new_submissions: ClipboardList,
  approval_pending: Sparkles,
  active_cases: ListTodo,
};

type TrackerInboxPulseProps = {
  metrics: TrackerInboxPulseMetric[];
  activeFilter: TrackerInboxFilter;
  onSelect: (filter: TrackerInboxFilter) => void;
};

export function TrackerInboxPulse({
  metrics,
  activeFilter,
  onSelect,
}: TrackerInboxPulseProps) {
  return (
    <div
      className="yd-tracker-pulse"
      role="group"
      aria-label="Kurzüberblick Praxis-Inbox"
    >
      {metrics.map((metric) => {
        const Icon = ICONS[metric.id] ?? ClipboardList;
        const isActive = activeFilter === metric.id;
        const hasWork = metric.value > 0;

        return (
          <button
            key={metric.id}
            type="button"
            className={cn(
              "yd-tracker-pulse__metric",
              isActive && "yd-tracker-pulse__metric--active",
              hasWork && "yd-tracker-pulse__metric--has-work"
            )}
            onClick={() => onSelect(metric.id)}
            aria-pressed={isActive}
          >
            <span className="yd-tracker-pulse__icon" aria-hidden>
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="yd-tracker-pulse__value">{metric.value}</span>
            <span className="yd-tracker-pulse__label">{metric.label}</span>
          </button>
        );
      })}
    </div>
  );
}
