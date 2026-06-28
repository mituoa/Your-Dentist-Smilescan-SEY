"use client";

import Link from "next/link";

import type { RelayKanbanCard } from "@/lib/relay/relay-work-center-model";
import { cn } from "@/lib/utils";

type RelayKanbanCardViewProps = {
  card: RelayKanbanCard;
  done?: boolean;
};

export function RelayKanbanCardView({ card, done }: RelayKanbanCardViewProps) {
  return (
    <Link
      href={card.href}
      className={cn("relay-kanban-card", done && "relay-kanban-card--done")}
    >
      <p className="relay-kanban-card__type">{card.typeLabel}</p>
      <h3 className="relay-kanban-card__title">{card.title}</h3>
      {card.metaLine ? <p className="relay-kanban-card__meta">{card.metaLine}</p> : null}
      <div className="relay-kanban-card__foot">
        {card.dateLabel ? (
          <span className="relay-kanban-card__date">{card.dateLabel}</span>
        ) : (
          <span className="relay-kanban-card__date relay-kanban-card__date--muted">—</span>
        )}
        <span className="relay-kanban-card__action">{card.actionLabel}</span>
      </div>
      {card.priority === "important" ? (
        <span className="relay-kanban-card__priority" aria-label="Wichtig" />
      ) : null}
    </Link>
  );
}
