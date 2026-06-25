import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayWorkStatusId = "all" | "waiting" | "in_progress" | "freigaben" | "done";

export const RELAY_WORK_STATUS_TABS: { id: RelayWorkStatusId; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "waiting", label: "Wartet auf mich" },
  { id: "in_progress", label: "In Bearbeitung" },
  { id: "freigaben", label: "Freigaben" },
  { id: "done", label: "Erledigt" },
];

function isFreigabeRow(row: RelayWorkRow): boolean {
  if (row.kind === "journal") return true;
  const s = `${row.statusLabel} ${row.actionLabel} ${row.typeLabel}`.toLowerCase();
  return s.includes("freigabe") || s.includes("freigeben");
}

export function classifyRelayWorkStatus(row: RelayWorkRow): RelayWorkStatusId {
  const status = row.statusLabel.toLowerCase();
  if (status.includes("erledigt")) return "done";
  if (isFreigabeRow(row)) return "freigaben";
  if (status.includes("arbeit") || status.includes("bearbeit")) return "in_progress";
  return "waiting";
}

export function filterRowsByStatus(
  rows: RelayWorkRow[],
  status: RelayWorkStatusId
): RelayWorkRow[] {
  const work = rows.filter((r) => !r.isGhost);
  if (status === "all") return work;
  return work.filter((r) => classifyRelayWorkStatus(r) === status);
}

export function countRowsByStatus(rows: RelayWorkRow[]): Record<RelayWorkStatusId, number> {
  const work = rows.filter((r) => !r.isGhost);
  const counts: Record<RelayWorkStatusId, number> = {
    all: work.length,
    waiting: 0,
    in_progress: 0,
    freigaben: 0,
    done: 0,
  };
  for (const row of work) {
    counts[classifyRelayWorkStatus(row)] += 1;
  }
  return counts;
}
