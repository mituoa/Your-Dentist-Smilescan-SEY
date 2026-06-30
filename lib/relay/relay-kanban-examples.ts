import type { RelayKanbanCard, RelayKanbanColumnId } from "@/lib/relay/relay-work-center-model";

/** Kurze Beispiel-Vorgänge — nur wenn noch keine Live-Daten da sind. */
export const RELAY_KANBAN_EXAMPLES: RelayKanbanCard[] = [
  {
    id: "example-decision-patient",
    href: "/inbox",
    typeLabel: "Einsendung",
    typeCode: "P",
    title: "Pat. Muster eingesendet",
    metaLine: "",
    dateLabel: "vor 2 Std.",
    actionLabel: "Öffnen",
    assigneeInitials: "",
    assigneeColor: "#2f80ed",
    commentCount: 0,
    priority: "normal",
    isGhost: true,
    columnId: "decision",
  },
  {
    id: "example-progress-patient",
    href: "/inbox",
    typeLabel: "Einsendung",
    typeCode: "P",
    title: "Pat. Beispiel eingesendet",
    metaLine: "",
    dateLabel: "Heute",
    actionLabel: "Öffnen",
    assigneeInitials: "",
    assigneeColor: "#64748b",
    commentCount: 0,
    priority: "normal",
    isGhost: true,
    columnId: "in_progress",
  },
  {
    id: "example-done-patient",
    href: "/inbox",
    typeLabel: "Einsendung",
    typeCode: "P",
    title: "Pat. Schmidt eingesendet",
    metaLine: "",
    dateLabel: "gestern",
    actionLabel: "Öffnen",
    assigneeInitials: "",
    assigneeColor: "#334155",
    commentCount: 0,
    priority: "normal",
    isGhost: true,
    columnId: "done",
  },
];

export function examplesForKanbanColumn(columnId: RelayKanbanColumnId): RelayKanbanCard[] {
  return RELAY_KANBAN_EXAMPLES.filter((c) => c.columnId === columnId);
}
