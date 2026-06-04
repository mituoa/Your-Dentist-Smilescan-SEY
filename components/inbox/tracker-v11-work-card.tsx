import type { ClinicalQueueCardModel } from "@/lib/inbox/tracker-v11-presentational";
import { cn } from "@/lib/utils";

type TrackerV11WorkCardProps = {
  card: ClinicalQueueCardModel;
  isActive?: boolean;
  onOpen: () => void;
};

/**
 * Ein klinisches Arbeitsobjekt — keine Tabellenzeile.
 */
export function TrackerV11WorkCard({
  card,
  isActive = false,
  onOpen,
}: TrackerV11WorkCardProps) {
  return (
    <article
      className={cn(
        "yd-tracker-v11-card",
        `yd-tracker-v11-card--${card.accent}`,
        isActive && "yd-tracker-v11-card--active"
      )}
    >
      <button
        type="button"
        className="yd-tracker-v11-card__hit"
        onClick={onOpen}
      >
        <div className="yd-tracker-v11-card__accent" aria-hidden>
          <span className="yd-tracker-v11-card__dot" />
        </div>

        <div className="yd-tracker-v11-card__body">
          <div className="yd-tracker-v11-card__head">
            <h2 className="yd-tracker-v11-card__patient">{card.patientName}</h2>
            <span
              className={cn(
                "yd-tracker-v11-card__priority",
                `yd-tracker-v11-card__priority--${card.priority.level}`
              )}
            >
              {card.priority.label}
            </span>
          </div>

          <p className="yd-tracker-v11-card__headline">{card.headline}</p>
          {card.subline ? (
            <p className="yd-tracker-v11-card__subline">{card.subline}</p>
          ) : null}

          <p className="yd-tracker-v11-card__summary">{card.summary}</p>

          <div className="yd-tracker-v11-card__meta">
            {card.photoLabel ? (
              <span className="yd-tracker-v11-card__meta-item">{card.photoLabel}</span>
            ) : null}
            <span className="yd-tracker-v11-card__meta-item">{card.activityLabel}</span>
          </div>
        </div>

        <span className="yd-tracker-v11-card__action">{card.actionLabel}</span>
      </button>
    </article>
  );
}
