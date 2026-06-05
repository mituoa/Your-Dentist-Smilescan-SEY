"use client";

import type { RelayOpsTodayBand } from "@/lib/relay/relay-ops-status";
import { cn } from "@/lib/utils";

type RelayOpsStripProps = {
  band: RelayOpsTodayBand;
};

const METRICS = [
  { key: "critical" as const, label: "Kritisch", pick: (b: RelayOpsTodayBand) => b.critical, hot: true },
  { key: "patient" as const, label: "Wartet auf Patient", pick: (b: RelayOpsTodayBand) => b.waitingPatient, hot: false },
  { key: "doctor" as const, label: "Wartet auf Arzt", pick: (b: RelayOpsTodayBand) => b.waitingDoctor, hot: false },
  { key: "today" as const, label: "Heute fällig", pick: (b: RelayOpsTodayBand) => b.dueToday, hot: false },
  { key: "overdue" as const, label: "Überfällig", pick: (b: RelayOpsTodayBand) => b.overdue, hot: true },
];

export function RelayOpsStrip({ band }: RelayOpsStripProps) {
  return (
    <p className="yd-relay-ops-strip yd-dash-status-line" role="status" aria-label="Operative Kennzahlen">
      {METRICS.map((m, i) => {
        const value = m.pick(band);
        const emphasize = m.hot && value > 0;
        return (
          <span key={m.key} className="yd-relay-ops-strip__item">
            {i > 0 ? (
              <span className="yd-dash-status-line__sep yd-relay-ops-strip__sep" aria-hidden>
                ·
              </span>
            ) : null}
            <span
              className={cn(
                "yd-relay-ops-strip__value",
                emphasize && "yd-relay-ops-strip__value--hot"
              )}
            >
              {value}
            </span>{" "}
            <span className="yd-relay-ops-strip__label">{m.label}</span>
          </span>
        );
      })}
    </p>
  );
}
