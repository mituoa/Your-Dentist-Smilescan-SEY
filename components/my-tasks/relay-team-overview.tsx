"use client";

import type { RelayTeamDetailRow } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayTeamOverviewProps = {
  rows: RelayTeamDetailRow[];
};

export function RelayTeamOverview({ rows }: RelayTeamOverviewProps) {
  if (rows.length === 0) {
    return (
      <p className="text-[13px] font-medium" style={{ color: YD.text.muted }}>
        Keine offenen Zuweisungen.
      </p>
    );
  }

  return (
    <ul className="yd-relay-v4-team-list">
      {rows.map((row) => (
        <li key={row.key} className="yd-relay-v4-team-list__item">
          <p className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: YD.text.primary }}>
            {row.label}
          </p>
          {row.hint ? (
            <p className="text-[11px] font-medium" style={{ color: YD.text.muted }}>
              {row.hint}
            </p>
          ) : null}
          <p className="mt-1 text-[12px] font-medium leading-snug" style={{ color: YD.text.secondary }}>
            {row.count === 1 ? "1 Aufgabe" : `${row.count} Aufgaben`}
            {" · "}
            {row.readSummary}
            {row.overdueCount > 0 ? ` · ${row.overdueCount} überfällig` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
