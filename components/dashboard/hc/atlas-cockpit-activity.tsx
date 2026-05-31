import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { ActivityEvent } from "@/lib/queries/dashboard";

const TYPE_LABEL: Record<ActivityEvent["type"], string> = {
  submission_received: "Eingang",
  task_created: "Aufgabe",
  task_done: "Erledigt",
};

type AtlasCockpitActivityProps = {
  events: ActivityEvent[] | null;
};

export function AtlasCockpitActivity({ events }: AtlasCockpitActivityProps) {
  const items = events ?? [];

  return (
    <section className="yd-cockpit-activity" aria-labelledby="yd-cockpit-activity-title">
      <h2 id="yd-cockpit-activity-title" className="yd-cockpit-section-title">
        {COCKPIT_SECTIONS.activity}
      </h2>
      {items.length === 0 ? (
        <p className="yd-cockpit-quiet">Heute ruhig</p>
      ) : (
        <ul className="yd-relay-activity-list">
          {items.slice(0, 5).map((event) => (
            <li key={event.id}>
              {event.link ? (
                <Link href={event.link} className="yd-relay-activity-row">
                  <span className="yd-relay-activity-label">{event.text}</span>
                  <span className="yd-relay-activity-meta">{TYPE_LABEL[event.type]}</span>
                </Link>
              ) : (
                <div className="yd-relay-activity-row">
                  <span className="yd-relay-activity-label">{event.text}</span>
                  <span className="yd-relay-activity-meta">{TYPE_LABEL[event.type]}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
