import type { RelayPracticeSnapshot, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import {
  relaySectionRows,
  type RelayPracticeSection,
} from "@/lib/relay/build-relay-practice-snapshot";

export type RelayWorkAreaId =
  | "attention"
  | "teamwork"
  | "patient_waiting"
  | "freigaben"
  | "routines";

export type RelayWorkAreaConfig = {
  id: RelayWorkAreaId;
  title: string;
  emptyTitle: string;
  emptyBody: string;
};

/** Verbindliche Reihenfolge — Referenz-Navigation. */
export const RELAY_WORK_AREAS: RelayWorkAreaConfig[] = [
  {
    id: "attention",
    title: "Wartet auf mich",
    emptyTitle: "Nichts wartet auf Sie",
    emptyBody: "Entscheidungen und persönliche Praxisarbeit erscheinen hier.",
  },
  {
    id: "patient_waiting",
    title: "Patienten",
    emptyTitle: "Kein Patient wartet",
    emptyBody: "Patientenfälle und Anfragen erscheinen hier.",
  },
  {
    id: "teamwork",
    title: "Team",
    emptyTitle: "Kein Team wartet",
    emptyBody: "Teamübergaben erscheinen hier.",
  },
  {
    id: "freigaben",
    title: "Freigaben",
    emptyTitle: "Keine Freigaben offen",
    emptyBody: "Journal- und Antwortfreigaben erscheinen hier.",
  },
  {
    id: "routines",
    title: "Routinen",
    emptyTitle: "Keine Routinen offen",
    emptyBody: "Wiederkehrende Aufgaben erscheinen hier.",
  },
];

function dedupeRows(rows: RelayWorkRow[]): RelayWorkRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function isFreigabeRow(row: RelayWorkRow): boolean {
  if (row.kind === "journal") return true;
  const s = `${row.statusLabel} ${row.actionLabel} ${row.typeLabel}`.toLowerCase();
  return s.includes("freigabe") || s.includes("freigeben");
}

export function parseRelayWorkArea(param: string | null): RelayWorkAreaId {
  if (param === "freigaben" || param === "freigabe") return "freigaben";
  if (
    param === "practice" ||
    param === "eingang" ||
    param === "zu-erledigen" ||
    param === "attention" ||
    param === "wartet"
  ) {
    return "attention";
  }
  if (param === "teamwork" || param === "team") return "teamwork";
  if (param === "patient_waiting" || param === "patient-wartet" || param === "patient") {
    return "patient_waiting";
  }
  if (param === "routines" || param === "routine") return "routines";
  return "attention";
}

export function relayWorkAreaRows(
  snapshot: RelayPracticeSnapshot,
  areaId: RelayWorkAreaId
): RelayWorkRow[] {
  if (areaId === "freigaben") {
    return snapshot.attention.filter((r) => !r.isGhost && isFreigabeRow(r));
  }
  if (areaId === "attention") {
    return dedupeRows([
      ...relaySectionRows(snapshot, "attention"),
      ...relaySectionRows(snapshot, "practice"),
    ]);
  }
  return relaySectionRows(snapshot, areaId);
}

export function relayWorkAreaCount(snapshot: RelayPracticeSnapshot, areaId: RelayWorkAreaId): number {
  return relayWorkAreaRows(snapshot, areaId).length;
}

export function relayWorkAreaConfig(areaId: RelayWorkAreaId): RelayWorkAreaConfig {
  return RELAY_WORK_AREAS.find((a) => a.id === areaId) ?? RELAY_WORK_AREAS[0]!;
}

/** Gesamtzahl offener Vorgänge (bereichsübergreifend, ohne Doppelzählung). */
export function relayTotalOpenCount(snapshot: RelayPracticeSnapshot): number {
  const ids = new Set<string>();
  for (const area of RELAY_WORK_AREAS) {
    for (const row of relayWorkAreaRows(snapshot, area.id)) {
      if (!row.isGhost) ids.add(row.id);
    }
  }
  return ids.size;
}

export function relayAreaAsPracticeSection(areaId: RelayWorkAreaId): RelayPracticeSection {
  if (areaId === "freigaben") return "attention";
  return areaId;
}
