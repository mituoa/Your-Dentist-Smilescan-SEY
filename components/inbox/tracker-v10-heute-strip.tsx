import type { HeuteRelevantMetric } from "@/lib/inbox/tracker-v10-presentational";
import { cn } from "@/lib/utils";

type TrackerV10HeuteStripProps = {
  metrics: HeuteRelevantMetric[];
  waitingTotal: number;
};

/**
 * „Heute relevant“ — kompakte KPI-Zeile (Dashboard-Niveau, nicht laut).
 */
export function TrackerV10HeuteStrip({ metrics, waitingTotal }: TrackerV10HeuteStripProps) {
  return (
    <section className="yd-tracker-v10-heute" aria-label="Heute relevant">
      <div className="yd-tracker-v10-heute__head">
        <h2 className="yd-tracker-v10-heute__title">Heute relevant</h2>
        {waitingTotal > 0 ? (
          <p className="yd-tracker-v10-heute__waiting">
            {waitingTotal === 1
              ? "1 Fall wartet auf Sie"
              : `${waitingTotal} Fälle warten auf Sie`}
          </p>
        ) : null}
      </div>
      <ul className="yd-tracker-v10-heute__metrics">
        {metrics.map((metric) => (
          <li
            key={metric.id}
            className={cn(
              "yd-tracker-v10-heute__metric",
              metric.count === 0 && "yd-tracker-v10-heute__metric--idle"
            )}
          >
            <span className="yd-tracker-v10-heute__count">{metric.count}</span>
            <span className="yd-tracker-v10-heute__label">{metric.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
