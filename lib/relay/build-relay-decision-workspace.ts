import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayPracticeSnapshot,
  type RelayPracticeSection,
  type RelayPracticeSnapshot,
  type RelayWorkRow,
} from "@/lib/relay/build-relay-practice-snapshot";
import { inferTrackerRecommendation, taskLastActivityAt } from "@/lib/relay/relay-ops-status";
import { resolveRelayWorkDecisions } from "@/lib/relay/relay-work-decisions";
import {
  resolveRelayWorkObjectType,
  type RelayWorkObjectType,
} from "@/lib/relay/relay-work-object";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type RelayDecisionBucket = "freigabe" | "rueckfrage" | "entscheidung";

export type RelayDecisionWorkspaceSummary = {
  total: number;
};

export type RelayDecisionFocus = {
  rowId: string;
  headline: string;
  situation: string;
  clinicalBody: string | null;
  outcome: string | null;
  position: number;
  total: number;
};

export type RelayDecisionAction = {
  id: string;
  label: string;
  href?: string;
  variant: "primary" | "outline";
};

export type RelayDecisionAfterItem = {
  id: string;
  title: string;
};

export type RelayDecisionWorkspaceModel = {
  allClear: boolean;
  summary: RelayDecisionWorkspaceSummary;
  focus: RelayDecisionFocus | null;
  actions: RelayDecisionAction[];
  after: RelayDecisionAfterItem[];
  useTaskFlow: boolean;
  taskId: string | null;
  taskStatus: MyTask["status"] | null;
  doctorSelfTask: boolean;
  isMyTask: boolean;
};

type RowContext = {
  row: RelayWorkRow;
  section: RelayPracticeSection;
  task?: MyTask;
  journal?: JournalEntry;
  conversation?: RelayConversationRow;
  messageDraftStatus: MessageDraftListStatus;
  objectType: RelayWorkObjectType;
  bucket: RelayDecisionBucket;
  priority: number;
  waitingAt: string;
};

function findTask(columns: { open: MyTask[]; pending: MyTask[] }, id: string): MyTask | undefined {
  return [...columns.open, ...columns.pending].find((t) => t.id === id);
}

function findJournal(journalDrafts: JournalEntry[], rowId: string): JournalEntry | undefined {
  const journalId = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  if (!journalId) return undefined;
  return journalDrafts.find((j) => j.id === journalId);
}

function findConversation(
  conversations: RelayConversationRow[],
  rowId: string
): RelayConversationRow | undefined {
  const msgId = rowId.startsWith("msg-") ? rowId.slice("msg-".length) : null;
  if (!msgId) return undefined;
  return conversations.find((c) => c.id === msgId);
}

function classifyBucket(objectType: RelayWorkObjectType, task?: MyTask): RelayDecisionBucket {
  if (objectType === "journal_freigabe" || objectType === "patientenantwort") return "freigabe";
  if (task?.status === "pending_review") return "freigabe";
  if (objectType === "patientenanfrage" || objectType === "uebergabe") return "rueckfrage";
  return "entscheidung";
}

function priorityScore(objectType: RelayWorkObjectType, task?: MyTask): number {
  if (objectType === "journal_freigabe") return 100;
  if (objectType === "patientenantwort") return 95;
  if (task?.status === "pending_review") return 90;
  if (objectType === "entscheidung") return 85;
  if (objectType === "patientenanfrage") return 80;
  if (objectType === "uebergabe") return 75;
  return 50;
}

function waitingIso(row: RelayWorkRow, task?: MyTask, journal?: JournalEntry): string {
  if (task) return task.submitted_for_review_at ?? taskLastActivityAt(task);
  if (journal?.updated_at) return journal.updated_at;
  if (journal?.created_at) return journal.created_at;
  return row.timeLabel;
}

function waitingDays(iso: string): number | null {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - then.getTime()) / 86_400_000));
}

function waitingSuffix(days: number | null): string {
  if (days === null || days === 0) return "";
  if (days === 1) return " — wartet seit gestern";
  return ` — wartet seit ${days} Tagen`;
}

function journalPreview(journal: JournalEntry): string {
  if (journal.excerpt?.trim()) return journal.excerpt.trim();
  const md = journal.content_markdown?.trim();
  if (!md) return "Der Entwurf enthält noch keinen sichtbaren Text.";
  const plain = md
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= 320) return plain;
  return `${plain.slice(0, 320).trimEnd()}…`;
}

function taskPreview(task: MyTask): string {
  const text = task.description?.trim() || task.title?.trim();
  if (!text) return "";
  if (text.length <= 320) return text;
  return `${text.slice(0, 320).trimEnd()}…`;
}

function buildClinicalFocus(ctx: RowContext, position: number, total: number): RelayDecisionFocus {
  const { row, task, journal, conversation, objectType, waitingAt } = ctx;
  const days = waitingDays(waitingAt);
  const wait = waitingSuffix(days);
  const from = row.fromLabel?.trim() || "Das Team";
  const patient = task?.submission_patient_name?.trim() || null;

  let headline = row.primaryLabel;
  let situation = "";
  let outcome: string | null = null;
  let clinicalBody: string | null = null;

  if (journal) {
    const title = journal.title?.trim() || "Ohne Titel";
    headline = title;
    situation = `${from} hat den Artikel „${title}“ zur Veröffentlichung eingereicht${wait}.`;
    outcome = "Nach Ihrer Freigabe erscheint der Beitrag automatisch im Journal.";
    clinicalBody = journalPreview(journal);
  } else if (objectType === "patientenantwort" && task) {
    const concern =
      inferTrackerRecommendation(task.title, task.description) ??
      task.description?.trim().split("\n")[0]?.trim() ??
      null;
    headline = patient ? `Antwort an ${patient}` : "Patientenantwort freigeben";
    situation = patient
      ? `${from} hat eine Antwort an ${patient} vorbereitet${wait}.`
      : `${from} hat eine Patientenantwort vorbereitet${wait}.`;
    outcome = "Das Team kann die Antwort danach direkt versenden.";
    clinicalBody = taskPreview(task) || concern;
  } else if (objectType === "patientenanfrage" && task) {
    const concern =
      inferTrackerRecommendation(task.title, task.description) ??
      task.description?.trim().split("\n")[0]?.trim() ??
      task.title;
    headline = patient || row.primaryLabel;
    situation = patient
      ? `${patient} wartet auf Ihre Einordnung${wait}: ${concern}`
      : `${from} benötigt Ihre Einordnung zu einem Patientenfall${wait}.`;
    outcome = "Das Team kann den Fall danach ohne Rückfrage weiterführen.";
    clinicalBody = concern !== headline ? concern : taskPreview(task) || null;
  } else if (task?.status === "pending_review") {
    headline = task.title;
    const patientBit = patient ? ` (${patient})` : "";
    situation = `${from} hat „${task.title}“${patientBit} zur Freigabe eingereicht${wait}.`;
    outcome = "Das Team übernimmt die Umsetzung nach Ihrer Freigabe.";
    clinicalBody = taskPreview(task) || null;
  } else if (objectType === "entscheidung" && task) {
    const concern =
      inferTrackerRecommendation(task.title, task.description) ??
      task.description?.trim().split("\n")[0]?.trim() ??
      task.title;
    headline = patient || task.title;
    situation = patient
      ? `${from} benötigt Ihre Entscheidung zu ${patient}${wait}.`
      : `${from} benötigt Ihre ärztliche Entscheidung${wait}.`;
    outcome = "Das Team setzt den nächsten Schritt danach um.";
    clinicalBody = concern;
  } else if (conversation && row.kind === "message") {
    const preview = conversation.last_message_preview?.trim() || row.concernLine || row.primaryLabel;
    headline = row.primaryLabel;
    situation = `${from}: ${preview}${wait}`;
    clinicalBody = null;
    outcome = null;
  } else if (task) {
    headline = patient || task.title;
    situation = `${from}: ${task.description?.trim() || task.title}${wait}`;
    clinicalBody = taskPreview(task) || null;
    outcome = null;
  } else {
    headline = row.primaryLabel;
    situation = `${row.concernLine || row.context || row.primaryLabel}${wait}`;
    clinicalBody = row.concernLine || null;
    outcome = null;
  }

  return {
    rowId: row.id,
    headline,
    situation: situation.trim(),
    clinicalBody: clinicalBody?.trim() || null,
    outcome,
    position,
    total,
  };
}

function collectDecisionRows(
  snapshot: RelayPracticeSnapshot,
  columns: { open: MyTask[]; pending: MyTask[] },
  journalDrafts: JournalEntry[],
  conversations: RelayConversationRow[],
  submissionDraftStatus: Record<string, MessageDraftListStatus>
): RowContext[] {
  const out: RowContext[] = [];
  const seen = new Set<string>();

  for (const row of snapshot.attention.filter((r) => !r.isGhost)) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);

    const task = row.kind === "task" ? findTask(columns, row.id) : undefined;
    const journal = row.kind === "journal" ? findJournal(journalDrafts, row.id) : undefined;
    const conversation =
      row.kind === "message" ? findConversation(conversations, row.id) : undefined;
    const messageDraftStatus = task?.submission_id
      ? submissionDraftStatus[task.submission_id] ?? "none"
      : "none";
    const objectType = resolveRelayWorkObjectType(row, { task, journal, messageDraftStatus });

    out.push({
      row,
      section: "attention",
      task,
      journal,
      conversation,
      messageDraftStatus,
      objectType,
      bucket: classifyBucket(objectType, task),
      priority: priorityScore(objectType, task),
      waitingAt: waitingIso(row, task, journal),
    });
  }

  return out.sort((a, b) => {
    const dayA = waitingDays(a.waitingAt) ?? 0;
    const dayB = waitingDays(b.waitingAt) ?? 0;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return dayB - dayA;
  });
}

function buildSummary(rows: RowContext[]): RelayDecisionWorkspaceSummary {
  return { total: rows.length };
}

function buildActions(
  ctx: RowContext,
  isDoctor: boolean,
  userId: string
): {
  actions: RelayDecisionAction[];
  useTaskFlow: boolean;
  taskId: string | null;
  taskStatus: MyTask["status"] | null;
  doctorSelfTask: boolean;
  isMyTask: boolean;
} {
  const { row, task, journal, conversation, messageDraftStatus } = ctx;
  const doctorSelfTask = Boolean(isDoctor && task?.created_by === userId);
  const myTask = Boolean(
    task && (task.assignee_ids.includes(userId) || task.specific_recipient_id === userId)
  );
  const objectType = resolveRelayWorkObjectType(row, { task, journal, messageDraftStatus });
  const useTaskFlow = Boolean(
    task &&
      task.status !== "done" &&
      (objectType === "entscheidung" ||
        objectType === "teamaufgabe" ||
        (task.status === "pending_review" && isDoctor))
  );

  const decisions = resolveRelayWorkDecisions(row, {
    task,
    journal,
    conversation,
    messageDraftStatus,
  })
    .slice(0, 2)
    .map((d) => ({
      id: d.id,
      label: d.label,
      href: d.href,
      variant: d.variant,
    }));

  return {
    actions: decisions,
    useTaskFlow,
    taskId: task?.id ?? null,
    taskStatus: task?.status ?? null,
    doctorSelfTask,
    isMyTask: myTask,
  };
}

export function buildRelayDecisionWorkspace(input: {
  columns: { open: MyTask[]; pending: MyTask[] };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus: Record<string, MessageDraftListStatus>;
  isDoctor: boolean;
  userId: string;
  focusRowId: string | null;
}): RelayDecisionWorkspaceModel {
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

  const queue = collectDecisionRows(
    snapshot,
    input.columns,
    input.journalDrafts,
    input.conversations,
    input.submissionDraftStatus
  );

  const summary = buildSummary(queue);
  const allClear = queue.length === 0;

  if (allClear) {
    return {
      allClear: true,
      summary,
      focus: null,
      actions: [],
      after: [],
      useTaskFlow: false,
      taskId: null,
      taskStatus: null,
      doctorSelfTask: false,
      isMyTask: false,
    };
  }

  const activeCtx = queue.find((c) => c.row.id === input.focusRowId) ?? queue[0]!;
  const activeIndex = queue.findIndex((c) => c.row.id === activeCtx.row.id);
  const focus = buildClinicalFocus(activeCtx, activeIndex + 1, queue.length);
  const actionMeta = buildActions(activeCtx, input.isDoctor, input.userId);

  const after = queue
    .filter((c) => c.row.id !== activeCtx.row.id)
    .slice(0, 3)
    .map((c) => ({
      id: c.row.id,
      title: c.row.primaryLabel,
    }));

  return {
    allClear: false,
    summary,
    focus,
    actions: actionMeta.actions,
    after,
    useTaskFlow: actionMeta.useTaskFlow,
    taskId: actionMeta.taskId,
    taskStatus: actionMeta.taskStatus,
    doctorSelfTask: actionMeta.doctorSelfTask,
    isMyTask: actionMeta.isMyTask,
  };
}
