import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import { formatRelativeTime } from "@/lib/dashboard/atlas-mobile-helpers";
import type { ActivityEvent } from "@/lib/queries/dashboard";

function activityLabel(event: ActivityEvent): string {
  if (event.type === "submission_received") {
    return event.text.includes("Einsendung") ? "Anfrage eingegangen" : event.text;
  }
  if (event.type === "task_done") {
    return event.text.toLowerCase().includes("erledigt") ? "Aufgabe erledigt" : event.text;
  }
  if (event.type === "task_created") {
    return "Aufgabe erstellt";
  }
  return event.text;
}

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
        <p className="yd-cockpit-quiet">Heute noch keine Aktivität</p>
      ) : (
        <ul className="yd-relay-activity-list">
          {items.slice(0, 5).map((event) => (
            <li key={event.id}>
              {event.link ? (
                <Link href={event.link} className="yd-relay-activity-row">
                  <span className="yd-relay-activity-label">{activityLabel(event)}</span>
                  <span className="yd-relay-activity-meta">{formatRelativeTime(event.timestamp)}</span>
                </Link>
              ) : (
                <div className="yd-relay-activity-row">
                  <span className="yd-relay-activity-label">{activityLabel(event)}</span>
                  <span className="yd-relay-activity-meta">{formatRelativeTime(event.timestamp)}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
