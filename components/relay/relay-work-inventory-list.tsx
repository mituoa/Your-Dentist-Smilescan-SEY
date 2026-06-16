"use client";

import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { computeInventoryStats } from "@/lib/relay/relay-inventory-stats";
import { cn } from "@/lib/utils";

type Props = {
  rows: RelayWorkRow[];
  selectedId: string | null;
  onSelect: (rowId: string) => void;
};

function priority(row: RelayWorkRow): { label: string; tone: "urgent" | "due" | "normal" } {
  if (row.isCritical) return { label: "Dringend", tone: "urgent" };
  if (row.dueLabel) return { label: "Fällig", tone: "due" };
  return { label: "Normal", tone: "normal" };
}

function InventoryRow({
  row,
  active,
  onSelect,
}: {
  row: RelayWorkRow;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const desc = row.concernLine?.trim() || row.context?.trim() || row.typeLabel || "";
  const wait = row.waitingLabel ?? row.dueLabel ?? row.timeLabel;
  const responsible = row.toLabel;
  const prio = priority(row);
  const subline = [desc, responsible, wait].filter(Boolean).join(" · ");

  return (
    <li>
      <button
        type="button"
        className={cn("rw-inv__row", active && "rw-inv__row--active", prio.tone === "urgent" && "rw-inv__row--urgent")}
        onClick={() => onSelect(row.id)}
      >
        <span className="rw-inv__row-line1">
          <span className="rw-inv__title">{row.primaryLabel}</span>
        </span>
        <span className={cn("rw-inv__prio", `rw-inv__prio--${prio.tone}`)}>{prio.label}</span>
        {subline ? <span className="rw-inv__desc">{subline}</span> : null}
      </button>
    </li>
  );
}

export function RelayWorkInventoryList({ rows, selectedId, onSelect }: Props) {
  const workRows = rows.filter((r) => !r.isGhost);
  const stats = computeInventoryStats(rows);

  return (
    <div className="rw-inv">
      <header className="rw-inv__head">
        <span className="rw-inv__stat">{stats.total} Vorgänge</span>
        {stats.urgent > 0 ? (
          <span className="rw-inv__stat rw-inv__stat--urgent">{stats.urgent} dringend</span>
        ) : null}
        {stats.due > 0 ? <span className="rw-inv__stat">{stats.due} fällig</span> : null}
        {stats.oldestWait ? (
          <span className="rw-inv__stat rw-inv__stat--faint">ältester: {stats.oldestWait}</span>
        ) : null}
      </header>
      <div className="rw-inv__scroll">
        {workRows.length === 0 ? (
          <p className="rw-inv__empty">Keine Vorgänge in diesem Bereich.</p>
        ) : (
          <ul className="rw-inv__list">
            {workRows.map((row) => (
              <InventoryRow
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
