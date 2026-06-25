import type { RelayPracticeSnapshot, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

export type DashboardStatusIcon =
  | "attention"
  | "team"
  | "patient"
  | "routines";

export type DashboardStatusCard = {
  id: string;
  title: string;
  value: number;
  detail: string;
  href: string;
  icon: DashboardStatusIcon;
};

export type PracticeStateDomain = {
  id: "patienten" | "journal" | "team" | "freigaben" | "routinen";
  label: string;
  count: number;
  href: string;
};

export type DashboardTodayItem = {
  id: string;
  label: string;
  when: string;
  kind: "entscheidung" | "routine";
  href: string;
};

export type DashboardGanttRow = {
  id: string;
  typeLabel: string;
  title: string;
  route: string;
  when: string;
  href: string;
  weight: number;
};

function nonGhost(rows: RelayWorkRow[]) {
  return rows.filter((r) => !r.isGhost);
}

export function buildDashboardStatusStrip(snapshot: RelayPracticeSnapshot): DashboardStatusCard[] {
  const attention = nonGhost(snapshot.attention);
  const freigaben = attention.filter(
    (r) => r.kind === "journal" || r.statusLabel.toLowerCase().includes("freigabe")
  ).length;
  const entscheidungen = Math.max(0, attention.length - freigaben);
  const teamCount = nonGhost(snapshot.teamwork).length;
  const patientCount = nonGhost(snapshot.patientWaiting).length;
  const routineCount = nonGhost(snapshot.routines).length;

  const waitingDetail =
    attention.length === 0
      ? "Nichts offen"
      : freigaben > 0 && entscheidungen > 0
        ? `${freigaben} Freigaben · ${entscheidungen} Entscheidungen`
        : freigaben > 0
          ? `${freigaben} ${freigaben === 1 ? "Freigabe" : "Freigaben"}`
          : `${entscheidungen} ${entscheidungen === 1 ? "Entscheidung" : "Entscheidungen"}`;

  return [
    {
      id: "attention",
      title: "Wartet auf mich",
      value: attention.length,
      detail: waitingDetail,
      href: "/relay?bereich=praxis",
      icon: "attention",
    },
    {
      id: "teamwork",
      title: "Team wartet",
      value: teamCount,
      detail: teamCount === 1 ? "1 Aufgabe offen" : `${teamCount} Aufgaben offen`,
      href: "/relay?bereich=team",
      icon: "team",
    },
    {
      id: "patient",
      title: "Patient wartet",
      value: patientCount,
      detail:
        patientCount === 0
          ? "Keine Rückmeldungen offen"
          : patientCount === 1
            ? "1 Rückmeldung offen"
            : `${patientCount} Rückmeldungen offen`,
      href: "/relay?bereich=patienten",
      icon: "patient",
    },
    {
      id: "routines",
      title: "Routinen heute",
      value: routineCount,
      detail:
        routineCount === 0
          ? "Keine fälligen Routinen"
          : routineCount === 1
            ? "1 fällige Routine"
            : `${routineCount} fällige Routinen`,
      href: "/relay?bereich=praxis",
      icon: "routines",
    },
  ];
}

export function buildPracticeStateDomains(snapshot: RelayPracticeSnapshot): PracticeStateDomain[] {
  const journalRows = nonGhost(snapshot.attention).filter((r) => r.kind === "journal");
  const freigabeRows = nonGhost(snapshot.attention);

  return [
    {
      id: "patienten",
      label: "Patienten",
      count: nonGhost(snapshot.patientWaiting).length,
      href: "/relay?bereich=patienten",
    },
    {
      id: "journal",
      label: "Journal",
      count: journalRows.length,
      href: "/relay?bereich=journal",
    },
    {
      id: "team",
      label: "Team",
      count: nonGhost(snapshot.teamwork).length,
      href: "/relay?bereich=team",
    },
    {
      id: "freigaben",
      label: "Freigaben",
      count: freigabeRows.length,
      href: "/relay?bereich=journal",
    },
    {
      id: "routinen",
      label: "Routinen",
      count: nonGhost(snapshot.routines).length,
      href: "/relay?bereich=praxis",
    },
  ];
}

export function buildDashboardTodayRelevant(snapshot: RelayPracticeSnapshot): DashboardTodayItem[] {
  const decisions = nonGhost(snapshot.attention).map((row) => ({
    id: row.id,
    label: row.primaryLabel,
    when: row.dueLabel ?? row.waitingLabel ?? row.timeLabel,
    kind: "entscheidung" as const,
    href: row.href,
  }));

  const routines = nonGhost(snapshot.routines).map((row) => ({
    id: row.id,
    label: row.primaryLabel,
    when: row.dueLabel ?? row.waitingLabel ?? row.timeLabel,
    kind: "routine" as const,
    href: row.href,
  }));

  return [...decisions, ...routines].slice(0, 5);
}

export function buildDashboardGanttRows(
  snapshot: RelayPracticeSnapshot,
  excludeIds: ReadonlySet<string> = new Set()
): DashboardGanttRow[] {
  const journalIds = new Set(
    nonGhost(snapshot.attention)
      .filter((r) => r.kind === "journal")
      .map((r) => r.id)
  );

  const merged = [
    ...nonGhost(snapshot.patientWaiting),
    ...nonGhost(snapshot.teamwork),
    ...nonGhost(snapshot.practiceTasks),
    ...nonGhost(snapshot.attention).filter((r) => r.kind !== "journal"),
  ];

  const seen = new Set<string>();
  const unique: RelayWorkRow[] = [];
  for (const row of merged) {
    if (seen.has(row.id) || journalIds.has(row.id) || excludeIds.has(row.id)) continue;
    seen.add(row.id);
    unique.push(row);
  }

  const maxWeight = Math.max(unique.length, 1);

  return unique.slice(0, 6).map((row, index) => ({
    id: row.id,
    typeLabel: row.workTypeLabel ?? row.typeLabel,
    title: row.concernLine || row.primaryLabel,
    route: `${row.fromLabel} → ${row.toLabel}`,
    when: row.waitingLabel ?? row.timeLabel,
    href: row.href,
    weight: Math.max(0.35, 1 - index / maxWeight),
  }));
}
