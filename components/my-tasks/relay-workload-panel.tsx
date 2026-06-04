"use client";

import type { RelayTeamRow } from "@/lib/relay/build-relay-snapshot";

type RelayWorkloadPanelProps = {
  rows: RelayTeamRow[];
};

export function RelayWorkloadPanel({ rows }: RelayWorkloadPanelProps) {
  if (rows.length === 0) {
    return (
      <div className="yd-relay-empty-state yd-relay-empty-state--compact">
        <p className="yd-relay-empty-state__title">Team entlastet</p>
        <p className="yd-relay-empty-state__text">Keine offenen Zuweisungen in dieser Ansicht.</p>
      </div>
    );
  }

  return (
    <ul className="yd-relay-workload">
      {rows.map((row) => (
        <li key={row.key} className="yd-relay-workload__row">
          <span className="yd-relay-workload__name">{row.label}</span>
          <span className="yd-relay-workload__dots" aria-hidden>
            {"·".repeat(Math.min(row.count, 12))}
          </span>
          <span className="yd-relay-workload__count">
            {row.count} {row.count === 1 ? "offen" : "offen"}
          </span>
        </li>
      ))}
    </ul>
  );
}
