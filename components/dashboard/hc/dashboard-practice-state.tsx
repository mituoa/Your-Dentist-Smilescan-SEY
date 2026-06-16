import Link from "next/link";

import type { PracticeStateDomain } from "@/lib/dashboard/dashboard-bento-model";

type Props = {
  domains: PracticeStateDomain[];
};

export function DashboardPracticeState({ domains }: Props) {
  const max = Math.max(...domains.map((d) => d.count), 1);
  const total = domains.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="yd-dash-ref-card yd-dash-ref-card--hero" aria-label="Praxiszustand">
      <header className="yd-dash-ref-card__head yd-dash-ref-card__head--row">
        <div>
          <h2 className="yd-dash-ref-card__title">Praxiszustand</h2>
          <p className="yd-dash-ref-card__meta">
            {total === 0 ? "Alle Bereiche ruhig" : `${total} offene Vorgänge`}
          </p>
        </div>
      </header>

      <div className="yd-dash-state-visual">
        <div className="yd-dash-state-chart" role="img" aria-label="Verteilung offener Vorgänge">
          <div className="yd-dash-state-chart__grid" aria-hidden />
          <div className="yd-dash-state-chart__plot">
            {domains.map((domain) => {
              const height =
                domain.count === 0 ? 12 : Math.max(18, Math.round((domain.count / max) * 100));
              return (
                <Link
                  key={domain.id}
                  href={domain.href}
                  className="yd-dash-state-chart__col"
                  prefetch
                >
                  <span className="yd-dash-state-chart__bar-wrap">
                    <span
                      className="yd-dash-state-chart__bar"
                      style={{ height: `${height}%` }}
                    />
                  </span>
                  <span className="yd-dash-state-chart__count">{domain.count}</span>
                  <span className="yd-dash-state-chart__label">{domain.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
