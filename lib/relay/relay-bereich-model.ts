import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { getContentTypeLabel, inferContentType } from "@/lib/journal/content-categories";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  buildRelayKanbanBoard,
  type RelayKanbanCard,
  type RelayKanbanColumnId,
} from "@/lib/relay/relay-work-center-model";
import {
  enrichRelayWorkRowDisplay,
  resolveRelayWorkObjectType,
  type RelayWorkObjectType,
} from "@/lib/relay/relay-work-object";
import {
  buildRelayPracticeSnapshot,
  type RelayWorkRow,
} from "@/lib/relay/build-relay-practice-snapshot";
import { formatRelayRelativeTime } from "@/lib/relay/relay-ops-status";

export type RelayBereich = "aufgaben" | "team" | "journal" | "praxis" | "patienten";
export type RelayAufgabenTab = "heute" | "offen" | "erledigt";

export const RELAY_BEREICHE: { id: RelayBereich; label: string }[] = [
  { id: "aufgaben", label: "Aufgaben" },
  { id: "team", label: "Team" },
  { id: "journal", label: "Journal" },
  { id: "praxis", label: "Praxis" },
  { id: "patienten", label: "Patienten" },
];

export const RELAY_AUFGABEN_TABS: { id: RelayAufgabenTab; label: string }[] = [
  { id: "heute", label: "Heute" },
  { id: "offen", label: "Offen" },
  { id: "erledigt", label: "Erledigt" },
];

const PATIENT_TYPES: RelayWorkObjectType[] = ["patientenanfrage", "patientenantwort"];
const PRAXIS_TYPES: RelayWorkObjectType[] = ["teamaufgabe", "routine", "uebergabe"];

export type RelayAufgabeItem = {
  id: string;
  href: string;
  title: string;
  kind: string;
  timing: string | null;
  dateLabel: string | null;
  done: boolean;
};

export type RelayJournalItem = {
  id: string;
  href: string;
  title: string;
  excerpt: string | null;
  category: string;
  author: string;
  waitingLabel: string;
  dateLabel: string;
};

export type RelayPatientItem = {
  id: string;
  href: string;
  patientName: string;
  concern: string;
  waitingLabel: string;
  dateLabel: string | null;
};

export type RelayPraxisItem = {
  id: string;
  href: string;
  title: string;
  category: string;
  group: string | null;
  timing: string | null;
};

export type RelayBereichData = {
  bereichCounts: Record<RelayBereich, number>;
  aufgabenCounts: Record<RelayAufgabenTab, number>;
  aufgaben: RelayAufgabeItem[];
  journal: RelayJournalItem[];
  patienten: RelayPatientItem[];
  praxis: RelayPraxisItem[];
  teamUnread: number;
};

function findTask(
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] },
  id: string
): MyTask | undefined {
  return [...columns.open, ...columns.pending, ...columns.done].find((t) => t.id === id);
}

function findJournal(journalDrafts: JournalEntry[], rowId: string): JournalEntry | undefined {
  const journalId = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  if (!journalId) return undefined;
  return journalDrafts.find((j) => j.id === journalId);
}

function collectSnapshotRows(
  snapshot: ReturnType<typeof buildRelayPracticeSnapshot>
): RelayWorkRow[] {
  const seen = new Set<string>();
  const rows: RelayWorkRow[] = [];
  for (const list of [
    snapshot.attention,
    snapshot.teamwork,
    snapshot.patientWaiting,
    snapshot.routines,
    snapshot.practiceTasks,
  ]) {
    for (const row of list) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
    }
  }
  return rows;
}

function timingFromStatus(statusLine: string): string {
  const s = statusLine.trim();
  if (!s) return "";
  if (s.startsWith("wartet seit ")) return `Seit ${s.slice("wartet seit ".length)}`;
  if (s === "gerade eingegangen") return "Gerade eingegangen";
  if (s === "Erledigt") return "Erledigt";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isHeuteTask(
  column: RelayKanbanColumnId,
  task: MyTask | undefined
): boolean {
  if (column === "decision") return true;
  if (!task?.due_date) return false;
  const due = task.due_date.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return due <= today;
}

function aufgabenTabFor(
  column: RelayKanbanColumnId,
  task: MyTask | undefined
): RelayAufgabenTab {
  if (column === "done") return "erledigt";
  if (isHeuteTask(column, task)) return "heute";
  return "offen";
}

function mapJournalItem(entry: JournalEntry): RelayJournalItem {
  const category = getContentTypeLabel(inferContentType(entry));
  return {
    id: entry.id,
    href: `/journal/${entry.id}/edit`,
    title: entry.title?.trim() || `Journal-Freigabe: ${category}`,
    excerpt: entry.excerpt?.trim() || entry.content_markdown?.slice(0, 160) || null,
    category,
    author: "Praxis-Team",
    waitingLabel: formatRelayRelativeTime(entry.updated_at),
    dateLabel: new Date(entry.updated_at).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
    }),
  };
}

function mapPatientRow(row: RelayWorkRow, task?: MyTask): RelayPatientItem {
  const enriched = enrichRelayWorkRowDisplay(row, { task });
  return {
    id: row.id,
    href: row.href,
    patientName: enriched.primaryLabel,
    concern: enriched.concernLine ?? row.context,
    waitingLabel: timingFromStatus(enriched.waitingLabel ?? row.statusLabel),
    dateLabel: row.dueLabel ?? row.timeLabel ?? null,
  };
}

function mapPraxisCard(
  card: RelayKanbanCard,
  row: RelayWorkRow | null,
  task?: MyTask,
  journal?: JournalEntry
): RelayPraxisItem {
  const enriched = row
    ? enrichRelayWorkRowDisplay(row, { task, journal })
    : null;
  return {
    id: card.id,
    href: card.href,
    title: card.title,
    category: enriched?.workTypeLabel ?? card.typeLabel,
    group: row?.groupLabel?.trim() || null,
    timing: timingFromStatus(card.metaLine) || null,
  };
}

function mapAufgabeCard(
  card: RelayKanbanCard,
  row: RelayWorkRow | null,
  task?: MyTask,
  journal?: JournalEntry,
  draftStatus?: MessageDraftListStatus
): RelayAufgabeItem {
  const enriched = row
    ? enrichRelayWorkRowDisplay(row, { task, journal, messageDraftStatus: draftStatus })
    : null;
  return {
    id: card.id,
    href: card.href,
    title: card.title,
    kind: enriched?.workTypeLabel ?? card.typeLabel,
    timing: timingFromStatus(card.metaLine) || null,
    dateLabel: card.dateLabel,
    done: false,
  };
}

export function buildRelayBereichData(input: {
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  journalDrafts: JournalEntry[];
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  submissionDraftStatus: Record<string, MessageDraftListStatus>;
  isDoctor: boolean;
  userId: string;
  aufgabenTab: RelayAufgabenTab;
  searchQuery?: string;
}): RelayBereichData {
  const board = buildRelayKanbanBoard({
    columns: input.columns,
    journalDrafts: input.journalDrafts,
    assignableMembers: input.assignableMembers,
    submissionDraftStatus: input.submissionDraftStatus,
    isDoctor: input.isDoctor,
    userId: input.userId,
    scope: "mine",
    searchQuery: input.searchQuery,
  });

  const snapshot = buildRelayPracticeSnapshot({
    open: input.columns.open,
    pending: input.columns.pending,
    members: input.assignableMembers,
    draftBySubmissionId: input.submissionDraftStatus,
    conversations: input.conversations,
    journalDrafts: input.journalDrafts,
    isDoctor: input.isDoctor,
    userId: input.userId,
    basePath: "/relay",
  });
  const snapshotRows = collectSnapshotRows(snapshot);

  const aufgabenAll: { item: RelayAufgabeItem; tab: RelayAufgabenTab }[] = [];
  const praxisAll: RelayPraxisItem[] = [];
  const patientenAll: RelayPatientItem[] = [];

  for (const column of Object.keys(board) as RelayKanbanColumnId[]) {
    for (const card of board[column]) {
      const row = snapshotRows.find((r) => r.id === card.id) ?? null;
      const task = row?.kind === "task" ? findTask(input.columns, card.id) : undefined;
      const journal =
        row?.kind === "journal" ? findJournal(input.journalDrafts, card.id) : undefined;
      const draftStatus = task?.submission_id
        ? input.submissionDraftStatus[task.submission_id] ?? "none"
        : "none";
      const objectType = row
        ? resolveRelayWorkObjectType(row, {
            task,
            journal,
            messageDraftStatus: draftStatus,
          })
        : journal
          ? "journal_freigabe"
          : "teamaufgabe";

      if (objectType === "journal_freigabe") continue;

      if (PATIENT_TYPES.includes(objectType)) {
        if (row && column !== "done") {
          patientenAll.push(mapPatientRow(row, task));
        }
        continue;
      }

      if (PRAXIS_TYPES.includes(objectType)) {
        if (column !== "done") {
          praxisAll.push(mapPraxisCard(card, row, task, journal));
        }
        continue;
      }

      const tab = aufgabenTabFor(column, task);
      const item = mapAufgabeCard(card, row, task, journal, draftStatus);
      item.done = column === "done";
      aufgabenAll.push({ item, tab });
    }
  }

  const journalItems = input.journalDrafts.map(mapJournalItem);

  for (const row of snapshot.patientWaiting) {
    if (patientenAll.some((p) => p.id === row.id)) continue;
    const task = row.kind === "task" ? findTask(input.columns, row.id) : undefined;
    patientenAll.push(mapPatientRow(row, task));
  }

  const aufgabenCounts: Record<RelayAufgabenTab, number> = {
    heute: aufgabenAll.filter((x) => x.tab === "heute").length,
    offen: aufgabenAll.filter((x) => x.tab === "offen").length,
    erledigt: aufgabenAll.filter((x) => x.tab === "erledigt").length,
  };

  const teamUnread = input.conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const bereichCounts: Record<RelayBereich, number> = {
    aufgaben: aufgabenCounts.heute + aufgabenCounts.offen,
    team: input.conversations.length,
    journal: journalItems.length,
    praxis: praxisAll.length,
    patienten: patientenAll.length,
  };

  return {
    bereichCounts,
    aufgabenCounts,
    aufgaben: aufgabenAll.filter((x) => x.tab === input.aufgabenTab).map((x) => x.item),
    journal: journalItems,
    patienten: patientenAll,
    praxis: praxisAll,
    teamUnread,
  };
}

export function parseRelayBereich(value: string | null): RelayBereich {
  if (
    value === "team" ||
    value === "journal" ||
    value === "praxis" ||
    value === "patienten"
  ) {
    return value;
  }
  if (value === "nachrichten" || value === "handovers" || value === "teamwork") return "team";
  return "aufgaben";
}

export function parseRelayAufgabenTab(value: string | null): RelayAufgabenTab {
  if (value === "offen" || value === "erledigt") return value;
  if (value === "entscheidung" || value === "bearbeitung") return "heute";
  return "heute";
}
