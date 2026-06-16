import type { DashboardStatusCard } from "@/lib/dashboard/dashboard-bento-model";

import { DashboardStatusCard as StatusCard } from "./dashboard-status-card";

type Props = {
  cards: DashboardStatusCard[];
};

export function DashboardStatusStrip({ cards }: Props) {
  return (
    <section className="yd-dash-bento-status-row" aria-label="Praxisstatus">
      {cards.map((card) => (
        <StatusCard key={card.id} card={card} />
      ))}
    </section>
  );
}
