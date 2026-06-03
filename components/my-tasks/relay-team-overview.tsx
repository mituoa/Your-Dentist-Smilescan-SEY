"use client";

import { HcCard } from "@/components/design/hc-card";
import type { RelayTeamDetailRow } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayTeamOverviewProps = {
  rows: RelayTeamDetailRow[];
};

export function RelayTeamOverview({ rows }: RelayTeamOverviewProps) {
  return (
    <section className="min-w-0" aria-labelledby="yd-relay-team-title">
      <h2 id="yd-relay-team-title" className="yd-dash-section mb-3 text-[1.0625rem] md:text-[1.125rem]">
        Teamstatus
      </h2>
      {rows.length === 0 ? (
        <HcCard tone="default" className="yd-dash-surface p-4">
          <p className="text-[13px]" style={{ color: YD.text.muted }}>
            Keine offenen Zuweisungen.
          </p>
        </HcCard>
      ) : (
        <HcCard tone="default" className="yd-dash-surface divide-y divide-[rgba(226,232,240,0.85)] p-0">
          <ul>
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex items-start justify-between gap-3 px-4 py-3 first:pt-3.5 last:pb-3.5"
              >
                <div className="min-w-0">
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
                    {row.overdueCount > 0
                      ? ` · ${row.overdueCount} überfällig`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </HcCard>
      )}
    </section>
  );
}
