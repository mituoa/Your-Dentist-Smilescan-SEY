"use client";

import { useMemo, useState } from "react";

import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import {
  RELAY_WORK_STATUS_TABS,
  countRowsByStatus,
  filterRowsByStatus,
  type RelayWorkStatusId,
} from "@/lib/relay/relay-work-status";
import { cn } from "@/lib/utils";

type Props = {
  areaTitle: string;
  rows: RelayWorkRow[];
  selectedId: string | null;
  onSelect: (rowId: string) => void;
};

function InventoryRow({
  row,
  active,
  onSelect,
}: {
  row: RelayWorkRow;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const subtitle = row.concernLine?.trim() || row.context?.trim() || row.typeLabel;
  const wait = row.waitingLabel ?? row.dueLabel ?? row.timeLabel;
  const meta = [subtitle, wait].filter(Boolean).join(" · ");

  return (
    <li>
      <button
        type="button"
        className={cn(
          "rw-inv__row",
          active && "rw-inv__row--active",
          row.isCritical && "rw-inv__row--urgent"
        )}
        onClick={() => onSelect(row.id)}
      >
        <span className="rw-inv__title">{row.primaryLabel}</span>
        {meta ? <span className="rw-inv__desc">{meta}</span> : null}
      </button>
    </li>
  );
}

export function RelayWorkInventoryList({ areaTitle, rows, selectedId, onSelect }: Props) {
  const [statusFilter, setStatusFilter] = useState<RelayWorkStatusId>("all");

  const statusCounts = useMemo(() => countRowsByStatus(rows), [rows]);
  const filteredRows = useMemo(
    () => filterRowsByStatus(rows, statusFilter),
    [rows, statusFilter]
  );

  return (
    <div className="rw-inv">
      <header className="rw-inv__head">
        <h2 className="rw-inv__area-title">{areaTitle}</h2>
        <div className="rw-inv__status-tabs" role="tablist" aria-label="Status">
          {RELAY_WORK_STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id];
            if (tab.id !== "all" && count === 0) return null;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.id}
                className={cn(
                  "rw-inv__status-tab",
                  statusFilter === tab.id && "rw-inv__status-tab--active"
                )}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
                {count > 0 ? <span className="rw-inv__status-count">{count}</span> : null}
              </button>
            );
          })}
        </div>
      </header>
      <div className="rw-inv__scroll">
        {filteredRows.length === 0 ? (
          <p className="rw-inv__empty">Keine Vorgänge in diesem Bereich.</p>
        ) : (
          <ul className="rw-inv__list">
            {filteredRows.map((row) => (
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
