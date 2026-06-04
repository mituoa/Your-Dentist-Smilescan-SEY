"use client";

import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import type { RelayKpiStats } from "@/lib/relay/build-relay-snapshot";

type RelayKpiRowProps = {
  stats: RelayKpiStats;
};

export function RelayKpiRow({ stats }: RelayKpiRowProps) {
  return (
    <div
      className="yd-dash-zone yd-dash-kpi-row yd-relay-v4-kpi-zone grid min-w-0 grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4"
      aria-label="Relay Kennzahlen"
    >
      <HcStatCard
        title="Offene Aufgaben"
        value={stats.openTasks}
        iconName="list-todo"
        footnote="Offen und in Freigabe"
        hoverHint="Alle aktiven Aufgaben in der Praxis."
      />
      <HcStatCard
        title="Neue Übergaben"
        value={stats.newHandoffs}
        iconName="user-plus"
        footnote="Ungelesene interne Hinweise"
        hoverHint="Übergaben, die noch gelesen werden sollten."
      />
      <HcStatCard
        title="Freigaben offen"
        value={stats.pendingApprovals}
        iconName="sparkles"
        footnote="Warten auf Bestätigung"
        hoverHint="Erledigungen, die eine Freigabe benötigen."
      />
      <HcStatCard
        title="Routinen heute"
        value={stats.routinesToday}
        iconName="clipboard-list"
        footnote="Wiederkehrend · heute fällig"
        hoverHint="Praxisroutinen mit Termin heute oder überfällig."
      />
    </div>
  );
}
