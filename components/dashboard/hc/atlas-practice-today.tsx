import Link from "next/link";

import type { RelayActivityLine, TodayMetricCard } from "@/lib/dashboard/command-center";

type AtlasPracticeTodayProps = {
  metrics: TodayMetricCard[];
  teamHints: RelayActivityLine[];
};

export function AtlasPracticeToday({ metrics, teamHints }: AtlasPracticeTodayProps) {
  const freigaben = metrics.find((m) => m.id === "approval");
  const neue = metrics.find((m) => m.id === "intake");

  return (
    <aside className="yd-med-praxis-today" aria-labelledby="yd-med-praxis-today-title">
      <h2 id="yd-med-praxis-today-title" className="yd-med-section-title">
        Praxis heute
      </h2>
      <ul className="yd-med-praxis-today__list">
        <li>
          <Link href={freigaben?.href ?? "/inbox"} className="yd-med-praxis-today__row">
            <span className="yd-med-praxis-today__label">Offene Freigaben</span>
            <span className="yd-med-praxis-today__value">
              {freigaben?.count ?? 0}
            </span>
          </Link>
        </li>
        <li>
          <Link href={neue?.href ?? "/inbox"} className="yd-med-praxis-today__row">
            <span className="yd-med-praxis-today__label">Neue Eingänge</span>
            <span className="yd-med-praxis-today__value">{neue?.count ?? 0}</span>
          </Link>
        </li>
      </ul>

      {teamHints.length > 0 ? (
        <div className="yd-med-praxis-today__hints">
          <p className="yd-med-praxis-today__hints-title">Team Hinweise</p>
          <ul className="yd-med-praxis-today__hints-list">
            {teamHints.slice(0, 4).map((line) => (
              <li key={line.id}>
                <Link href={line.href} className="yd-med-praxis-today__hint">
                  <span className="yd-med-praxis-today__hint-label">{line.label}</span>
                  <span className="yd-med-praxis-today__hint-meta">{line.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="yd-med-praxis-today__quiet">Keine Team-Hinweise.</p>
      )}
    </aside>
  );
}
