import type { RelayPracticeSnapshot, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import type { MyTask } from "@/lib/queries/my-tasks";

export type RelayBoardColumnId = "waiting_on_me" | "todo" | "in_progress" | "done";

export type RelaySidebarFilter =
  | "all"
  | "attention"
  | "teamwork"
  | "patient_waiting"
  | "freigaben"
  | "routines";

export type RelayBoardColumn = {
  id: RelayBoardColumnId;
  title: string;
};

export const RELAY_BOARD_COLUMNS: RelayBoardColumn[] = [
  { id: "waiting_on_me", title: "Wartet auf mich" },
  { id: "todo", title: "Zu erledigen" },
  { id: "in_progress", title: "In Arbeit" },
  { id: "done", title: "Erledigt" },
];

export type RelayBoardCard = {
  row: RelayWorkRow;
  columnId: RelayBoardColumnId;
  sidebarTags: RelaySidebarFilter[];
};

function isFreigabeRow(row: RelayWorkRow): boolean {
  if (row.kind === "journal") return true;
  const s = `${row.statusLabel} ${row.actionLabel} ${row.typeLabel}`.toLowerCase();
  return s.includes("freigabe") || s.includes("freigeben");
}

function sidebarTagsForRow(
  row: RelayWorkRow,
  source: "attention" | "practice" | "teamwork" | "patient_waiting" | "routines"
): RelaySidebarFilter[] {
  const tags: RelaySidebarFilter[] = ["all"];
  if (source === "attention") tags.push("attention");
  if (source === "teamwork") tags.push("teamwork");
  if (source === "patient_waiting") tags.push("patient_waiting");
  if (source === "routines") tags.push("routines");
  if (isFreigabeRow(row)) tags.push("freigaben");
  return tags;
}

function classifyColumn(
  row: RelayWorkRow,
  source: "attention" | "practice" | "teamwork" | "patient_waiting" | "routines"
): RelayBoardColumnId {
  if (row.isGhost) return "todo";
  if (source === "attention" || isFreigabeRow(row)) return "waiting_on_me";
  if (source === "practice" || source === "routines") return "todo";
  if (source === "teamwork" || source === "patient_waiting" || row.kind === "message") {
    return "in_progress";
  }
  const status = row.statusLabel.toLowerCase();
  if (status.includes("arbeit") || status.includes("bearbeit")) return "in_progress";
  return "todo";
}

function mapDoneTask(task: MyTask): RelayWorkRow {
  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    primaryLabel: task.title,
    context: task.description?.trim() || "Erledigt",
    timeLabel: "",
    actionLabel: "Erledigt",
    statusLabel: "Erledigt",
    typeLabel: "Aufgabe",
    groupLabel: "Praxis",
    fromLabel: "Team",
    toLabel: "Praxis",
    dueLabel: null,
    kind: "task",
    concernLine: task.description?.trim() || undefined,
    waitingLabel: undefined,
    isGhost: false,
    isCritical: false,
  };
}

export function buildRelayBoardCards(
  snapshot: RelayPracticeSnapshot,
  doneTasks: MyTask[] = [],
  sidebarFilter: RelaySidebarFilter = "all"
): RelayBoardCard[] {
  const sources: Array<{
    source: "attention" | "practice" | "teamwork" | "patient_waiting" | "routines";
    rows: RelayWorkRow[];
  }> = [
    { source: "attention", rows: snapshot.attention },
    { source: "practice", rows: snapshot.practiceTasks },
    { source: "teamwork", rows: snapshot.teamwork },
    { source: "patient_waiting", rows: snapshot.patientWaiting },
    { source: "routines", rows: snapshot.routines },
  ];

  const seen = new Set<string>();
  const cards: RelayBoardCard[] = [];

  for (const { source, rows } of sources) {
    for (const row of rows) {
      if (row.isGhost || seen.has(row.id)) continue;
      seen.add(row.id);
      const tags = sidebarTagsForRow(row, source);
      if (sidebarFilter !== "all" && !tags.includes(sidebarFilter)) continue;
      cards.push({
        row,
        columnId: classifyColumn(row, source),
        sidebarTags: tags,
      });
    }
  }

  for (const task of doneTasks.slice(0, 12)) {
    const row = mapDoneTask(task);
    if (seen.has(row.id)) continue;
    if (sidebarFilter !== "all" && sidebarFilter !== "attention") continue;
    cards.push({
      row,
      columnId: "done",
      sidebarTags: ["all", "attention"],
    });
  }

  return cards;
}

export function relayBoardColumnCards(
  cards: RelayBoardCard[],
  columnId: RelayBoardColumnId
): RelayBoardCard[] {
  return cards.filter((c) => c.columnId === columnId);
}

export function relayBoardTotalCount(cards: RelayBoardCard[]): number {
  return cards.filter((c) => c.columnId !== "done").length;
}
