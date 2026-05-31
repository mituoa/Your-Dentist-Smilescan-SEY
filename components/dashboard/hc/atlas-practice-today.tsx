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
    <section
      className="yd-cockpit-module yd-cockpit-module--insight"
      aria-labelledby="yd-cockpit-insight-title"
    >
      <h2 id="yd-cockpit-insight-title" className="yd-cockpit-module__title">
        Praxis heute
      </h2>
      <ul className="yd-cockpit-insight__stats">
        <li>
          <Link href={freigaben?.href ?? "/inbox"} className="yd-cockpit-insight__row">
            <span className="yd-cockpit-insight__label">Offene Freigaben</span>
            <span className="yd-cockpit-insight__value">{freigaben?.count ?? 0}</span>
          </Link>
        </li>
        <li>
          <Link href={neue?.href ?? "/inbox"} className="yd-cockpit-insight__row">
            <span className="yd-cockpit-insight__label">Neue Eingänge</span>
            <span className="yd-cockpit-insight__value">{neue?.count ?? 0}</span>
          </Link>
        </li>
      </ul>

      <div className="yd-cockpit-insight__hints">
        <p className="yd-cockpit-insight__hints-title">Team Hinweise</p>
        {teamHints.length > 0 ? (
          <ul className="yd-cockpit-insight__hints-list">
            {teamHints.slice(0, 4).map((line) => (
              <li key={line.id}>
                <Link href={line.href} className="yd-cockpit-insight__hint">
                  <span className="yd-cockpit-insight__hint-label">{line.label}</span>
                  <span className="yd-cockpit-insight__hint-meta">{line.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="yd-cockpit-module__quiet">Keine Team-Hinweise.</p>
        )}
      </div>
    </section>
  );
}
