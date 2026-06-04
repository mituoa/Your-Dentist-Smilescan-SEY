"use client";

import type { RelayTeamRow } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayTeamOverviewProps = {
  rows: RelayTeamRow[];
};

export function RelayTeamOverview({ rows }: RelayTeamOverviewProps) {
  return (
    <section className="yd-relay-side-card" aria-labelledby="yd-relay-team-title">
      <h2 id="yd-relay-team-title" className="yd-relay-section-title">
        Teamübersicht
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-[13px]" style={{ color: YD.text.muted }}>
          Keine offenen Zuweisungen.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-3 border-b border-[rgba(226,232,240,0.7)] py-2 last:border-0"
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-[#0F172A]">{row.label}</span>
                {row.hint ? (
                  <span className="block text-[12px] font-medium" style={{ color: YD.text.muted }}>
                    {row.hint}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums text-[13px] font-semibold" style={{ color: YD.text.secondary }}>
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
