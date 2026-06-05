import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { getContentTypeLabel, inferContentType } from "@/lib/journal/content-categories";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { assigneeLabelForTask } from "@/lib/relay/build-relay-snapshot";
import { buildSubmissionEnrichmentMap } from "@/lib/relay/build-relay-ops-snapshot";
import { isRelayHandoffTask } from "@/lib/relay/build-relay-v3-snapshot";
import {
  formatRelayRelativeTime,
  inferTrackerRecommendation,
  isWaitingOnDoctorTask,
  resolveRelayOpsStatus,
  taskLastActivityAt,
  type RelayTaskEnrichment,
} from "@/lib/relay/relay-ops-status";
import { relayCategoryLabel, resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";
import { recurrenceBadgeLabel } from "@/lib/tasks/recurrence";

export type RelayWorkRowKind = "task" | "journal" | "message";

export type RelayWorkRow = {
  id: string;
  href: string;
  primaryLabel: string;
  context: string;
  timeLabel: string;
  actionLabel: string;
  statusLabel: string;
  kind: RelayWorkRowKind;
  isGhost?: boolean;
  isCritical?: boolean;
};

export type RelayPracticeSection = "attention" | "teamwork" | "handovers" | "practice";

export type RelayPracticeSnapshot = {
  summaryLine: string | null;
  attention: RelayWorkRow[];
  teamwork: RelayWorkRow[];
  handovers: RelayWorkRow[];
  practiceTasks: RelayWorkRow[];
  ghostAttention: RelayWorkRow[];
  ghostTeamwork: RelayWorkRow[];
  ghostHandovers: RelayWorkRow[];
  ghostPractice: RelayWorkRow[];
  hasAnyWork: boolean;
};

function isAssignedToUser(task: MyTask, userId: string): boolean {
  return task.assignee_ids.includes(userId) || task.specific_recipient_id === userId;
}

function taskVisible(task: MyTask, isDoctor: boolean, enrichment?: RelayTaskEnrichment): boolean {
  if (isDoctor) return true;
  if (task.recipient_type === "doctor_only" || task.status === "pending_review") return false;
  if (resolveRelayTaskCategory(task) === "clinical_decision") return false;
  if (isWaitingOnDoctorTask(task, enrichment)) return false;
  return true;
}

function inferTaskAction(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): string {
  if (task.status === "pending_review" && isDoctor) return "Freigeben";
  if (task.recipient_type === "doctor_only" && isDoctor) return "Entscheiden";
  const draftStatus = enrichment?.messageDraftStatus ?? "none";
  if (draftStatus === "draft" || draftStatus === "approved") return "Freigeben";
  const category = resolveRelayTaskCategory(task);
  if (category === "clinical_decision") return "Entscheiden";
  if (category === "recall") return "Freigeben";
  return "Bearbeiten";
}

function taskContextLine(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  enrichment?: RelayTaskEnrichment
): string {
  const category = relayCategoryLabel(task);
  const assignee = assigneeLabelForTask(task, membersById);
  const meta = resolveRelayOpsStatus(task, enrichment);
  const parts = [category, assignee !== "—" ? assignee : null, meta.label].filter(Boolean);
  return parts.join(" · ");
}

function inferStatusLabel(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): string {
  if (task.status === "pending_review") return "Freigabe erforderlich";
  if (task.recipient_type === "doctor_only" && isDoctor) return "Entscheidung erforderlich";
  const meta = resolveRelayOpsStatus(task, enrichment);
  if (meta.status === "overdue") return "Überfällig";
  if (task.due_date) {
    const key = task.due_date.slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    if (key === today) return "Fällig heute";
    if (key < today) return "Überfällig";
    const due = new Date(`${key}T12:00:00`);
    const diff = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
    if (diff <= 7) return `Fällig in ${diff} Tagen`;
  }
  if (meta.label === "Wartet auf Arzt") return "Wartet auf Arzt";
  if (meta.label === "Wartet auf Praxis") return "Wartet auf Praxis";
  if (meta.status === "waiting_practice") return "Wartet auf Team";
  return "Wartet auf Sie";
}

function mapTaskRow(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): RelayWorkRow {
  const meta = resolveRelayOpsStatus(task, enrichment);
  const waitingAt = task.submitted_for_review_at ?? taskLastActivityAt(task);
  const recommendation = task.submission_id
    ? inferTrackerRecommendation(task.title, task.description)
    : null;

  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    primaryLabel: task.title,
    context: recommendation ?? taskContextLine(task, membersById, enrichment),
    timeLabel: formatRelayRelativeTime(waitingAt),
    actionLabel: inferTaskAction(task, enrichment, isDoctor),
    statusLabel: inferStatusLabel(task, enrichment, isDoctor),
    kind: "task",
    isCritical: meta.isCritical,
  };
}

function mapJournalRow(entry: JournalEntry): RelayWorkRow {
  const contentType = inferContentType(entry);
  const typeLabel = getContentTypeLabel(contentType);
  const title = entry.title?.trim() || "Ohne Titel";

  let primaryLabel: string;
  if (contentType === "faq") {
    primaryLabel = `${title} wartet auf Freigabe`;
  } else if (contentType === "nachsorge") {
    primaryLabel = `Nachsorgevorlage „${title}" geändert`;
  } else {
    primaryLabel = `${typeLabel}: ${title}`;
  }

  return {
    id: `journal-${entry.id}`,
    href: `/journal/${entry.id}/edit`,
    primaryLabel,
    context: `Entwurf · ${typeLabel}`,
    timeLabel: formatRelayRelativeTime(entry.updated_at),
    actionLabel: contentType === "faq" ? "Freigeben" : "Prüfen",
    statusLabel: "Freigabe erforderlich",
    kind: "journal",
  };
}

function conversationTitle(c: RelayConversationRow): string {
  if (c.kind === "group" && c.title) return c.title;
  if (c.last_message_preview?.trim()) {
    const preview = c.last_message_preview.trim();
    return preview.length > 72 ? `${preview.slice(0, 69)}…` : preview;
  }
  if (c.other_party_email) return c.other_party_email.split("@")[0] ?? "Übergabe";
  return "Interne Übergabe";
}

function mapConversationRow(c: RelayConversationRow, basePath: "/relay" | "/my-tasks"): RelayWorkRow {
  const from =
    c.other_party_email?.split("@")[0] ??
    (c.member_emails.length > 1 ? c.member_emails[0]?.split("@")[0] : "Team");
  const preview = c.last_message_preview?.trim() ?? "Praxisübergabe";

  return {
    id: `msg-${c.id}`,
    href: `${basePath}?tab=nachrichten&conversation=${c.id}`,
    primaryLabel: conversationTitle(c),
    context: `${from ?? "Team"} → Team · ${preview.length > 48 ? `${preview.slice(0, 45)}…` : preview}`,
    timeLabel: c.last_message_at ? formatRelayRelativeTime(c.last_message_at) : "",
    actionLabel: c.unread_count > 0 ? "Antworten" : "Öffnen",
    statusLabel: c.unread_count > 0 ? "Ungelesen" : "Übergabe",
    kind: "message",
    isCritical: c.unread_count > 0,
  };
}

function classifyTask(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean,
  userId: string
): RelayPracticeSection | null {
  if (!taskVisible(task, isDoctor, enrichment)) return null;

  const meta = resolveRelayOpsStatus(task, enrichment);
  const assignedToMe = isAssignedToUser(task, userId);
  const handoff = isRelayHandoffTask(task, enrichment);
  const isInternal = !task.submission_id;
  const isRoutine = task.recurrence_type !== "once";

  if (task.status === "pending_review" && isDoctor) return "attention";
  if (task.recipient_type === "doctor_only" && isDoctor && task.status === "open") return "attention";
  if (isWaitingOnDoctorTask(task, enrichment) && isDoctor) return "attention";
  if (assignedToMe && (task.priority === "important" || task.status === "pending_review")) {
    return "attention";
  }

  if (handoff && task.status !== "pending_review") return "handovers";

  if (isInternal || isRoutine) return "practice";

  if (
    meta.status === "waiting_practice" ||
    meta.label === "Wartet auf Praxis" ||
    (!assignedToMe && task.status === "open")
  ) {
    return "teamwork";
  }

  if (assignedToMe && task.status === "open") return "attention";

  if (task.submission_id) return "teamwork";

  return "practice";
}

function taskPriorityScore(task: MyTask, enrichment?: RelayTaskEnrichment): number {
  const meta = resolveRelayOpsStatus(task, enrichment);
  let score = 0;
  if (task.status === "pending_review") score += 100;
  if (meta.isCritical) score += 50;
  if (task.due_date && task.due_date.slice(0, 10) < new Date().toISOString().slice(0, 10)) score += 40;
  return score;
}

function mapPracticeTaskRow(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): RelayWorkRow {
  const base = mapTaskRow(task, membersById, enrichment, isDoctor);
  const rhythm = recurrenceBadgeLabel(task.recurrence_type);
  const due = task.due_date
    ? new Date(`${task.due_date.slice(0, 10)}T12:00:00`).toLocaleDateString("de-DE", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null;

  const parts = [
    relayCategoryLabel(task),
    rhythm && task.recurrence_type !== "once" ? rhythm : null,
    due ? `fällig ${due}` : null,
    assigneeLabelForTask(task, membersById),
  ].filter(Boolean);

  return {
    ...base,
    context: parts.join(" · "),
    actionLabel: task.recurrence_type !== "once" ? "Öffnen" : base.actionLabel,
    statusLabel: inferStatusLabel(task, enrichment, isDoctor),
  };
}

const GHOST_ATTENTION: RelayWorkRow[] = [
  {
    id: "ghost-faq",
    href: "/journal/new",
    primaryLabel: "FAQ Implantologie wartet auf Freigabe",
    context: "Entwurf · ZFA Maria · vor 2 Tagen",
    timeLabel: "",
    actionLabel: "Freigeben",
    statusLabel: "Freigabe erforderlich",
    kind: "journal",
    isGhost: true,
  },
  {
    id: "ghost-recall",
    href: "/my-tasks/new",
    primaryLabel: "Recall-Serie Q2 — 12 Patienten bestätigen",
    context: "Ärztliche Entscheidung · ZMP · vor 5 Tagen",
    timeLabel: "",
    actionLabel: "Entscheiden",
    statusLabel: "Entscheidung erforderlich",
    kind: "task",
    isGhost: true,
  },
];

const GHOST_TEAMWORK: RelayWorkRow[] = [
  {
    id: "ghost-reception",
    href: "/my-tasks/new",
    primaryLabel: "Empfang wartet auf Rückmeldung",
    context: "Patientenkontakt · Offen · ZFA Anna",
    timeLabel: "",
    actionLabel: "Bearbeiten",
    statusLabel: "Wartet auf Sie",
    kind: "task",
    isGhost: true,
  },
];

const GHOST_HANDOVERS: RelayWorkRow[] = [
  {
    id: "ghost-callback",
    href: "/my-tasks/new",
    primaryLabel: "Patient ruft morgen zurück",
    context: "Rezeption → Team · Bitte Rückruf 09:00 notieren",
    timeLabel: "",
    actionLabel: "Öffnen",
    statusLabel: "Übergabe",
    kind: "message",
    isGhost: true,
  },
];

const GHOST_PRACTICE: RelayWorkRow[] = [
  {
    id: "ghost-routine",
    href: "/my-tasks/new",
    primaryLabel: "Hygiene-Checkliste prüfen",
    context: "QM · Wöchentlich · ZFA · nächste: Mo.",
    timeLabel: "",
    actionLabel: "Öffnen",
    statusLabel: "Fällig heute",
    kind: "task",
    isGhost: true,
  },
  {
    id: "ghost-meeting",
    href: "/my-tasks/new",
    primaryLabel: "Mitarbeitergespräch vorbereiten",
    context: "Praxisorganisation · fällig Fr. · einmalig",
    timeLabel: "",
    actionLabel: "Öffnen",
    statusLabel: "Fällig in 3 Tagen",
    kind: "task",
    isGhost: true,
  },
];

function buildSummaryLine(counts: {
  attention: number;
  teamwork: number;
  handovers: number;
  practice: number;
}): string | null {
  const parts: string[] = [];
  if (counts.attention > 0) {
    parts.push(
      counts.attention === 1 ? "1 Freigabe" : `${counts.attention} Freigaben`
    );
  }
  if (counts.teamwork > 0) {
    parts.push(
      counts.teamwork === 1 ? "1 Teamaufgabe" : `${counts.teamwork} Teamaufgaben`
    );
  }
  if (counts.handovers > 0) {
    parts.push(
      counts.handovers === 1 ? "1 Übergabe" : `${counts.handovers} Übergaben`
    );
  }
  if (counts.practice > 0) {
    parts.push(
      counts.practice === 1 ? "1 Praxisaufgabe" : `${counts.practice} Praxisaufgaben`
    );
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function buildRelayPracticeSnapshot(input: {
  open: MyTask[];
  pending: MyTask[];
  members: AssignableMember[];
  draftBySubmissionId: Record<string, MessageDraftListStatus>;
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  isDoctor: boolean;
  userId: string;
  basePath: "/relay" | "/my-tasks";
}): RelayPracticeSnapshot {
  const enrichments = buildSubmissionEnrichmentMap(input.draftBySubmissionId);
  const membersById = new Map(input.members.map((m) => [m.user_id, m]));
  const active = [...input.open, ...input.pending];

  const attention: RelayWorkRow[] = [];
  const teamwork: RelayWorkRow[] = [];
  const handovers: RelayWorkRow[] = [];
  const practiceTasks: RelayWorkRow[] = [];

  if (input.isDoctor) {
    for (const entry of input.journalDrafts) {
      attention.push(mapJournalRow(entry));
    }
  }

  const sorted = [...active].sort((a, b) => {
    const ea = a.submission_id ? enrichments.get(a.submission_id) : undefined;
    const eb = b.submission_id ? enrichments.get(b.submission_id) : undefined;
    return taskPriorityScore(b, eb) - taskPriorityScore(a, ea);
  });

  const seenTaskIds = new Set<string>();

  for (const task of sorted) {
    const enrichment = task.submission_id ? enrichments.get(task.submission_id) : undefined;
    const section = classifyTask(task, enrichment, input.isDoctor, input.userId);
    if (!section || seenTaskIds.has(task.id)) continue;
    seenTaskIds.add(task.id);

    const row =
      section === "practice"
        ? mapPracticeTaskRow(task, membersById, enrichment, input.isDoctor)
        : mapTaskRow(task, membersById, enrichment, input.isDoctor);

    if (section === "attention") attention.push(row);
    else if (section === "teamwork") teamwork.push(row);
    else if (section === "handovers") handovers.push(row);
    else practiceTasks.push(row);
  }

  for (const conversation of input.conversations) {
    handovers.push(mapConversationRow(conversation, input.basePath));
  }

  handovers.sort((a, b) => {
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    return 0;
  });

  const counts = {
    attention: attention.length,
    teamwork: teamwork.length,
    handovers: handovers.length,
    practice: practiceTasks.length,
  };

  const hasAnyWork = Object.values(counts).some((n) => n > 0);

  return {
    summaryLine: buildSummaryLine(counts),
    attention,
    teamwork,
    handovers,
    practiceTasks,
    ghostAttention: GHOST_ATTENTION,
    ghostTeamwork: GHOST_TEAMWORK,
    ghostHandovers: GHOST_HANDOVERS,
    ghostPractice: GHOST_PRACTICE,
    hasAnyWork,
  };
}
