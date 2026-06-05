import type {
  TrackerTimelineEvent,
  TrackerTimelineSection,
} from "@/lib/inbox/build-tracker-workspace";
import { cn } from "@/lib/utils";

type TrackerCaseTimelineProps = {
  events?: TrackerTimelineEvent[];
  sections?: TrackerTimelineSection[];
  className?: string;
};

export function TrackerCaseTimeline({
  events,
  sections,
  className,
}: TrackerCaseTimelineProps) {
  const grouped =
    sections ??
    (events && events.length > 0
      ? [{ id: "all", title: "Verlauf", events }]
      : []);

  if (grouped.length === 0) return null;

  return (
    <div
      className={cn(
        "yd-tracker-workspace-section yd-tracker-v4-timeline yd-tracker-v4-timeline--premium",
        className
      )}
      aria-labelledby="tracker-v4-timeline-title"
    >
      <h3 id="tracker-v4-timeline-title" className="yd-tracker-workspace-section__title">
        Dokumentation
      </h3>
      {grouped.map((section) => (
        <section key={section.id} className="yd-tracker-v4-timeline__group mb-4 last:mb-0">
          <h4 className="yd-tracker-v12-rail__label yd-tracker-v12-rail__label--muted mb-2">
            {section.title}
          </h4>
          <ol className="yd-tracker-v4-timeline__list">
            {section.events.map((event, index) => (
              <li key={event.id} className="yd-tracker-v4-timeline__item">
                <span className="yd-tracker-v4-timeline__rail" aria-hidden>
                  <span className="yd-tracker-v4-timeline__node" />
                  {index < section.events.length - 1 ? (
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
      ))}
    </div>
  );
}
