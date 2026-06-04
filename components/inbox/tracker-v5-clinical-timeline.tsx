import type { TrackerTimelineEvent } from "@/lib/inbox/build-tracker-workspace";

type TrackerV5ClinicalTimelineProps = {
  events: TrackerTimelineEvent[];
};

/** Klinischer Verlauf — chronologisch, ruhig. */
export function TrackerV5ClinicalTimeline({ events }: TrackerV5ClinicalTimelineProps) {
  if (events.length === 0) return null;

  return (
    <section className="yd-tracker-v7-section" aria-labelledby="v5-clinical-timeline">
      <h2 id="v5-clinical-timeline" className="yd-tracker-v7-section__title">
        Verlauf
      </h2>
      <ol className="yd-tracker-v7-timeline">
        {events.map((event) => (
          <li key={event.id} className="yd-tracker-v7-timeline__item">
            <span className="yd-tracker-v7-timeline__date">{event.dateLabel}</span>
            <div>
              <p className="yd-tracker-v7-timeline__title">{event.title}</p>
              {event.detail ? (
                <p className="yd-tracker-v7-timeline__detail">{event.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
