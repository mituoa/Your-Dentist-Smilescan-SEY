import Link from "next/link";

import type { PracticeStateDomain } from "@/lib/dashboard/dashboard-bento-model";
import { cn } from "@/lib/utils";

type Props = {
  domains: PracticeStateDomain[];
};

export function DashboardPracticeState({ domains }: Props) {
  const max = Math.max(...domains.map((d) => d.count), 1);

  return (
    <section
      className="yd-dash-ref-card yd-dash-ref-card--hero yd-dash-practice-state"
      aria-label="Praxiszustand"
    >
      <header className="yd-dash-ref-card__head yd-dash-ref-card__head--row">
        <h2 className="yd-dash-ref-card__title">Praxiszustand</h2>
      </header>

      <div className="yd-dash-state-visual">
        <div
          className="yd-dash-state-chart"
          role="img"
          aria-label="Offene Vorgänge nach Bereich"
        >
          <div className="yd-dash-state-chart__grid" aria-hidden />
          <div className="yd-dash-state-chart__plot">
            {domains.map((domain) => {
              const height =
                domain.count === 0 ? 10 : Math.max(20, Math.round((domain.count / max) * 100));
              const isQuiet = domain.count === 0;

              return (
                <Link
                  key={domain.id}
                  href={domain.href}
                  className={cn("yd-dash-state-chart__col", isQuiet && "yd-dash-state-chart__col--quiet")}
                  prefetch
                  aria-label={`${domain.label}: ${domain.count}`}
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
