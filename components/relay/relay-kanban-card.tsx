"use client";

import Link from "next/link";

import type { RelayKanbanCard } from "@/lib/relay/relay-work-center-model";
import { cn } from "@/lib/utils";

type RelayKanbanCardViewProps = {
  card: RelayKanbanCard;
  done?: boolean;
  isDragging?: boolean;
  draggable?: boolean;
};

export function RelayKanbanCardView({
  card,
  done,
  isDragging = false,
  draggable = false,
}: RelayKanbanCardViewProps) {
  const className = cn(
    "relay-kanban-card",
    done && "relay-kanban-card--done",
    card.isGhost && "relay-kanban-card--example",
    draggable && "relay-kanban-card--draggable",
    card.dueTone === "overdue" && !done && "relay-kanban-card--overdue",
    card.dueTone === "today" && !done && "relay-kanban-card--due-today"
  );

  const content = (
    <>
      <div className="relay-kanban-card__head">
        <span
          className={cn(
            "relay-kanban-card__type",
            card.isRoutine && !card.isGhost && "relay-kanban-card__type--routine"
          )}
        >
          {card.isGhost ? "Beispiel" : card.typeLabel}
        </span>
        {card.assigneeInitials ? (
          <span
            className="relay-kanban-card__avatar"
            style={{ background: card.assigneeColor }}
            aria-hidden
          >
            {card.assigneeInitials}
          </span>
        ) : null}
      </div>
      <h3 className="relay-kanban-card__title">{card.title}</h3>
      {card.metaLine ? <p className="relay-kanban-card__meta">{card.metaLine}</p> : null}
      <div className="relay-kanban-card__foot">
        {card.dateLabel ? (
          <span
            className={cn(
              "relay-kanban-card__date",
              card.dueTone === "overdue" && "relay-kanban-card__date--overdue",
              card.dueTone === "today" && "relay-kanban-card__date--today"
            )}
          >
            {card.dateLabel}
          </span>
        ) : (
          <span className="relay-kanban-card__date relay-kanban-card__date--muted">—</span>
        )}
        <span className="relay-kanban-card__action">
          {draggable && !card.isGhost ? "Ziehen zum Verschieben" : card.actionLabel}
        </span>
      </div>
      {card.priority === "important" ? (
        <span className="relay-kanban-card__priority" aria-label="Wichtig" />
      ) : null}
    </>
  );

  if (card.isGhost || !card.taskId) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link
      href={card.href}
      className={className}
      draggable={false}
      onClick={(event) => {
        if (isDragging) event.preventDefault();
      }}
    >
      {content}
    </Link>
  );
}
