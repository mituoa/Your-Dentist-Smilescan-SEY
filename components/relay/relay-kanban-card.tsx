"use client";

import Link from "next/link";
import { Calendar, MessageCircle } from "lucide-react";

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
      <p className="relay-kanban-card__status">{card.statusLine}</p>
      <div className="relay-kanban-card__foot">
        <span
          className="relay-kanban-card__badge"
          style={{ background: "rgba(47,128,237,0.08)", color: "#2f80ed" }}
          aria-hidden
        >
          {card.typeCode}
        </span>
        {card.dateLabel ? (
          <span className="relay-kanban-card__meta">
            <Calendar strokeWidth={1.75} aria-hidden />
            {card.dateLabel}
          </span>
        ) : null}
        {card.commentCount > 0 ? (
          <span className="relay-kanban-card__meta">
            <MessageCircle strokeWidth={1.75} aria-hidden />
            {card.commentCount}
          </span>
        ) : null}
        <span
          className="relay-kanban-card__avatar"
          style={{ background: card.assigneeColor }}
          title="Verantwortlich"
        >
          {done ? "✓" : card.assigneeInitials}
        </span>
      </div>
      {card.priority === "important" ? (
        <span className="relay-kanban-card__priority" aria-label="Wichtig" />
      ) : null}
    </Link>
  );
}
