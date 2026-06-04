import type { TrackerTodayKpis } from "@/lib/inbox/tracker-v6-presentational";

type TrackerV6TodayStripProps = {
  kpis: TrackerTodayKpis;
};

/** Oberhalb der Tabelle — ein Block, keine Chip-Hölle. */
export function TrackerV6TodayStrip({ kpis }: TrackerV6TodayStripProps) {
  const lines: string[] = [];
  if (kpis.newSubmissions > 0) {
    lines.push(
      kpis.newSubmissions === 1 ? "1 neue Einsendung" : `${kpis.newSubmissions} neue Einsendungen`
    );
  }
  if (kpis.approvalPending > 0) {
    lines.push(
      kpis.approvalPending === 1
        ? "1 Antwort wartet auf Freigabe"
        : `${kpis.approvalPending} Antworten warten auf Freigabe`
    );
  }
  if (kpis.followUp > 0) {
    lines.push(
      kpis.followUp === 1 ? "1 Nachsorgekontrolle" : `${kpis.followUp} Nachsorgekontrollen`
    );
  }
  if (kpis.openTasks > 0) {
    lines.push(kpis.openTasks === 1 ? "1 offene Aufgabe" : `${kpis.openTasks} offene Aufgaben`);
  }

  return (
    <section className="yd-tracker-v6-today" aria-labelledby="tracker-v6-today-title">
      <div className="yd-tracker-v6-today__head">
        <h2 id="tracker-v6-today-title" className="yd-tracker-v6-today__title">
          Heute zu prüfen
        </h2>
        <p className="yd-tracker-v6-today__count">
          {kpis.total === 1 ? "1 Fall" : `${kpis.total} Fälle`}
        </p>
      </div>
      {lines.length > 0 ? (
        <ul className="yd-tracker-v6-today__list">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="yd-tracker-v6-today__quiet">Keine dringenden Fälle für heute.</p>
      )}
    </section>
  );
}
