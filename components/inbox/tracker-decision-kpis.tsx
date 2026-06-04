import type { TrackerDecisionKpi } from "@/lib/inbox/tracker-praxis-status";
import { cn } from "@/lib/utils";

type TrackerDecisionKpisProps = {
  kpis: TrackerDecisionKpi[];
};

/** Kompakte KPI-Chips — Dashboard-Niveau, keine Admin-Tabelle. */
export function TrackerDecisionKpis({ kpis }: TrackerDecisionKpisProps) {
  return (
    <div className="yd-tq-decision-kpis" role="list" aria-label="Entscheidungen nach Kategorie">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          role="listitem"
          className={cn("yd-tq-decision-kpi", `yd-tq-decision-kpi--${kpi.id}`)}
        >
          <span className="yd-tq-decision-kpi__value">{kpi.count}</span>
          <span className="yd-tq-decision-kpi__label">{kpi.label}</span>
        </div>
      ))}
    </div>
  );
}
