"use client";

import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type Props = {
  rows: RelayWorkRow[];
  selectedId: string | null;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  isDoctor?: boolean;
  onSelect: (rowId: string) => void;
};

type PriorityTier = "p1" | "p2" | "p3";

function priorityTier(row: RelayWorkRow): { tier: PriorityTier; label: string } {
  if (row.isCritical) return { tier: "p1", label: "P1" };
  if (row.dueLabel) return { tier: "p2", label: "P2" };
  return { tier: "p3", label: "P3" };
}

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function inventoryStats(rows: RelayWorkRow[]) {
  const work = rows.filter((r) => !r.isGhost);
  const urgent = work.filter((r) => r.isCritical).length;
  const due = work.filter((r) => r.dueLabel && !r.isCritical).length;
  return { total: work.length, urgent, due };
}

/** Referenz-Karte 1:1 — Titel · Beschreibung · Priorität · Zeit · Beteiligte */
function InventoryCard({
  row,
  active,
  onSelect,
}: {
  row: RelayWorkRow;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const description = row.concernLine?.trim() || row.context?.trim() || row.typeLabel || "";
  const wait = row.waitingLabel ?? row.dueLabel ?? row.timeLabel;
  const { tier, label } = priorityTier(row);

  return (
    <li>
      <button
        type="button"
        className={cn("yd-relay-inv__card", active && "yd-relay-inv__card--active")}
        onClick={() => onSelect(row.id)}
      >
        <span className="yd-relay-inv__card-title">{row.primaryLabel}</span>
        {description ? (
          <span className="yd-relay-inv__card-desc">{description}</span>
        ) : null}
        <span className="yd-relay-inv__card-foot">
          <span className={cn("yd-relay-inv__prio", `yd-relay-inv__prio--${tier}`)}>
            <span className="yd-relay-inv__prio-bar" aria-hidden />
            {label}
          </span>
          {wait ? <span className="yd-relay-inv__date">{wait}</span> : null}
          <span className="yd-relay-inv__avatars" aria-label={`${row.fromLabel}, ${row.toLabel}`}>
            <span className="yd-relay-inv__avatar" title={row.fromLabel}>
              {initials(row.fromLabel)}
            </span>
            <span className="yd-relay-inv__avatar yd-relay-inv__avatar--alt" title={row.toLabel}>
              {initials(row.toLabel)}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

export function RelayWorkInventory({
  rows,
  selectedId,
  assignableMembers,
  currentUserId,
  isDoctor = false,
  onSelect,
}: Props) {
  const workRows = rows.filter((r) => !r.isGhost);
  const stats = inventoryStats(rows);

  return (
    <div className="yd-relay-inv">
      <header className="yd-relay-inv__toolbar">
        <div className="yd-relay-inv__toolbar-left">
          <h2 className="yd-relay-inv__toolbar-title">{stats.total} Vorgänge</h2>
          <div className="yd-relay-inv__toolbar-stats">
            {stats.urgent > 0 ? (
              <span className="yd-relay-inv__stat yd-relay-inv__stat--urgent">
                {stats.urgent} dringend
              </span>
            ) : null}
            {stats.due > 0 ? (
              <span className="yd-relay-inv__stat">{stats.due} fällig</span>
            ) : null}
          </div>
        </div>
        <RelayCreateMenu
          placement="inline"
          assignableMembers={assignableMembers}
          currentUserId={currentUserId}
          isDoctor={isDoctor}
        />
      </header>

      <div className="yd-relay-inv__scroll">
        {workRows.length === 0 ? (
          <p className="yd-relay-inv__empty">Keine offenen Vorgänge in diesem Bereich.</p>
        ) : (
          <ul className="yd-relay-inv__list">
            {workRows.map((row) => (
              <InventoryCard
                key={row.id}
                row={row}
                active={row.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
