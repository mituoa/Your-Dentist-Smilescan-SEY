import {
  concernLinesFromNotes,
  urgencyAssessmentDe,
} from "@/lib/inbox/tracker-v6-presentational";

type TrackerV6KiSummaryProps = {
  patientNotes: string | null;
  urgency: string | null;
  recommendation: string | null;
};

/** KI-Arbeitsbereich — sachlich, nicht technisch. */
export function TrackerV6KiSummary({
  patientNotes,
  urgency,
  recommendation,
}: TrackerV6KiSummaryProps) {
  const concernLines = concernLinesFromNotes(patientNotes);

  return (
    <section className="yd-tracker-v7-ki" aria-labelledby="tracker-v6-ki-title">
      <h2 id="tracker-v6-ki-title" className="yd-tracker-v7-section__title">
        KI Assistenz
      </h2>

      {concernLines.length > 0 ? (
        <div className="yd-tracker-v7-ki__block">
          <h3 className="yd-tracker-v7-ki__label">Patient berichtet</h3>
          <ul className="yd-tracker-v7-ki__lines">
            {concernLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="yd-tracker-v7-ki__block">
        <h3 className="yd-tracker-v7-ki__label">KI Einschätzung</h3>
        <p className="yd-tracker-v7-ki__value">{urgencyAssessmentDe(urgency)}</p>
      </div>

      {recommendation ? (
        <div className="yd-tracker-v7-ki__block yd-tracker-v7-ki__block--accent">
          <h3 className="yd-tracker-v7-ki__label">Empfehlung</h3>
          <p className="yd-tracker-v7-ki__value">{recommendation}</p>
        </div>
      ) : null}
    </section>
  );
}
