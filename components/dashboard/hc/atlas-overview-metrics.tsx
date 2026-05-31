import Link from "next/link";
import { CheckCircle2, Inbox, Users } from "lucide-react";

import type { TodayMetricCard } from "@/lib/dashboard/command-center";

const ICONS: Record<string, typeof Inbox> = {
  intake: Inbox,
  approval: CheckCircle2,
  team: Users,
};

type AtlasOverviewMetricsProps = {
  cards: TodayMetricCard[];
};

export function AtlasOverviewMetrics({ cards }: AtlasOverviewMetricsProps) {
  return (
    <ul className="yd-cockpit-kpis" aria-label="Überblick">
      {cards.map((card) => {
        const Icon = ICONS[card.id] ?? Inbox;
        return (
          <li key={card.id} className="yd-cockpit-kpis__item">
            <Link href={card.href} className="yd-cockpit-kpi">
              <span className="yd-cockpit-kpi__bubble" aria-hidden>
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.65} />
              </span>
              <div className="yd-cockpit-kpi__body">
                <p className="yd-cockpit-kpi__label">{card.label}</p>
                <p className="yd-cockpit-kpi__count">
                  {card.count === null ? "—" : card.count}
                </p>
                <p className="yd-cockpit-kpi__hint">{card.hint}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
