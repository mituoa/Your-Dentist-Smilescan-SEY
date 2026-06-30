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
  isExample?: boolean;
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

/** Kurze Zeile für „Heute relevant“ — ohne erklärende Fließtexte. */
export function dashboardDisplayLabel(row: RelayWorkRow): string {
  const primary = row.primaryLabel?.trim();
  if (!primary || primary.toLowerCase() === "ohne titel") {
    if (row.kind === "message") return "Teamübergabe";
    return row.typeLabel?.trim() || "Offener Vorgang";
  }

  if (row.groupLabel === "Tracker" || row.typeLabel?.toLowerCase().includes("patient")) {
    if (/eingesendet/i.test(primary)) return primary;
    return `${primary} eingesendet`;
  }

  return primary;
}

function dashboardWhenLabel(row: RelayWorkRow): string {
  const when = row.dueLabel ?? row.waitingLabel ?? row.timeLabel;
  return when?.trim() ?? "";
}

const DASHBOARD_TODAY_EXAMPLES: DashboardTodayItem[] = [
  {
    id: "example-patient-submission",
    label: "Pat. Muster eingesendet",
    when: "vor 2 Std.",
    kind: "entscheidung",
    href: "/inbox",
    isExample: true,
  },
];

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
      title: "Freigaben & Entscheidungen",
      value: attention.length,
      detail: waitingDetail,
      href: "/relay?bereich=praxis",
      icon: "attention",
    },
    {
      id: "teamwork",
      title: "Neue Teamaufgaben",
      value: teamCount,
      detail:
        teamCount === 0
          ? "Keine offenen Aufgaben"
          : teamCount === 1
            ? "1 Aufgabe offen"
            : `${teamCount} Aufgaben offen`,
      href: "/relay?bereich=team",
      icon: "team",
    },
    {
      id: "patient",
      title: "Neue Patientenanfragen",
      value: patientCount,
      detail:
        patientCount === 0
          ? "Keine offenen Rückfragen"
          : patientCount === 1
            ? "1 Rückfrage offen"
            : `${patientCount} Rückfragen offen`,
      href: "/relay?bereich=patienten",
      icon: "patient",
    },
    {
      id: "routines",
      title: "Routinen fällig",
      value: routineCount,
      detail:
        routineCount === 0
          ? "Heute nichts fällig"
          : routineCount === 1
            ? "1 Routine heute"
            : `${routineCount} Routinen heute`,
      href: "/relay?bereich=praxis",
      icon: "routines",
    },
  ];
}

export const DASHBOARD_STATUS_SHORT_LABELS: Record<string, string> = {
  attention: "Freigaben",
  teamwork: "Team",
  patient: "Patienten",
  routines: "Routinen",
};

export function buildPracticeStateDomains(snapshot: RelayPracticeSnapshot): PracticeStateDomain[] {
  const journalRows = nonGhost(snapshot.attention).filter((r) => r.kind === "journal");
  const freigabeRows = nonGhost(snapshot.attention);

  return [
    {
      id: "patienten",
      label: "Patientenanfragen",
      count: nonGhost(snapshot.patientWaiting).length,
      href: "/relay?bereich=patienten",
    },
    {
      id: "journal",
      label: "Praxiswissen",
      count: journalRows.length,
      href: "/relay?bereich=journal",
    },
    {
      id: "team",
      label: "Teamaufgaben",
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
      label: "Tagesroutinen",
      count: nonGhost(snapshot.routines).length,
      href: "/relay?bereich=praxis",
    },
  ];
}

export function buildDashboardTodayRelevant(snapshot: RelayPracticeSnapshot): DashboardTodayItem[] {
  const patients = nonGhost(snapshot.patientWaiting).map((row) => ({
    id: row.id,
    label: dashboardDisplayLabel(row),
    when: dashboardWhenLabel(row),
    kind: "entscheidung" as const,
    href: row.href,
  }));

  const attention = nonGhost(snapshot.attention)
    .filter((row) => row.kind !== "journal")
    .map((row) => ({
      id: row.id,
      label: dashboardDisplayLabel(row),
      when: dashboardWhenLabel(row),
      kind: "entscheidung" as const,
      href: row.href,
    }));

  const items = [...patients, ...attention].slice(0, 5);
  if (items.length > 0) return items;

  return DASHBOARD_TODAY_EXAMPLES;
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
    title: dashboardDisplayLabel(row),
    route: `${row.fromLabel} → ${row.toLabel}`,
    when: row.waitingLabel ?? row.timeLabel,
    href: row.href,
    weight: Math.max(0.35, 1 - index / maxWeight),
  }));
}
