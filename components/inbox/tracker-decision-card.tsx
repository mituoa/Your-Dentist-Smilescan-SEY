import type { DecisionCardModel } from "@/lib/inbox/tracker-v12-presentational";
import { cn } from "@/lib/utils";

type TrackerDecisionCardProps = {
  decision: DecisionCardModel;
  onOpen: () => void;
};

/**
 * Entscheidungs-Card — primäre Einheit: Fall / Aufgabe / Entscheidung (nicht Patientenliste).
 */
export function TrackerDecisionCard({ decision, onOpen }: TrackerDecisionCardProps) {
  return (
    <article
      className={cn(
        "yd-tq-decision-card",
        `yd-tq-decision-card--${decision.accent}`,
        `yd-tq-decision-card--${decision.statusKind}`
      )}
    >
      <button
        type="button"
        className="yd-tq-decision-card__hit"
        onClick={onOpen}
        aria-label={`${decision.workHeadline}: ${decision.patientName}, ${decision.actionButton}`}
      >
        <header className="yd-tq-decision-card__head">
          <div className="yd-tq-decision-card__identity">
            <span
              className={cn(
                "yd-tq-decision-card__status",
                `yd-tq-decision-card__status--${decision.statusKind}`
              )}
            >
              {decision.workHeadline}
            </span>
            <span className="yd-tq-decision-card__patient">{decision.patientName}</span>
          </div>
        </header>

        <p className="yd-tq-decision-card__subject">{decision.subjectLine}</p>

        {decision.evidenceLines.length > 0 ? (
          <ul className="yd-tq-decision-card__evidence">
            {decision.evidenceLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}

        <footer className="yd-tq-decision-card__foot">
          <div className="yd-tq-decision-card__meta">
            <span className="yd-tq-decision-card__time">{decision.timeLine}</span>
            {decision.showPriority ? (
              <span
                className={cn(
                  "yd-tq-decision-card__priority",
                  `yd-tq-decision-card__priority--${decision.priorityLevel}`
                )}
              >
                Priorität {decision.priorityLabel}
              </span>
            ) : null}
          </div>
          <span className="yd-tq-decision-card__cta">{decision.actionButton}</span>
        </footer>
      </button>
    </article>
  );
}
