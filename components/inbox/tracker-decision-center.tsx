import type { TrackerDecisionCenterModel } from "@/lib/inbox/build-tracker-decision";

type TrackerDecisionCenterProps = {
  model: TrackerDecisionCenterModel;
};

const DECISION_QUESTIONS = [
  { key: "happened", label: "Was ist passiert?" },
  { key: "ki", label: "Was hat die KI vorbereitet?" },
  { key: "action", label: "Was soll der Arzt jetzt tun?" },
] as const;

/** Beantwortet in 2 Sekunden: Eingang · KI-Vorbereitung · nächster Schritt. */
export function TrackerDecisionCenter({ model }: TrackerDecisionCenterProps) {
  return (
    <header className="yd-tracker-ia-decision" aria-label="Fallübersicht">
      <div className="yd-tracker-ia-decision__head">
        <p className="yd-tracker-ia-decision__case-type">{model.caseHeadline}</p>
        <h2 className="yd-tracker-ia-decision__patient">{model.patientName}</h2>
      </div>

      <div className="yd-tracker-ia-decision__grid">
        <div className="yd-tracker-ia-decision__cell">
          <p className="yd-tracker-ia-decision__label">
            <span className="yd-tracker-ia-decision__step" aria-hidden>
              1
            </span>
            {DECISION_QUESTIONS[0].label}
          </p>
          <p className="yd-tracker-ia-decision__text">{model.whatHappened}</p>
        </div>
        <div className="yd-tracker-ia-decision__cell">
          <p className="yd-tracker-ia-decision__label">
            <span className="yd-tracker-ia-decision__step" aria-hidden>
              2
            </span>
            {DECISION_QUESTIONS[1].label}
          </p>
          <ul className="yd-tracker-ia-decision__list">
            {model.whatKiDid.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="yd-tracker-ia-decision__cell yd-tracker-ia-decision__cell--action">
          <p className="yd-tracker-ia-decision__label">
            <span className="yd-tracker-ia-decision__step yd-tracker-ia-decision__step--action" aria-hidden>
              3
            </span>
            {DECISION_QUESTIONS[2].label}
          </p>
          <p className="yd-tracker-ia-decision__must-do">{model.whatYouMustDo}</p>
        </div>
      </div>
    </header>
  );
}
