import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { initialsFromEmail } from "@/components/settings/settings-team-member-card";
import { assigneeLabelForTask } from "@/lib/relay/build-relay-snapshot";
import {
  buildRelayPracticeSnapshot,
  type RelayPracticeSnapshot,
  type RelayWorkRow,
} from "@/lib/relay/build-relay-practice-snapshot";
import { classifyRelayWorkStatus, type RelayWorkStatusId } from "@/lib/relay/relay-work-status";
import {
  enrichRelayWorkRowDisplay,
  resolveRelayWorkObjectType,
  type RelayWorkObjectType,
} from "@/lib/relay/relay-work-object";
import { formatRelayMessageTimestamp } from "@/lib/relay/read-receipt-display";
import { examplesForKanbanColumn } from "@/lib/relay/relay-kanban-examples";
import type { BoardColumnId } from "@/lib/tasks/workflow-rules";

export type RelayKanbanColumnId = "decision" | "in_progress" | "done";
export type RelayTaskScopeTab = "all" | "mine" | "delegated";
export type RelayMessageInboxTab = "unread" | "all" | "mentions";

export type RelayKanbanCard = {
  id: string;
  href: string;
  typeLabel: string;
  typeCode: string;
  title: string;
  metaLine: string;
  dateLabel: string | null;
  actionLabel: string;
  assigneeInitials: string;
  assigneeColor: string;
  commentCount: number;
  priority: "normal" | "important";
  /** Echte Aufgabe — für Drag & Drop Statuswechsel. */
  taskId?: string | null;
  /** Beispielkarte — nicht persistiert. */
  isGhost?: boolean;
  columnId?: RelayKanbanColumnId;
};

export type RelayTeamInboxRow = {
  id: string;
  href: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  preview: string;
  areaLabel: string;
  areaTone: "blue" | "green" | "neutral";
  timeLabel: string;
  unread: boolean;
};

export const RELAY_KANBAN_COLUMNS: {
  id: RelayKanbanColumnId;
  label: string;
  tone: "waiting" | "progress" | "done";
  emptyTitle: string;
  emptyHint?: string;
}[] = [
  {
    id: "decision",
    label: "Benötigt Entscheidung",
    tone: "waiting",
    emptyTitle: "Keine offenen Entscheidungen.",
    emptyHint: "Freigaben und Rückfragen erscheinen hier.",
  },
  {
    id: "in_progress",
    label: "In Bearbeitung",
    tone: "progress",
    emptyTitle: "Nichts in Bearbeitung.",
    emptyHint: "Laufende Vorgänge des Teams erscheinen hier.",
  },
  {
    id: "done",
    label: "Erledigt",
    tone: "done",
    emptyTitle: "Keine offenen Aufgaben.",
    emptyHint: "Sie sind für heute fertig.",
  },
];

export const RELAY_TASK_SCOPE_TABS: { id: RelayTaskScopeTab; label: string }[] = [
  { id: "all", label: "Alle Aufgaben" },
  { id: "mine", label: "Meine Aufgaben" },
  { id: "delegated", label: "Delegiert" },
];

export const RELAY_MESSAGE_INBOX_TABS: { id: RelayMessageInboxTab; label: string }[] = [
  { id: "unread", label: "Ungelesen" },
  { id: "all", label: "Alle Nachrichten" },
  { id: "mentions", label: "Erwähnungen" },
];

const AVATAR_COLORS = ["#2f80ed", "#1a2b4a", "#64748b", "#0f766e", "#334155"];

const TYPE_CODES: Record<RelayWorkObjectType, string> = {
  journal_freigabe: "J",
  patientenanfrage: "P",
  patientenantwort: "P",
  teamaufgabe: "T",
  routine: "R",
  uebergabe: "U",
  entscheidung: "E",
};

function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0]!;
}

function statusToColumn(status: RelayWorkStatusId): RelayKanbanColumnId {
  if (status === "done") return "done";
  if (status === "in_progress") return "in_progress";
  return "decision";
}

function taskDbColumn(
  taskId: string,
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] }
): BoardColumnId | null {
  if (columns.done.some((t) => t.id === taskId)) return "done";
  if (columns.pending.some((t) => t.id === taskId)) return "pending";
  if (columns.open.some((t) => t.id === taskId)) return "open";
  return null;
}

function dbColumnToKanban(db: BoardColumnId): RelayKanbanColumnId {
  if (db === "done") return "done";
  if (db === "pending") return "in_progress";
  return "decision";
}

function columnForRow(
  row: RelayWorkRow,
  task: MyTask | undefined,
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] }
): RelayKanbanColumnId {
  if (row.kind === "journal") return "decision";
  if (task) {
    const dbCol = taskDbColumn(task.id, columns);
    if (dbCol) return dbColumnToKanban(dbCol);
    if (task.status === "done") return "done";
    if (task.status === "pending_review") return "in_progress";
  }
  return statusToColumn(classifyRelayWorkStatus(row));
}

function findTask(
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] },
  rowId: string
): MyTask | undefined {
  return [...columns.open, ...columns.pending, ...columns.done].find((t) => t.id === rowId);
}

function findJournal(journalDrafts: JournalEntry[], rowId: string): JournalEntry | undefined {
  const journalId = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  if (!journalId) return undefined;
  return journalDrafts.find((j) => j.id === journalId);
}

function collectSnapshotRows(snapshot: RelayPracticeSnapshot): RelayWorkRow[] {
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

function assigneeForRow(
  row: RelayWorkRow,
  task: MyTask | undefined,
  membersById: Map<string, AssignableMember>
): { initials: string; color: string } {
  if (task) {
    const assigneeId =
      task.specific_recipient_id ??
      task.assignee_ids[0] ??
      task.created_by;
    const member = membersById.get(assigneeId);
    if (member) {
      return {
        initials: initialsFromEmail(member.email),
        color: colorForKey(member.user_id),
      };
    }
    const label = assigneeLabelForTask(task, membersById);
    return { initials: label.slice(0, 2).toUpperCase(), color: colorForKey(assigneeId) };
  }
  const from = row.fromLabel?.trim() || "P";
  return {
    initials: from.slice(0, 2).toUpperCase(),
    color: colorForKey(from),
  };
}

function matchesScope(
  row: RelayWorkRow,
  task: MyTask | undefined,
  scope: RelayTaskScopeTab,
  userId: string,
  isDoctor: boolean
): boolean {
  if (scope === "all") return true;
  if (row.kind === "journal") return isDoctor && scope === "mine";
  if (row.kind === "message") return scope === "mine";
  if (!task) return false;

  const assignedToMe =
    task.assignee_ids.includes(userId) || task.specific_recipient_id === userId;
  const createdByMe = task.created_by === userId;
  const needsDoctor =
    isDoctor &&
    (task.recipient_type === "doctor_only" || task.status === "pending_review");

  if (scope === "mine") {
    return assignedToMe || needsDoctor || (createdByMe && !task.assignee_ids.length);
  }
  if (scope === "delegated") {
    return createdByMe && !assignedToMe && task.assignee_ids.length > 0;
  }
  return true;
}

function rowToKanbanCard(
  row: RelayWorkRow,
  task: MyTask | undefined,
  membersById: Map<string, AssignableMember>,
  journal?: JournalEntry,
  messageDraftStatus?: MessageDraftListStatus
): RelayKanbanCard {
  const enriched = enrichRelayWorkRowDisplay(row, {
    task,
    journal,
    messageDraftStatus,
  });
  const objectType = resolveRelayWorkObjectType(row, { task, journal, messageDraftStatus });
  const assignee = assigneeForRow(row, task, membersById);

  const from = row.fromLabel?.trim();
  const metaLine = from
    ? `Bearbeitet von ${from}`
    : enriched.waitingLabel ?? enriched.concernLine ?? row.statusLabel;

  return {
    id: row.id,
    href: row.href,
    typeLabel: enriched.workTypeLabel ?? row.typeLabel,
    typeCode: TYPE_CODES[objectType],
    title: enriched.primaryLabel,
    metaLine,
    dateLabel: row.dueLabel ?? row.timeLabel,
    actionLabel: row.actionLabel?.trim() || "Öffnen",
    assigneeInitials: assignee.initials,
    assigneeColor: assignee.color,
    commentCount: 0,
    priority: task?.priority === "important" ? "important" : "normal",
    taskId: task?.id ?? null,
    isGhost: row.isGhost,
  };
}

function mapDoneTaskToCard(
  task: MyTask,
  membersById: Map<string, AssignableMember>
): RelayKanbanCard {
  const assignee = assigneeForRow(
    {
      id: task.id,
      href: `/my-tasks/${task.id}`,
      primaryLabel: task.title,
      context: "",
      timeLabel: "",
      actionLabel: "",
      statusLabel: "Erledigt",
      typeLabel: "Aufgabe",
      groupLabel: "",
      fromLabel: "",
      toLabel: "",
      dueLabel: task.due_date
        ? new Date(`${task.due_date}T12:00:00`).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "short",
          })
        : null,
      kind: "task",
    },
    task,
    membersById
  );

  const doneAt = task.done_at
    ? new Date(task.done_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
    : null;

  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    typeLabel: task.submission_id ? "Patientenanfrage" : "Teamaufgabe",
    typeCode: task.submission_id ? "P" : "T",
    title: task.title,
    metaLine: "Erledigt",
    dateLabel: doneAt,
    actionLabel: "Öffnen",
    assigneeInitials: assignee.initials,
    assigneeColor: assignee.color,
    commentCount: 0,
    priority: task.priority === "important" ? "important" : "normal",
    taskId: task.id,
  };
}

export function buildRelayKanbanBoard(input: {
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  journalDrafts: JournalEntry[];
  assignableMembers: AssignableMember[];
  submissionDraftStatus: Record<string, MessageDraftListStatus>;
  isDoctor: boolean;
  userId: string;
  scope: RelayTaskScopeTab;
  searchQuery?: string;
}): Record<RelayKanbanColumnId, RelayKanbanCard[]> {
  const membersById = new Map(input.assignableMembers.map((m) => [m.user_id, m]));
  const snapshot = buildRelayPracticeSnapshot({
    open: input.columns.open,
    pending: input.columns.pending,
    members: input.assignableMembers,
    draftBySubmissionId: input.submissionDraftStatus,
    conversations: [],
    journalDrafts: input.journalDrafts,
    isDoctor: input.isDoctor,
    userId: input.userId,
    basePath: "/relay",
  });

  const board: Record<RelayKanbanColumnId, RelayKanbanCard[]> = {
    decision: [],
    in_progress: [],
    done: [],
  };

  const q = input.searchQuery?.trim().toLowerCase() ?? "";

  for (const row of collectSnapshotRows(snapshot)) {
    const task = row.kind === "task" ? findTask(input.columns, row.id) : undefined;
    const journal = row.kind === "journal" ? findJournal(input.journalDrafts, row.id) : undefined;
    const draftStatus = task?.submission_id
      ? input.submissionDraftStatus[task.submission_id] ?? "none"
      : "none";

    if (!matchesScope(row, task, input.scope, input.userId, input.isDoctor)) continue;

    const card = rowToKanbanCard(row, task, membersById, journal, draftStatus);
    if (
      q &&
      !`${card.title} ${card.typeLabel} ${card.metaLine}`.toLowerCase().includes(q)
    ) {
      continue;
    }

    const column = columnForRow(row, task, input.columns);
    board[column].push(card);
  }

  for (const task of input.columns.done) {
    if (
      !matchesScope(
        {
          id: task.id,
          href: `/my-tasks/${task.id}`,
          primaryLabel: task.title,
          context: "",
          timeLabel: "",
          actionLabel: "",
          statusLabel: "Erledigt",
          typeLabel: "Aufgabe",
          groupLabel: "",
          fromLabel: "",
          toLabel: "",
          dueLabel: null,
          kind: "task",
        },
        task,
        input.scope,
        input.userId,
        input.isDoctor
      )
    ) {
      continue;
    }
    const card = mapDoneTaskToCard(task, membersById);
    if (
      q &&
      !`${card.title} ${card.typeLabel} ${card.metaLine}`.toLowerCase().includes(q)
    ) {
      continue;
    }
    board.done.push(card);
  }

  for (const colId of ["decision", "in_progress", "done"] as RelayKanbanColumnId[]) {
    board[colId] = bundleJournalDecisionCards(board[colId]);
  }

  return enrichKanbanWithExamples(board);
}

const MAX_JOURNAL_DECISION_CARDS = 1;

function bundleJournalDecisionCards(cards: RelayKanbanCard[]): RelayKanbanCard[] {
  const journals = cards.filter((c) => c.typeCode === "J" && !c.isGhost);
  if (journals.length <= MAX_JOURNAL_DECISION_CARDS) return cards;
  const rest = cards.filter((c) => c.typeCode !== "J" || c.isGhost);
  const bundle: RelayKanbanCard = {
    id: "journal-drafts-bundle",
    href: journals[0]!.href,
    typeLabel: "Care Center",
    typeCode: "J",
    title: `${journals.length} Entwürfe zur Freigabe`,
    metaLine: "Journal · gebündelt — Care Center öffnen",
    dateLabel: journals[0]!.dateLabel,
    actionLabel: "Öffnen",
    assigneeInitials: journals[0]!.assigneeInitials,
    assigneeColor: journals[0]!.assigneeColor,
    commentCount: 0,
    priority: "normal",
  };
  return [...rest, bundle];
}

function enrichKanbanWithExamples(
  board: Record<RelayKanbanColumnId, RelayKanbanCard[]>
): Record<RelayKanbanColumnId, RelayKanbanCard[]> {
  const next: Record<RelayKanbanColumnId, RelayKanbanCard[]> = {
    decision: [...board.decision],
    in_progress: [...board.in_progress],
    done: [...board.done],
  };

  const liveTotal =
    next.decision.filter((c) => !c.isGhost).length +
    next.in_progress.filter((c) => !c.isGhost).length +
    next.done.filter((c) => !c.isGhost).length;

  const journalHeavy =
    next.decision.filter((c) => c.typeCode === "J" && !c.isGhost).length > 0 &&
    next.in_progress.filter((c) => !c.isGhost).length === 0;

  for (const column of RELAY_KANBAN_COLUMNS) {
    const live = next[column.id].filter((c) => !c.isGhost);
    const shouldAdd =
      live.length === 0 ||
      (journalHeavy && column.id !== "decision") ||
      (liveTotal < 3 && column.id !== "decision");

    if (!shouldAdd) continue;

    const examples = examplesForKanbanColumn(column.id).filter(
      (ex) => !next[column.id].some((c) => c.id === ex.id)
    );
    const limit = live.length === 0 ? examples.length : Math.min(2, examples.length);
    next[column.id] = [...next[column.id], ...examples.slice(0, limit)];
  }

  return next;
}

export function countRelayTaskScope(
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] },
  journalDrafts: JournalEntry[],
  assignableMembers: AssignableMember[],
  submissionDraftStatus: Record<string, MessageDraftListStatus>,
  isDoctor: boolean,
  userId: string
): Record<RelayTaskScopeTab, number> {
  const counts: Record<RelayTaskScopeTab, number> = { all: 0, mine: 0, delegated: 0 };
  for (const tab of RELAY_TASK_SCOPE_TABS) {
    const board = buildRelayKanbanBoard({
      columns,
      journalDrafts,
      assignableMembers,
      submissionDraftStatus,
      isDoctor,
      userId,
      scope: tab.id,
    });
    counts[tab.id] = Object.values(board).reduce((sum, col) => sum + col.length, 0);
  }
  return counts;
}

function conversationSenderName(c: RelayConversationRow): string {
  if (c.kind === "group" && c.title) return c.title;
  if (c.other_party_email) {
    const local = c.other_party_email.split("@")[0] ?? c.other_party_email;
    const part = local.split(/[._-]/)[0];
    if (part) return part.charAt(0).toUpperCase() + part.slice(1);
  }
  return "Team";
}

function conversationAreaLabel(c: RelayConversationRow): { label: string; tone: "blue" | "green" | "neutral" } {
  if (c.task_id) return { label: "Teamaufgabe", tone: "blue" };
  if (c.submission_id) return { label: "Patientenanfrage", tone: "blue" };
  if (c.kind === "group") return { label: "Team", tone: "green" };
  return { label: "Dokumente", tone: "neutral" };
}

export function buildRelayTeamInboxRows(
  conversations: RelayConversationRow[],
  tab: RelayMessageInboxTab,
  searchQuery?: string
): RelayTeamInboxRow[] {
  const q = searchQuery?.trim().toLowerCase() ?? "";
  let rows = [...conversations].sort((a, b) => {
    const ta = a.last_message_at ?? a.updated_at;
    const tb = b.last_message_at ?? b.updated_at;
    return tb.localeCompare(ta);
  });

  if (tab === "unread") {
    rows = rows.filter((c) => c.unread_count > 0);
  } else if (tab === "mentions") {
    rows = rows.filter((c) => c.last_message_preview?.includes("@"));
  }

  if (q) {
    rows = rows.filter((c) => {
      const hay = `${conversationSenderName(c)} ${c.last_message_preview ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  return rows.slice(0, 8).map((c) => {
    const sender = conversationSenderName(c);
    const area = conversationAreaLabel(c);
    const email = c.other_party_email ?? c.member_emails[0] ?? sender;
    return {
      id: c.id,
      href: `/relay?conversation=${c.id}`,
      senderName: sender,
      senderInitials: initialsFromEmail(email),
      senderColor: colorForKey(c.id),
      preview: c.last_message_preview?.trim() || "Interne Praxis-Kommunikation",
      areaLabel: area.label,
      areaTone: area.tone,
      timeLabel: formatRelayMessageTimestamp(c.last_message_at ?? c.updated_at),
      unread: c.unread_count > 0,
    };
  });
}

export function countRelayMessageInboxTabs(
  conversations: RelayConversationRow[]
): Record<RelayMessageInboxTab, number> {
  return {
    unread: conversations.filter((c) => c.unread_count > 0).length,
    all: conversations.length,
    mentions: conversations.filter((c) => c.last_message_preview?.includes("@")).length,
  };
}

export function relayDecisionCount(
  columns: { open: MyTask[]; pending: MyTask[] },
  journalDrafts: JournalEntry[],
  isDoctor: boolean
): number {
  let count = columns.pending.length;
  if (isDoctor) {
    count += journalDrafts.length;
    count += columns.open.filter(
      (t) => t.recipient_type === "doctor_only" || t.status === "pending_review"
    ).length;
  }
  return count;
}
