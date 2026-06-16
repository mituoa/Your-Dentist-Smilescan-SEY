"use client";

import Link from "next/link";

import { RelayPremiumEmpty } from "@/components/my-tasks/relay-premium-empty";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type RelayWorkListPaneProps = {
  rows: RelayWorkRow[];
  selectedId: string | null;
  emptyTitle: string;
  emptyBody: string;
  createHref?: string;
  createLabel?: string;
  onSelect: (rowId: string) => void;
};

/** Kompakte Vorgangsliste — Tracker-Dichte, kein Karten-Container. */
export function RelayWorkListPane({
  rows,
  selectedId,
  emptyTitle,
  emptyBody,
  createHref,
  createLabel,
  onSelect,
}: RelayWorkListPaneProps) {
  const realRows = rows.filter((r) => !r.isGhost);

  return (
    <div className="yd-relay-v3-list flex min-h-0 flex-1 flex-col">
      <div className="yd-relay-v3-list__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {realRows.length === 0 ? (
          <RelayPremiumEmpty variant="inline" title={emptyTitle} text={emptyBody} />
        ) : (
          <ul className="yd-relay-v3-list__items">
            {realRows.map((row) => {
              const active = row.id === selectedId;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    className={cn("yd-relay-v3-row", active && "yd-relay-v3-row--active", row.isCritical && "yd-relay-v3-row--urgent")}
                    onClick={() => onSelect(row.id)}
                  >
                    <span className="yd-relay-v3-row__type">{row.typeLabel}</span>
                    <span className="yd-relay-v3-row__main">
                      <span className="yd-relay-v3-row__title">{row.primaryLabel}</span>
                      <span className="yd-relay-v3-row__meta">
                        {row.groupLabel}
                        {row.statusLabel ? ` · ${row.statusLabel}` : ""}
                      </span>
                    </span>
                    {row.timeLabel ? (
                      <span className="yd-relay-v3-row__time">{row.timeLabel}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {realRows.length === 0 && createHref && createLabel ? (
          <div className="yd-relay-v3-list__create">
            <Link href={createHref} className="yd-tracker-v4-new-case">
              {createLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
