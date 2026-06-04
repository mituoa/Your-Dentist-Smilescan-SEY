"use client";

import type { RelayOpsTodayBand } from "@/lib/relay/relay-ops-status";

type RelayOpsTodayBandProps = {
  band: RelayOpsTodayBand;
};

type BandCell = {
  key: string;
  label: string;
  value: number;
  tone?: "neutral" | "emphasis" | "muted";
};

export function RelayOpsTodayBandView({ band }: RelayOpsTodayBandProps) {
  const cells: BandCell[] = [
    { key: "critical", label: "Kritisch", value: band.critical, tone: "emphasis" },
    { key: "patient", label: "Wartet auf Patient", value: band.waitingPatient },
    { key: "doctor", label: "Wartet auf Arzt", value: band.waitingDoctor },
    { key: "today", label: "Heute fällig", value: band.dueToday },
    { key: "overdue", label: "Überfällig", value: band.overdue, tone: band.overdue > 0 ? "emphasis" : "neutral" },
    { key: "done", label: "Heute erledigt", value: band.doneToday, tone: "muted" },
  ];

  const allClear = cells.every((c) => c.value === 0);

  return (
    <section className="yd-relay-ops-today" aria-label="Heute — operative Übersicht">
      {allClear ? (
        <p className="yd-relay-ops-today__clear">
          Praxisbetrieb unter Kontrolle — heute keine offenen Vorgänge in dieser Ansicht.
        </p>
      ) : (
        <ul className="yd-relay-ops-today__grid">
          {cells.map((cell) => (
            <li key={cell.key} className="yd-relay-ops-today__cell">
              <span className="yd-relay-ops-today__value" data-tone={cell.tone ?? "neutral"}>
                {cell.value}
              </span>
              <span className="yd-relay-ops-today__label">{cell.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
