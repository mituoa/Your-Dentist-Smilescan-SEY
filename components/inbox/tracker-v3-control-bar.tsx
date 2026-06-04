import type { TrackerControlMetric } from "@/lib/inbox/tracker-v3-presentational";
import { cn } from "@/lib/utils";

type TrackerV3ControlBarProps = {
  metrics: TrackerControlMetric[];
};

/**
 * Medical-Control-Leiste — Dashboard-KPI-Optik, max. ~120px, nicht laut.
 */
export function TrackerV3ControlBar({ metrics }: TrackerV3ControlBarProps) {
  return (
    <div className="yd-tracker-v3-control" role="region" aria-label="Praxis-Kontrolle">
      <div className="yd-tracker-v3-control__rail">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={cn(
              "yd-tracker-v3-control__card yd-dash-surface yd-dash-kpi-card",
              metric.count === 0 && "yd-tracker-v3-control__card--idle"
            )}
          >
            <p className="yd-tracker-v3-control__count">{metric.count}</p>
            <p className="yd-tracker-v3-control__title">{metric.title}</p>
            <p className="yd-tracker-v3-control__footnote">{metric.footnote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
