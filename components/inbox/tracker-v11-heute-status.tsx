import type { HeuteRelevantMetric } from "@/lib/inbox/tracker-v10-presentational";

type TrackerV11HeuteStatusProps = {
  waitingCount: number;
  metrics: HeuteRelevantMetric[];
};

function chipLabel(id: string, count: number): string {
  const one = count === 1;
  switch (id) {
    case "neue_anfrage":
      return one ? "neue Anfrage" : "neue Anfragen";
    case "nachsorge":
      return one ? "Nachsorge" : "Nachsorgen";
    case "ki_freigabe":
      return one ? "Freigabe" : "Freigaben";
    case "aufgaben":
      return one ? "Aufgabe" : "Aufgaben";
    default:
      return "";
  }
}

/**
 * Ruhige Statusleiste — Apple Health / Linear, keine Dashboard-Kacheln.
 */
export function TrackerV11HeuteStatus({
  waitingCount,
  metrics,
}: TrackerV11HeuteStatusProps) {
  return (
    <header className="yd-tracker-v11-status" aria-label="Heute relevant">
      <div className="yd-tracker-v11-status__primary">
        <span className="yd-tracker-v11-status__eyebrow">Heute relevant</span>
        <span className="yd-tracker-v11-status__waiting">
          {waitingCount === 1
            ? "1 Fall wartet"
            : `${waitingCount} Fälle warten`}
        </span>
      </div>
      <ul className="yd-tracker-v11-status__chips">
        {metrics.map((m) => (
          <li key={m.id} className="yd-tracker-v11-status__chip">
            <span className="yd-tracker-v11-status__chip-count">{m.count}</span>
            <span className="yd-tracker-v11-status__chip-label">
              {chipLabel(m.id, m.count)}
            </span>
          </li>
        ))}
      </ul>
    </header>
  );
}
