import Link from "next/link";

import type { PriorityFeedItem } from "@/lib/dashboard/priority-feed";

type AtlasPriorityFeedProps = {
  items: PriorityFeedItem[];
};

export function AtlasPriorityFeed({ items }: AtlasPriorityFeedProps) {
  if (items.length === 0) {
    return (
      <section className="yd-priority-feed yd-priority-feed--empty" aria-label="Priorität">
        <p className="yd-priority-feed-empty">Alles aktuell</p>
      </section>
    );
  }

  return (
    <section className="yd-priority-feed" aria-label="Priorität">
      <h2 className="yd-priority-feed-title">Priorität</h2>
      <ul className="yd-priority-feed-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`yd-priority-card yd-priority-card--${item.level}`}
            >
              <div className="yd-priority-card-top">
                <span className="yd-priority-card-level">
                  {item.level === "urgent" ? "Prüfen" : "Wartend"}
                </span>
                <span className="yd-priority-card-action">{item.actionLabel}</span>
              </div>
              <p className="yd-priority-card-name">{item.patientName}</p>
              <p className="yd-priority-card-subject">{item.subject}</p>
              {item.detail ? (
                <p className="yd-priority-card-detail">{item.detail}</p>
              ) : null}
              {item.aiLine ? (
                <p className="yd-priority-card-ai">{item.aiLine}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
