import type { TrackerTimelineEvent } from "@/lib/inbox/build-tracker-workspace";

type TrackerCaseTimelineProps = {
  events: TrackerTimelineEvent[];
};

export function TrackerCaseTimeline({ events }: TrackerCaseTimelineProps) {
  if (events.length === 0) return null;

  return (
    <section className="yd-tracker-v4-timeline" aria-labelledby="tracker-v4-timeline-title">
      <h3 id="tracker-v4-timeline-title" className="yd-tracker-v4-section-title">
        Verlauf
      </h3>
      <ol className="yd-tracker-v4-timeline__list">
        {events.map((event) => (
          <li key={event.id} className="yd-tracker-v4-timeline__item">
            <span className="yd-tracker-v4-timeline__date">{event.dateLabel}</span>
            <div className="yd-tracker-v4-timeline__body">
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
