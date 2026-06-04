import type { TrackerTimelineEvent } from "@/lib/inbox/build-tracker-workspace";
import { cn } from "@/lib/utils";

type TrackerCaseTimelineProps = {
  events: TrackerTimelineEvent[];
  className?: string;
};

export function TrackerCaseTimeline({ events, className }: TrackerCaseTimelineProps) {
  if (events.length === 0) return null;

  return (
    <section
      className={cn(
        "yd-tracker-workspace-section yd-tracker-v4-timeline yd-tracker-v4-timeline--premium",
        className
      )}
      aria-labelledby="tracker-v4-timeline-title"
    >
      <h3 id="tracker-v4-timeline-title" className="yd-tracker-workspace-section__title">
        Verlauf
      </h3>
      <ol className="yd-tracker-v4-timeline__list">
        {events.map((event, index) => (
          <li key={event.id} className="yd-tracker-v4-timeline__item">
            <span className="yd-tracker-v4-timeline__rail" aria-hidden>
              <span className="yd-tracker-v4-timeline__node" />
              {index < events.length - 1 ? (
                <span className="yd-tracker-v4-timeline__line" />
              ) : null}
            </span>
            <div className="yd-tracker-v4-timeline__body">
              <span className="yd-tracker-v4-timeline__date">{event.dateLabel}</span>
              <p className="yd-tracker-v4-timeline__title">{event.title}</p>
              {event.detail ? (
                <p className="yd-tracker-v4-timeline__detail">{event.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
