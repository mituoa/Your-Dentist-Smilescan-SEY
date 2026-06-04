import type { PraxisQueueSummary } from "@/lib/inbox/tracker-v7-presentational";

type TrackerV7PraxisQueueProps = {
  summary: PraxisQueueSummary;
};

/**
 * Praxis-Queue — kompakte Hospital-Software-Orientierung, keine KPI-Karten.
 */
export function TrackerV7PraxisQueue({ summary }: TrackerV7PraxisQueueProps) {
  const lines: string[] = [];

  if (summary.newSubmissions > 0) {
    lines.push(
      summary.newSubmissions === 1
        ? "1 neue Einsendung"
        : `${summary.newSubmissions} neue Einsendungen`
    );
  }
  if (summary.followUpControls > 0) {
    lines.push(
      summary.followUpControls === 1
        ? "1 Nachsorgekontrolle"
        : `${summary.followUpControls} Nachsorgekontrollen`
    );
  }
  if (summary.approvalPending > 0) {
    lines.push(
      summary.approvalPending === 1
        ? "1 Antwort wartet auf Freigabe"
        : `${summary.approvalPending} Antworten warten auf Freigabe`
    );
  }
  if (summary.openTasks > 0) {
    lines.push(
      summary.openTasks === 1 ? "1 offene Aufgabe" : `${summary.openTasks} offene Aufgaben`
    );
  }
  if (summary.draftPrepared > 0) {
    lines.push(
      summary.draftPrepared === 1
        ? "1 KI-Antwort zur Prüfung"
        : `${summary.draftPrepared} KI-Antworten zur Prüfung`
    );
  }

  return (
    <section className="yd-tracker-v7-queue" aria-labelledby="tracker-v7-queue-title">
      <p className="yd-tracker-v7-queue__eyebrow">Praxis-Queue</p>
      <div className="yd-tracker-v7-queue__head">
        <h2 id="tracker-v7-queue-title" className="yd-tracker-v7-queue__title">
          Heute zu prüfen
        </h2>
        <p className="yd-tracker-v7-queue__active">
          {summary.activeCases === 1
            ? "1 aktiver Fall"
            : `${summary.activeCases} aktive Fälle`}
        </p>
      </div>
      {lines.length > 0 ? (
        <ul className="yd-tracker-v7-queue__list">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="yd-tracker-v7-queue__quiet">
          Keine Fälle benötigen gerade Ihre Aufmerksamkeit.
        </p>
      )}
    </section>
  );
}
