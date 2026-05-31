"use client";

import { useState } from "react";
import Link from "next/link";

import {
  activityDayGroup,
  activityHeadline,
} from "@/lib/dashboard/atlas-mobile-helpers";
import type { ActivityEvent } from "@/lib/queries/dashboard";

type AtlasMobileActivityProps = {
  events: ActivityEvent[] | null;
};

export function AtlasMobileActivity({ events }: AtlasMobileActivityProps) {
  const [expanded, setExpanded] = useState(false);
  const all = events ?? [];
  const visible = expanded ? all : all.slice(0, 3);
  const hasMore = all.length > 3;

  return (
    <section className="yd-atlas-m-card" aria-labelledby="yd-atlas-m-activity-title">
      <div className="yd-atlas-m-card-head">
        <h2 id="yd-atlas-m-activity-title" className="yd-atlas-m-card-title">
          Aktivität
        </h2>
      </div>

      {all.length === 0 ? (
        <p className="yd-atlas-m-empty-positive">Noch keine Einträge — der Verlauf startet mit dem nächsten Schritt.</p>
      ) : (
        <>
          <ul className="yd-atlas-m-activity-list">
            {visible.map((event) => (
              <li key={event.id} className="yd-atlas-m-activity-row">
                {event.link ? (
                  <Link href={event.link} className="yd-atlas-m-activity-link">
                    <span className="yd-atlas-m-activity-day">{activityDayGroup(event.timestamp)}</span>
                    <span className="yd-atlas-m-activity-text">{activityHeadline(event)}</span>
                  </Link>
                ) : (
                  <div className="yd-atlas-m-activity-link">
                    <span className="yd-atlas-m-activity-day">{activityDayGroup(event.timestamp)}</span>
                    <span className="yd-atlas-m-activity-text">{activityHeadline(event)}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {hasMore ? (
            <button
              type="button"
              className="yd-atlas-m-text-action"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Weniger anzeigen" : "Alle anzeigen"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
