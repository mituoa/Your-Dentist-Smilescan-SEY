"use client";

import type { RelayTeamRow } from "@/lib/relay/build-relay-snapshot";

type RelayTeamOverviewProps = {
  rows: RelayTeamRow[];
};

export function RelayTeamOverview({ rows }: RelayTeamOverviewProps) {
  if (rows.length === 0) {
    return (
      <div className="yd-relay-empty-state yd-relay-empty-state--compact">
        <p className="yd-relay-empty-state__title">Team entlastet</p>
        <p className="yd-relay-empty-state__text">Keine offenen Zuweisungen in dieser Ansicht.</p>
      </div>
    );
  }

  return (
    <ul className="yd-relay-v4-team-list">
      {rows.map((row) => (
        <li key={row.key} className="yd-relay-v4-team-list__item">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-[#0F172A]">{row.label}</span>
              {row.hint ? (
                <span className="block text-[11px] font-medium text-[#94A3B8]">{row.hint}</span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums text-[13px] font-semibold text-[#475569]">
              {row.count}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
