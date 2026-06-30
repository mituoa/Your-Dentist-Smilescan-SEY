"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  const popoverId = useId();
  const rootRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [close, open]);

  return (
    <Link
      ref={rootRef}
      href={card.href}
      className={cn("yd-dash-bento-status", open && "yd-dash-bento-status--open", className)}
      prefetch={false}
      onMouseEnter={() => card.detail && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => card.detail && setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open && card.detail ? popoverId : undefined}
    >
      <div className="yd-dash-bento-status__top">
        <span className="yd-dash-bento-status__icon" aria-hidden>
          <Icon strokeWidth={1.85} />
        </span>
        <p className="yd-dash-bento-status__title">{card.title}</p>
      </div>
      <p className="yd-dash-bento-status__value">{card.value}</p>
      {card.detail ? (
        <div
          id={popoverId}
          className="yd-dash-bento-status__popover"
          role="tooltip"
          hidden={!open}
        >
          <p className="yd-dash-bento-status__popover-text">{card.detail}</p>
          <span className="yd-dash-bento-status__popover-hint">Klick öffnet Relay</span>
        </div>
      ) : null}
    </Link>
  );
}
