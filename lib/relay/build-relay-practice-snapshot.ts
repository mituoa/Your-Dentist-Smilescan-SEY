import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { getContentTypeLabel, inferContentType } from "@/lib/journal/content-categories";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { assigneeLabelForTask } from "@/lib/relay/build-relay-snapshot";
import { buildSubmissionEnrichmentMap } from "@/lib/relay/build-relay-ops-snapshot";
import { isRelayHandoffTask } from "@/lib/relay/build-relay-v3-snapshot";
import { recurrenceBadgeLabel } from "@/lib/tasks/recurrence";
import {
  formatRelayRelativeTime,
  inferTrackerRecommendation,
  isWaitingOnDoctorTask,
  isWaitingOnPatientTask,
  resolveRelayOpsStatus,
  taskLastActivityAt,
  type RelayTaskEnrichment,
} from "@/lib/relay/relay-ops-status";
import { relayCategoryLabel, resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";
import { enrichRelayWorkRowDisplay } from "@/lib/relay/relay-work-object";

export type RelayWorkRowKind = "task" | "journal" | "message";

export type RelayWorkRow = {
  id: string;
  href: string;
  primaryLabel: string;
  context: string;
  timeLabel: string;
  actionLabel: string;
  statusLabel: string;
  typeLabel: string;
  groupLabel: string;
  fromLabel: string;
  toLabel: string;
  dueLabel: string | null;
  kind: RelayWorkRowKind;
  /** V8 — Arbeitstyp für Liste (JOURNAL-FREIGABE …). */
  workTypeLabel?: string;
  /** V8 — Kurzbeschreibung / Anliegen. */
  concernLine?: string;
  /** V8 — z. B. „wartet seit 23 Std.“ */
  waitingLabel?: string;
  isGhost?: boolean;
  isCritical?: boolean;
};

export type RelayWorkspaceArea = "eingang" | "team" | "nachrichten";

export type RelayPracticeSection =
  | "attention"
  | "practice"
  | "teamwork"
  | "patient_waiting"
  | "routines";

export type RelayPracticeSnapshot = {
  summaryLine: string | null;
  attention: RelayWorkRow[];
  teamwork: RelayWorkRow[];
  patientWaiting: RelayWorkRow[];
  routines: RelayWorkRow[];
  practiceTasks: RelayWorkRow[];
  ghostAttention: RelayWorkRow[];
  ghostTeamwork: RelayWorkRow[];
  ghostPatientWaiting: RelayWorkRow[];
  ghostRoutines: RelayWorkRow[];
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

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const token = local.split(/[._-]/)[0] ?? local;
  if (!token) return "Praxis";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function creatorLabelForTask(
  task: MyTask,
  membersById: Map<string, AssignableMember>
): string {
  const member = membersById.get(task.created_by);
  if (member) return displayNameFromEmail(member.email);
  return "Praxis";
}

function dueLabelForTask(task: MyTask): string | null {
  if (!task.due_date) return null;
  const key = task.due_date.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  if (key === today) return "Heute";
  if (key < today) return "Überfällig";
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
}

function taskTypeLabel(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined
): string {
  if (task.recurrence_type !== "once") return "Routine";
  if (isRelayHandoffTask(task, enrichment)) return "Übergabe";
  return "Aufgabe";
}

function taskGroupLabel(
  task: MyTask,
  membersById: Map<string, AssignableMember>
): string {
  const assignee = assigneeLabelForTask(task, membersById);
  if (assignee !== "—") return assignee;
  return relayCategoryLabel(task);
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
    typeLabel: taskTypeLabel(task, enrichment),
    groupLabel: taskGroupLabel(task, membersById),
    fromLabel: creatorLabelForTask(task, membersById),
    toLabel: taskGroupLabel(task, membersById),
    dueLabel: dueLabelForTask(task),
    kind: "task",
    isCritical: meta.isCritical,
  };
}

function mapJournalRow(entry: JournalEntry): RelayWorkRow {
  const contentType = inferContentType(entry);
  const typeLabel = getContentTypeLabel(contentType);
  const title = entry.title?.trim() || "Ohne Titel";

  return {
    id: `journal-${entry.id}`,
    href: `/journal/${entry.id}/edit`,
    primaryLabel: title,
    context: typeLabel,
    timeLabel: formatRelayRelativeTime(entry.updated_at),
    actionLabel: "Freigeben",
    statusLabel: "Freigabe erforderlich",
    typeLabel,
    groupLabel: "Journal",
    fromLabel: "ZFA Maria",
    toLabel: "Arzt",
    dueLabel: null,
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

function mapConversationRow(
  c: RelayConversationRow,
  basePath: "/relay" | "/my-tasks",
  section: RelayPracticeSection
): RelayWorkRow {
  const from =
    c.other_party_email?.split("@")[0] ??
    (c.member_emails.length > 1 ? c.member_emails[0]?.split("@")[0] : "Team");
  const preview = c.last_message_preview?.trim() ?? "Praxisübergabe";
  const bereich = section === "patient_waiting" ? "patient-wartet" : "team";

  return {
    id: `msg-${c.id}`,
    href: `${basePath}?bereich=${bereich}&item=msg-${c.id}`,
    primaryLabel: conversationTitle(c),
    context: preview.length > 48 ? `${preview.slice(0, 45)}…` : preview,
    timeLabel: c.last_message_at ? formatRelayRelativeTime(c.last_message_at) : "",
    actionLabel: c.unread_count > 0 ? "Antworten" : "Öffnen",
    statusLabel: c.unread_count > 0 ? "Ungelesen" : "Übergabe",
    typeLabel: "Übergabe",
    groupLabel: from ?? "Team",
    fromLabel: from ?? "Team",
    toLabel: "Praxis",
    dueLabel: c.unread_count > 0 ? "Neu" : null,
    kind: "message",
    isCritical: c.unread_count > 0,
  };
}

function needsDoctorAttention(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): boolean {
  if (!isDoctor) return false;
  const draftStatus = enrichment?.messageDraftStatus ?? "none";
  if (task.status === "pending_review") return true;
  if (task.submission_id && draftStatus === "draft") return true;
  if (task.recipient_type === "doctor_only" && task.status === "open") return true;
  if (isWaitingOnDoctorTask(task, enrichment)) return true;
  if (resolveRelayTaskCategory(task) === "clinical_decision" && task.status === "open") return true;
  return false;
}

function isPatientWaitingWork(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): boolean {
  if (!task.submission_id || task.status === "done") return false;
  if (needsDoctorAttention(task, enrichment, isDoctor)) return false;

  const meta = resolveRelayOpsStatus(task, enrichment);
  const draftStatus = enrichment?.messageDraftStatus ?? "none";

  if (draftStatus === "approved") return true;
  if (meta.label === "Wartet auf Praxis") return true;
  if (meta.status === "new" || meta.status === "in_progress") return true;
  if (meta.isCritical && task.submission_patient_name) return true;
  if (isWaitingOnPatientTask(task, enrichment)) return false;

  return Boolean(task.submission_patient_name);
}

function classifyTask(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean,
  userId: string
): RelayPracticeSection | null {
  if (!taskVisible(task, isDoctor, enrichment)) return null;
  if (task.status === "done") return null;

  if (task.recurrence_type !== "once") return "routines";

  if (needsDoctorAttention(task, enrichment, isDoctor)) return "attention";

  if (isPatientWaitingWork(task, enrichment, isDoctor)) return "patient_waiting";

  const meta = resolveRelayOpsStatus(task, enrichment);
  const assignedToMe = isAssignedToUser(task, userId);
  const handoff = isRelayHandoffTask(task, enrichment);

  if (handoff) return "teamwork";
  if (meta.status === "waiting_practice" || meta.label === "Wartet auf Praxis") return "teamwork";
  if (!assignedToMe && task.status === "open") return "teamwork";

  if (assignedToMe && task.status === "open") return "practice";

  return "practice";
}

function classifyConversation(c: RelayConversationRow): RelayPracticeSection {
  if (c.submission_id) return "patient_waiting";
  return "teamwork";
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
    timeLabel: "vor 2 T.",
    actionLabel: "Freigeben",
    statusLabel: "Offen",
    typeLabel: "Freigabe",
    groupLabel: "Journal",
    fromLabel: "ZFA Maria",
    toLabel: "Arzt",
    dueLabel: null,
    kind: "journal",
    isGhost: true,
  },
  {
    id: "ghost-recall",
    href: "/my-tasks/new",
    primaryLabel: "Recall-Serie Q2 — 12 Patienten bestätigen",
    context: "Ärztliche Entscheidung · ZMP · vor 5 Tagen",
    timeLabel: "vor 5 T.",
    actionLabel: "Entscheiden",
    statusLabel: "Offen",
    typeLabel: "Aufgabe",
    groupLabel: "Prophylaxe",
    fromLabel: "ZMP",
    toLabel: "Arzt",
    dueLabel: "Freitag",
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
    timeLabel: "Heute",
    actionLabel: "Bearbeiten",
    statusLabel: "Offen",
    typeLabel: "Übergabe",
    groupLabel: "Empfang",
    fromLabel: "Empfang",
    toLabel: "Arzt",
    dueLabel: "Heute",
    kind: "task",
    isGhost: true,
  },
];

const GHOST_PATIENT_WAITING: RelayWorkRow[] = [
  {
    id: "ghost-patient",
    href: "/inbox",
    primaryLabel: "Berk Baysal",
    context: "Schwellung nach OP",
    timeLabel: "vor 3 Std.",
    actionLabel: "Antwort senden",
    statusLabel: "Patient wartet",
    typeLabel: "Patientenanfrage",
    groupLabel: "Tracker",
    fromLabel: "Patient",
    toLabel: "Praxis",
    dueLabel: null,
    kind: "task",
    isGhost: true,
  },
];

const GHOST_ROUTINES: RelayWorkRow[] = [
  {
    id: "ghost-routine",
    href: "/my-tasks/new",
    primaryLabel: "Recall-Liste prüfen",
    context: "Wöchentlich",
    timeLabel: "Mo.",
    actionLabel: "Öffnen",
    statusLabel: "Offen",
    typeLabel: "Routine",
    groupLabel: "Prophylaxe",
    fromLabel: "Praxisleitung",
    toLabel: "Empfang",
    dueLabel: "Montag",
    kind: "task",
    isGhost: true,
  },
];

const GHOST_PRACTICE: RelayWorkRow[] = [
  {
    id: "ghost-routine",
    href: "/my-tasks/new",
    primaryLabel: "Hygiene-Checkliste prüfen",
    context: "QM · Wöchentlich · ZFA · nächste: Mo.",
    timeLabel: "Mo.",
    actionLabel: "Öffnen",
    statusLabel: "Offen",
    typeLabel: "Routine",
    groupLabel: "Verwaltung",
    fromLabel: "Praxisleitung",
    toLabel: "Verwaltung",
    dueLabel: "Montag",
    kind: "task",
    isGhost: true,
  },
  {
    id: "ghost-meeting",
    href: "/my-tasks/new",
    primaryLabel: "Mitarbeitergespräch vorbereiten",
    context: "Praxisorganisation · fällig Fr. · einmalig",
    timeLabel: "Fr.",
    actionLabel: "Öffnen",
    statusLabel: "Offen",
    typeLabel: "Aufgabe",
    groupLabel: "Praxisleitung",
    fromLabel: "Praxisleitung",
    toLabel: "Arzt",
    dueLabel: "Freitag",
    kind: "task",
    isGhost: true,
  },
];

function buildSummaryLine(counts: {
  attention: number;
  teamwork: number;
  patientWaiting: number;
  routines: number;
  practice: number;
}): string | null {
  const parts: string[] = [];
  if (counts.attention > 0) {
    parts.push(
      counts.attention === 1 ? "1 Entscheidung offen" : `${counts.attention} Entscheidungen offen`
    );
  }
  if (counts.patientWaiting > 0) {
    parts.push(
      counts.patientWaiting === 1
        ? "1 Patient wartet"
        : `${counts.patientWaiting} Patienten warten`
    );
  }
  if (counts.teamwork > 0) {
    parts.push(
      counts.teamwork === 1 ? "1 Team-Blockade" : `${counts.teamwork} Team-Blockaden`
    );
  }
  if (counts.practice > 0) {
    parts.push(
      counts.practice === 1 ? "1 Aufgabe zu erledigen" : `${counts.practice} Aufgaben zu erledigen`
    );
  }
  if (counts.routines > 0) {
    parts.push(counts.routines === 1 ? "1 Routine offen" : `${counts.routines} Routinen offen`);
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
  const patientWaiting: RelayWorkRow[] = [];
  const routines: RelayWorkRow[] = [];
  const practiceTasks: RelayWorkRow[] = [];

  if (input.isDoctor) {
    for (const entry of input.journalDrafts) {
      const row = enrichRelayWorkRowDisplay(mapJournalRow(entry), { journal: entry });
      attention.push(row);
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

    const draftStatus = task.submission_id
      ? input.draftBySubmissionId[task.submission_id]
      : undefined;

    const baseRow =
      section === "practice" || section === "routines"
        ? mapPracticeTaskRow(task, membersById, enrichment, input.isDoctor)
        : mapTaskRow(task, membersById, enrichment, input.isDoctor);

    const row = enrichRelayWorkRowDisplay(baseRow, {
      task,
      messageDraftStatus: draftStatus,
    });

    if (section === "attention") attention.push(row);
    else if (section === "teamwork") teamwork.push(row);
    else if (section === "patient_waiting") patientWaiting.push(row);
    else if (section === "routines") routines.push(row);
    else practiceTasks.push(row);
  }

  for (const conversation of input.conversations) {
    const section = classifyConversation(conversation);
    const row = enrichRelayWorkRowDisplay(
      mapConversationRow(conversation, input.basePath, section)
    );
    if (section === "patient_waiting") patientWaiting.push(row);
    else teamwork.push(row);
  }

  const sortCritical = (a: RelayWorkRow, b: RelayWorkRow) => {
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    return 0;
  };

  teamwork.sort(sortCritical);
  patientWaiting.sort(sortCritical);

  const counts = {
    attention: attention.length,
    teamwork: teamwork.length,
    patientWaiting: patientWaiting.length,
    routines: routines.length,
    practice: practiceTasks.length,
  };

  const hasAnyWork = Object.values(counts).some((n) => n > 0);

  return {
    summaryLine: buildSummaryLine(counts),
    attention,
    teamwork,
    patientWaiting,
    routines,
    practiceTasks,
    ghostAttention: GHOST_ATTENTION,
    ghostTeamwork: GHOST_TEAMWORK,
    ghostPatientWaiting: GHOST_PATIENT_WAITING,
    ghostRoutines: GHOST_ROUTINES,
    ghostPractice: GHOST_PRACTICE,
    hasAnyWork,
  };
}

export function parseRelayPracticeSection(param: string | null): RelayPracticeSection {
  if (param === "practice" || param === "eingang" || param === "zu-erledigen") return "practice";
  if (param === "teamwork" || param === "team") return "teamwork";
  if (
    param === "patient_waiting" ||
    param === "patient-wartet" ||
    param === "patient"
  ) {
    return "patient_waiting";
  }
  if (param === "routines" || param === "routine") return "routines";
  if (param === "handovers" || param === "nachrichten") return "teamwork";
  if (param === "attention" || param === "wartet") return "attention";
  return "attention";
}

export function relaySectionRows(
  snapshot: RelayPracticeSnapshot,
  section: RelayPracticeSection
): RelayWorkRow[] {
  switch (section) {
    case "attention":
      return snapshot.attention.filter((r) => !r.isGhost);
    case "practice":
      return snapshot.practiceTasks.filter((r) => !r.isGhost);
    case "teamwork":
      return snapshot.teamwork.filter((r) => !r.isGhost);
    case "patient_waiting":
      return snapshot.patientWaiting.filter((r) => !r.isGhost);
    case "routines":
      return snapshot.routines.filter((r) => !r.isGhost);
  }
}

export function relaySectionCount(
  snapshot: RelayPracticeSnapshot,
  section: RelayPracticeSection
): number {
  return relaySectionRows(snapshot, section).length;
}

export function parseRelayWorkspaceArea(param: string | null): RelayWorkspaceArea {
  if (param === "team" || param === "teamwork") return "team";
  if (param === "nachrichten" || param === "handovers") return "nachrichten";
  return "eingang";
}

function dedupeRows(rows: RelayWorkRow[]): RelayWorkRow[] {
  const seen = new Set<string>();
  const out: RelayWorkRow[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export function relayWorkspaceRows(
  snapshot: RelayPracticeSnapshot,
  area: RelayWorkspaceArea
): RelayWorkRow[] {
  if (area === "eingang") {
    const real = dedupeRows([...snapshot.attention, ...snapshot.practiceTasks]);
    if (real.length > 0) return real;
    return [...snapshot.ghostAttention, ...snapshot.ghostPractice];
  }
  if (area === "team") {
    if (snapshot.teamwork.length > 0) return snapshot.teamwork;
    return snapshot.ghostTeamwork;
  }
  return [];
}

export function relayWorkspaceAreaCount(
  snapshot: RelayPracticeSnapshot,
  area: RelayWorkspaceArea
): number {
  if (area === "eingang") {
    return dedupeRows([...snapshot.attention, ...snapshot.practiceTasks]).filter((r) => !r.isGhost)
      .length;
  }
  if (area === "team") {
    return snapshot.teamwork.filter((r) => !r.isGhost).length;
  }
  return snapshot.patientWaiting.filter((r) => !r.isGhost).length;
}
