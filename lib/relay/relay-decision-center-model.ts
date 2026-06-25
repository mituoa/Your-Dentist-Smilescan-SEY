import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayPracticeSnapshot, RelayPracticeSection, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayDecisionDomain = "journal" | "patienten" | "praxis" | "team";

export type RelayDecisionTile = {
  id: RelayDecisionDomain;
  title: string;
  count: number;
  headline: string;
  context: string;
  cta: string | null;
};

export type RelayDecisionHero = {
  totalOpen: number;
  journalApprovals: number;
  patientWaiting: number;
  teamDecisions: number;
};

export type RelayPriorityItem = {
  id: string;
  domain: RelayDecisionDomain;
  domainLabel: string;
  typeLabel: string;
  title: string;
  assigneeLabel: string;
  waitLabel: string;
  actionLabel: string;
};

export type RelayCompletedItem = {
  id: string;
  title: string;
  domainLabel: string;
  whenLabel: string;
};

const DOMAIN_LABELS: Record<RelayDecisionDomain, string> = {
  journal: "Journal",
  patienten: "Patienten",
  praxis: "Praxis",
  team: "Team",
};

const ALL_DOMAINS: RelayDecisionDomain[] = ["journal", "patienten", "praxis", "team"];

/** Bento-Spalte auf der Relay-Startseite — nur Entscheidungsbereiche. */
export const RELAY_HOME_BENTO_DOMAINS: RelayDecisionDomain[] = ["journal", "patienten", "team"];

function nonGhost(rows: RelayWorkRow[]): RelayWorkRow[] {
  return rows.filter((r) => !r.isGhost);
}

function isStaleWait(row: RelayWorkRow): boolean {
  const w = row.waitingLabel ?? "";
  const dayMatch = w.match(/(\d+)\s*(?:Tag|T\.)/i);
  if (dayMatch) return Number(dayMatch[1]) >= 2;
  const hourMatch = w.match(/(\d+)\s*Std/i);
  if (hourMatch) return Number(hourMatch[1]) >= 48;
  return Boolean(row.isCritical);
}

function urgencyScore(row: RelayWorkRow, domain: RelayDecisionDomain): number {
  let score = 0;
  if (row.isCritical) score += 120;
  if (row.kind === "journal") score += 50;
  if (domain === "patienten") score += 40;
  if (row.waitingLabel?.match(/\d+\s*(?:Tag|T\.)/i)) score += 35;
  if (row.dueLabel) score += 20;
  if (row.waitingLabel?.match(/\d+\s*Std/i)) score += 15;
  return score;
}

function waitLabelForRow(row: RelayWorkRow): string {
  if (row.waitingLabel) {
    return row.waitingLabel.startsWith("wartet") ? row.waitingLabel : `wartet ${row.waitingLabel}`;
  }
  if (row.dueLabel) return `fällig ${row.dueLabel}`;
  if (row.timeLabel) return `seit ${row.timeLabel}`;
  return "offen";
}

function assigneeLabelForRow(row: RelayWorkRow): string {
  if (row.toLabel?.trim() && row.toLabel !== "Arzt") return row.toLabel.trim();
  if (row.groupLabel?.trim()) return row.groupLabel.trim();
  if (row.fromLabel?.trim()) return row.fromLabel.trim();
  return "Praxis";
}

function actionLabelForRow(row: RelayWorkRow): string {
  if (row.actionLabel?.trim()) return row.actionLabel.trim();
  return "Öffnen";
}

function typeLabelForRow(row: RelayWorkRow, domain: RelayDecisionDomain): string {
  if (row.kind === "journal") return "Journalfreigabe";
  if (domain === "patienten") return "Patientenanfrage";
  if (domain === "team") return "Teamentscheidung";
  if (row.statusLabel.toLowerCase().includes("freigabe")) return "Freigabe";
  return row.workTypeLabel ?? row.typeLabel;
}

function titleForRow(row: RelayWorkRow): string {
  return row.concernLine?.trim() || row.primaryLabel;
}

export function parseRelayDecisionDomain(param: string | null): RelayDecisionDomain | null {
  if (!param) return null;
  if (param === "journal" || param === "freigaben" || param === "freigabe") return "journal";
  if (
    param === "patienten" ||
    param === "patient" ||
    param === "patient_waiting" ||
    param === "patient-wartet"
  ) {
    return "patienten";
  }
  if (
    param === "praxis" ||
    param === "practice" ||
    param === "attention" ||
    param === "wartet" ||
    param === "routines" ||
    param === "routine" ||
    param === "zu-erledigen" ||
    param === "eingang"
  ) {
    return "praxis";
  }
  if (param === "team" || param === "teamwork" || param === "handovers" || param === "nachrichten") {
    return "team";
  }
  return null;
}

export function relayDecisionDomainRows(
  snapshot: RelayPracticeSnapshot,
  domain: RelayDecisionDomain
): RelayWorkRow[] {
  switch (domain) {
    case "journal":
      return nonGhost(snapshot.attention).filter((r) => r.kind === "journal");
    case "patienten":
      return nonGhost(snapshot.patientWaiting);
    case "praxis":
      return [
        ...nonGhost(snapshot.practiceTasks),
        ...nonGhost(snapshot.attention).filter((r) => r.kind !== "journal"),
        ...nonGhost(snapshot.routines),
      ];
    case "team":
      return nonGhost(snapshot.teamwork);
  }
}

export function relayDecisionDomainCount(
  snapshot: RelayPracticeSnapshot,
  domain: RelayDecisionDomain
): number {
  return relayDecisionDomainRows(snapshot, domain).length;
}

export function findRelayDecisionRow(
  snapshot: RelayPracticeSnapshot,
  rowId: string
): { row: RelayWorkRow; domain: RelayDecisionDomain } | null {
  for (const domain of ALL_DOMAINS) {
    const row = relayDecisionDomainRows(snapshot, domain).find((r) => r.id === rowId);
    if (row) return { row, domain };
  }
  return null;
}

export function buildRelayDecisionTiles(snapshot: RelayPracticeSnapshot): RelayDecisionTile[] {
  const journalRows = relayDecisionDomainRows(snapshot, "journal");
  const patientenRows = relayDecisionDomainRows(snapshot, "patienten");
  const teamRows = relayDecisionDomainRows(snapshot, "team");

  const journal = journalRows.length;
  const patienten = patientenRows.length;
  const team = teamRows.length;

  const journalStale = journalRows.filter(isStaleWait).length;

  return [
    {
      id: "journal",
      title: "Journal",
      count: journal,
      headline:
        journal === 0
          ? "Keine Freigaben"
          : journal === 1
            ? "1 Freigabe"
            : `${journal} Freigaben`,
      context:
        journal === 0
          ? "Alles freigegeben"
          : journalStale > 0
            ? `${journalStale} seit über 48 Std.`
            : "Zur Prüfung bereit",
      cta: journal > 0 ? "Prüfen" : null,
    },
    {
      id: "patienten",
      title: "Patienten",
      count: patienten,
      headline:
        patienten === 0
          ? "Keine Anfragen"
          : patienten === 1
            ? "1 Anfrage"
            : `${patienten} Anfragen`,
      context: patienten === 0 ? "Alles beantwortet" : "Antwort oder Entscheidung",
      cta: patienten > 0 ? "Bearbeiten" : null,
    },
    {
      id: "team",
      title: "Team",
      count: team,
      headline:
        team === 0
          ? "Niemand wartet"
          : team === 1
            ? "1 Entscheidung"
            : `${team} Entscheidungen`,
      context: team === 0 ? "Keine Übergaben" : "Team wartet auf Sie",
      cta: team > 0 ? "Entscheiden" : null,
    },
  ];
}

export function buildRelayDecisionHero(snapshot: RelayPracticeSnapshot): RelayDecisionHero {
  const journal = relayDecisionDomainCount(snapshot, "journal");
  const patienten = relayDecisionDomainCount(snapshot, "patienten");
  const team = relayDecisionDomainCount(snapshot, "team");

  return {
    totalOpen: journal + patienten + team,
    journalApprovals: journal,
    patientWaiting: patienten,
    teamDecisions: team,
  };
}

export function buildRelayPriorityItems(snapshot: RelayPracticeSnapshot): RelayPriorityItem[] {
  const tagged = RELAY_HOME_BENTO_DOMAINS.flatMap((domain) =>
    relayDecisionDomainRows(snapshot, domain).map((row) => ({ row, domain }))
  );

  return tagged
    .sort((a, b) => urgencyScore(b.row, b.domain) - urgencyScore(a.row, a.domain))
    .slice(0, 6)
    .map(({ row, domain }) => ({
      id: row.id,
      domain,
      domainLabel: DOMAIN_LABELS[domain],
      typeLabel: typeLabelForRow(row, domain),
      title: titleForRow(row),
      assigneeLabel: assigneeLabelForRow(row),
      waitLabel: waitLabelForRow(row),
      actionLabel: actionLabelForRow(row),
    }));
}

export function buildRelayCompletedItems(doneTasks: MyTask[]): RelayCompletedItem[] {
  return doneTasks.slice(0, 5).map((task) => ({
    id: task.id,
    title: task.title,
    domainLabel: "Praxis",
    whenLabel: task.done_at
      ? new Date(task.done_at).toLocaleDateString("de-DE", {
          day: "numeric",
          month: "long",
        })
      : "Erledigt",
  }));
}

export function resolveRowPracticeSection(
  snapshot: RelayPracticeSnapshot,
  row: RelayWorkRow
): RelayPracticeSection {
  if (snapshot.patientWaiting.some((r) => r.id === row.id)) return "patient_waiting";
  if (snapshot.teamwork.some((r) => r.id === row.id)) return "teamwork";
  if (snapshot.routines.some((r) => r.id === row.id)) return "routines";
  if (snapshot.practiceTasks.some((r) => r.id === row.id)) return "practice";
  if (snapshot.attention.some((r) => r.id === row.id)) return "attention";
  return "practice";
}

export const RELAY_DECISION_DOMAIN_CONFIG: Record<
  RelayDecisionDomain,
  { title: string; emptyTitle: string; emptyBody: string }
> = {
  journal: {
    title: "Journal",
    emptyTitle: "Keine Journalfreigaben.",
    emptyBody: "Freigebbare Artikel erscheinen hier, sobald das Team sie einreicht.",
  },
  patienten: {
    title: "Patienten",
    emptyTitle: "Kein Patient wartet.",
    emptyBody: "Anfragen und Rückmeldungen erscheinen hier, sobald Handlungsbedarf besteht.",
  },
  praxis: {
    title: "Praxis",
    emptyTitle: "Keine Praxisvorgänge offen.",
    emptyBody: "Entscheidungen, Aufgaben und Routinen erscheinen hier nach Priorität.",
  },
  team: {
    title: "Team",
    emptyTitle: "Kein Team wartet.",
    emptyBody: "Übergaben und Rückfragen erscheinen hier, sobald das Team auf Sie wartet.",
  },
};
