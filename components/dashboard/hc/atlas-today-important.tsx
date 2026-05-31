import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { TodayMetricCard } from "@/lib/dashboard/command-center";

type AtlasTodayImportantProps = {
  cards: TodayMetricCard[];
  title?: string;
};

export function AtlasTodayImportant({
  cards,
  title = COCKPIT_SECTIONS.todayImportant,
}: AtlasTodayImportantProps) {
  const allClear = cards.every((c) => c.count === 0 || c.count === null);

  return (
    <section
      className={allClear ? "yd-today-important yd-today-important--empty" : "yd-today-important"}
      aria-label={title}
    >
      <h2 className="yd-cockpit-section-title">{title}</h2>
      {allClear ? (
        <p className="yd-cockpit-quiet">Keine offenen Anfragen — alles aktuell.</p>
      ) : (
        <ul className="yd-today-metrics-grid">
          {cards.map((card) => (
            <li key={card.id}>
              <Link href={card.href} className="yd-today-metric-card">
                <p className="yd-today-metric-label">{card.label}</p>
                <p className="yd-today-metric-count">
                  {card.count === null ? "—" : card.count}
                </p>
                <p className="yd-today-metric-hint">{card.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
