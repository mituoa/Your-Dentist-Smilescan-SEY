import Link from "next/link";
import { Calendar, ClipboardCheck, UserRound, Users } from "lucide-react";

import type { DashboardStatusCard, DashboardStatusIcon } from "@/lib/dashboard/dashboard-bento-model";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
  attention: ClipboardCheck,
  team: Users,
  patient: UserRound,
  routines: Calendar,
} satisfies Record<DashboardStatusIcon, typeof ClipboardCheck>;

type Props = {
  card: DashboardStatusCard;
  className?: string;
};

export function DashboardStatusCard({ card, className }: Props) {
  const Icon = STATUS_ICONS[card.icon];

  return (
    <Link
      href={card.href}
      className={cn("yd-dash-bento-status", className)}
      prefetch
    >
      <div className="yd-dash-bento-status__top">
        <span className="yd-dash-bento-status__icon" aria-hidden>
          <Icon strokeWidth={1.85} />
        </span>
        <p className="yd-dash-bento-status__title">{card.title}</p>
      </div>
      <p className="yd-dash-bento-status__value">{card.value}</p>
      <p className="yd-dash-bento-status__detail">{card.detail}</p>
    </Link>
  );
}
