"use client";

import { Calendar, MessageSquare, MoreHorizontal, Paperclip, Plus, SlidersHorizontal } from "lucide-react";

import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type Props = {
  areaTitle: string;
  rows: RelayWorkRow[];
  selectedId: string | null;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  isDoctor?: boolean;
  onSelect: (rowId: string) => void;
};

type ColumnId = "backlog" | "todo" | "progress" | "review";

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "Zu erledigen" },
  { id: "progress", title: "In Arbeit" },
  { id: "review", title: "Freigabe" },
];

type PriorityTone = "red" | "orange" | "green" | "gray";

function bucketRow(row: RelayWorkRow): ColumnId {
  if (row.kind === "journal") return "review";
  const meta = `${row.statusLabel} ${row.actionLabel} ${row.typeLabel}`.toLowerCase();
  if (meta.includes("freigabe") || meta.includes("freigeben")) return "review";
  if (row.isCritical || row.kind === "message") return "progress";
  if (meta.includes("routine")) return "backlog";
  return "todo";
}

function priorityTone(row: RelayWorkRow): PriorityTone {
  if (row.isCritical) return "red";
  if (row.dueLabel) return "orange";
  return "gray";
}

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function avatarColor(label: string): string {
  const code = label.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const hues = ["#8b5cf6", "#6366f1", "#3b82f6", "#14b8a6", "#f59e0b"];
  return hues[code % hues.length]!;
}

function ReferenceCard({
  row,
  active,
  onSelect,
}: {
  row: RelayWorkRow;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const subtitle = row.concernLine?.trim() || row.context?.trim() || row.typeLabel || "";
  const dateLabel = row.waitingLabel ?? row.dueLabel ?? row.timeLabel;
  const tone = priorityTone(row);
  const hasComm = row.kind === "message";
  const hasAttach = row.kind === "journal" || Boolean(row.concernLine);

  return (
    <button
      type="button"
      className={cn("yd-ref-card", active && "yd-ref-card--active")}
      onClick={() => onSelect(row.id)}
    >
      <span className="yd-ref-card__title">{row.primaryLabel}</span>
      {subtitle ? <span className="yd-ref-card__sub">{subtitle}</span> : null}
      <span className="yd-ref-card__meta">
        <span className={cn("yd-ref-card__prio", `yd-ref-card__prio--${tone}`)} aria-hidden>
          P
        </span>
        {dateLabel ? (
          <span className="yd-ref-card__date">
            <Calendar className="yd-ref-card__date-icon" strokeWidth={1.75} aria-hidden />
            {dateLabel}
          </span>
        ) : null}
        {hasAttach ? (
          <span className="yd-ref-card__icon-meta">
            <Paperclip className="h-3 w-3" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        {hasComm ? (
          <span className="yd-ref-card__icon-meta">
            <MessageSquare className="h-3 w-3" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <span
          className="yd-ref-card__avatar"
          style={{ backgroundColor: avatarColor(row.fromLabel) }}
          title={row.fromLabel}
        >
          {initials(row.fromLabel)}
        </span>
      </span>
    </button>
  );
}

export function RelayReferenceBoard({
  areaTitle,
  rows,
  selectedId,
  assignableMembers,
  currentUserId,
  isDoctor = false,
  onSelect,
}: Props) {
  const workRows = rows.filter((r) => !r.isGhost);
  const byColumn = COLUMNS.map((col) => ({
    ...col,
    items: workRows.filter((r) => bucketRow(r) === col.id),
  }));

  return (
    <div className="yd-ref-main">
      <header className="yd-ref-main__head">
        <h1 className="yd-ref-main__title">{areaTitle}</h1>
        <div className="yd-ref-main__toolbar">
          <button type="button" className="yd-ref-main__views">
            Alle · {workRows.length} Vorgänge
          </button>
          <div className="yd-ref-main__new-wrap">
            <RelayCreateMenu
              placement="inline"
              assignableMembers={assignableMembers}
              currentUserId={currentUserId}
              isDoctor={isDoctor}
              label="Neue Aufgabe"
            />
          </div>
          <button type="button" className="yd-ref-main__btn">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            Filter
          </button>
          <button type="button" className="yd-ref-main__btn">
            Ordering
          </button>
        </div>
      </header>

      <div className="yd-ref-board">
        {byColumn.map((col) => (
          <section key={col.id} className="yd-ref-col">
            <header className="yd-ref-col__head">
              <h2 className="yd-ref-col__title">
                {col.title}
                <span className="yd-ref-col__count">{col.items.length}</span>
              </h2>
              <div className="yd-ref-col__actions">
                <button type="button" className="yd-ref-col__icon-btn" aria-label="Hinzufügen">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </button>
                <button type="button" className="yd-ref-col__icon-btn" aria-label="Menü">
                  <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </header>
            <div className="yd-ref-col__cards">
              {col.items.length === 0 ? (
                <p className="yd-ref-col__empty">—</p>
              ) : (
                col.items.map((row) => (
                  <ReferenceCard
                    key={row.id}
                    row={row}
                    active={row.id === selectedId}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
