import type { DashboardEditorialHeader } from "@/lib/dashboard/dashboard-header-summary";
import type { RelayPracticeSnapshot, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayHeaderSummary = {
  lead: string;
  breakdown: string;
  editorial: DashboardEditorialHeader;
};

function realRows(rows: RelayWorkRow[]): RelayWorkRow[] {
  return rows.filter((row) => !row.isGhost);
}

function countTasks(rows: RelayWorkRow[]): number {
  return realRows(rows).filter((row) => row.kind === "task" || row.kind === "journal").length;
}

function countUnreadMessages(rows: RelayWorkRow[]): number {
  return realRows(rows).filter(
    (row) => row.kind === "message" && (row.isCritical || row.statusLabel === "Ungelesen")
  ).length;
}

function joinNatural(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} und ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} und ${parts[parts.length - 1]}`;
}

function phrase(count: number, singular: string, plural: (n: number) => string): string | null {
  if (count <= 0) return null;
  return count === 1 ? singular : plural(count);
}

/** Kurze Statuszeile unter dem Namen — z. B. „2 neue Aufgaben und 4 neue Nachrichten“. */
export function buildRelayHeaderSummary(
  snapshot: Pick<
    RelayPracticeSnapshot,
    | "attention"
    | "teamwork"
    | "patientWaiting"
    | "routines"
    | "practiceTasks"
  >
): RelayHeaderSummary {
  const freigaben = countTasks(snapshot.attention);
  const aufgaben =
    countTasks(snapshot.teamwork) +
    countTasks(snapshot.practiceTasks) +
    countTasks(snapshot.routines);
  const nachrichten =
    countUnreadMessages(snapshot.teamwork) + countUnreadMessages(snapshot.patientWaiting);
  const patientenanfragen = realRows(snapshot.patientWaiting).filter((row) => row.kind === "task").length;

  const parts = [
    phrase(freigaben, "1 Freigabe", (n) => `${n} Freigaben`),
    phrase(aufgaben, "1 neue Aufgabe", (n) => `${n} neue Aufgaben`),
    phrase(nachrichten, "1 neue Nachricht", (n) => `${n} neue Nachrichten`),
    phrase(patientenanfragen, "1 Patientenanfrage", (n) => `${n} Patientenanfragen`),
  ].filter((part): part is string => Boolean(part));

  const statusPrimary = joinNatural(parts);

  return {
    lead: statusPrimary,
    breakdown: "",
    editorial: {
      statusTitle: "",
      statusPrimary,
      metricsLine: "",
    },
  };
}
