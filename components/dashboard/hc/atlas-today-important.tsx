import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { TodayImportantCard } from "@/lib/dashboard/command-center";

type AtlasTodayImportantProps = {
  cards: TodayImportantCard[];
  title?: string;
};

export function AtlasTodayImportant({
  cards,
  title = COCKPIT_SECTIONS.todayImportant,
}: AtlasTodayImportantProps) {
  if (cards.length === 0) {
    return (
      <section className="yd-today-important yd-today-important--empty" aria-label={title}>
        <h2 className="yd-cockpit-section-title">{title}</h2>
        <p className="yd-cockpit-quiet">Alles aktuell</p>
      </section>
    );
  }

  return (
    <section className="yd-today-important" aria-label={title}>
      <h2 className="yd-cockpit-section-title">{title}</h2>
      <ul className="yd-today-important-grid">
        {cards.map((card) => (
          <li key={card.id}>
            <article className="yd-today-card">
              <div className="yd-today-card-body">
                <p className="yd-today-card-patient">{card.patientName}</p>
                <p className="yd-today-card-problem">{card.problem}</p>
                <p className="yd-today-card-ai">{card.aiResult}</p>
              </div>
              <Link
                href={card.href}
                className={
                  card.primaryAction === "freigeben"
                    ? "yd-today-card-cta yd-today-card-cta--primary"
                    : "yd-today-card-cta"
                }
              >
                {card.actionLabel}
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
