import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  assigneeLabelForTask,
  formatRelayDoneLine,
} from "@/lib/relay/build-relay-snapshot";
import {
  buildSubmissionEnrichmentMap,
  type RelayOpsWorkRow,
} from "@/lib/relay/build-relay-ops-snapshot";
import {
  formatRelayRelativeTime,
  inferTrackerRecommendation,
  isWaitingOnDoctorTask,
  isWaitingOnPatientTask,
  resolveRelayOpsStatus,
  shortSubmissionRef,
  taskLastActivityAt,
  type RelayTaskEnrichment,
} from "@/lib/relay/relay-ops-status";
import { relayCategoryLabel, resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";
import { recurrenceBadgeLabel } from "@/lib/tasks/recurrence";

export type RelayV3Section = "operations" | "routines" | "handoffs";

export type RelayOperationsBand = {
  openCount: number;
  overdue: number;
  waitingPatient: number;
  waitingTeam: number;
  doneToday: number;
};

export type RelayRoutinesBand = {
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  paused: number;
  doneToday: number;
};

export type RelayHandoffsBand = {
  waitingDoctor: number;
  waitingTeam: number;
  critical: number;
  newCount: number;
  doneToday: number;
};

export type RelayV3OperationsRow = RelayOpsWorkRow & {
  categoryLabel: string;
  referenceLabel: string | null;
};

export type RelayV3RoutineRow = {
  id: string;
  href: string;
  title: string;
  rhythmLabel: string;
  assigneeLabel: string;
  nextDueLabel: string | null;
  lastActivityLabel: string;
  statusLabel: string;
  isCritical: boolean;
  sourceLabel: string | null;
};

export type RelayV3HandoffRow = {
  id: string;
  href: string;
  title: string;
  fromLabel: string;
  toLabel: string;
  reasonLabel: string;
  patientLabel: string | null;
  timeLabel: string;
  statusLabel: string;
  nextStepLabel: string;
  isCritical: boolean;
  kind: "task" | "message";
};

function dueLabelShort(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const key = dueDate.slice(0, 10);
  const todayKey = new Date().toISOString().slice(0, 10);
  if (key === todayKey) return "Heute";
  if (key < todayKey) return "Überfällig";
  const d = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function isOverdue(task: MyTask): boolean {
  if (!task.due_date || task.status === "done") return false;
  return task.due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function isDueThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(`${dueDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return due >= now && due <= end;
}

function isDoneToday(task: MyTask): boolean {
  if (!task.done_at) return false;
  return task.done_at.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function isRecentlyCreated(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 48 * 60 * 60 * 1000;
}

export function isRelayHandoffTask(task: MyTask, enrichment?: RelayTaskEnrichment): boolean {
  if (task.status === "pending_review") return true;
  const meta = resolveRelayOpsStatus(task, enrichment);
  return (
    meta.status === "waiting_patient" ||
    meta.status === "waiting_practice" ||
    meta.label === "Wartet auf Arzt"
  );
}

function taskBucket(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined
): RelayV3Section {
  if (isRelayHandoffTask(task, enrichment)) return "handoffs";
  if (task.recurrence_type !== "once") return "routines";
  return "operations";
}

function taskVisibleForRole(
  task: MyTask,
  section: RelayV3Section,
  isDoctor: boolean,
  enrichment?: RelayTaskEnrichment
): boolean {
  if (isDoctor) return true;

  if (task.recipient_type === "doctor_only" || task.status === "pending_review") {
    return false;
  }

  const category = resolveRelayTaskCategory(task);
  if (category === "clinical_decision") return false;

  if (section === "handoffs" && isWaitingOnDoctorTask(task, enrichment)) {
    return false;
  }

  return true;
}

function taskPriorityScore(task: MyTask, isCritical: boolean): number {
  let score = 0;
  if (task.status === "pending_review") score += 100;
  if (isCritical) score += 50;
  if (task.due_date) {
    const key = task.due_date.slice(0, 10);
    const todayKey = new Date().toISOString().slice(0, 10);
    if (key < todayKey) score += 40;
    else if (key === todayKey) score += 25;
  }
  return score;
}

function mapOperationsRow(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  enrichment?: RelayTaskEnrichment
): RelayV3OperationsRow {
  const meta = resolveRelayOpsStatus(task, enrichment);
  const lastAt = taskLastActivityAt(task);
  const patient = task.submission_patient_name?.trim() || null;

  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    title: task.title,
    descriptionPreview: null,
    patientLabel: patient,
    assigneeLabel: assigneeLabelForTask(task, membersById),
    dueLabel: dueLabelShort(task.due_date),
    status: meta.status,
    statusLabel: meta.label,
    isCritical: meta.isCritical,
    sourceLabel: task.submission_id ? "Tracker" : "Intern",
    submissionId: task.submission_id,
    submissionRef: task.submission_id ? shortSubmissionRef(task.submission_id) : null,
    recommendation: task.submission_id
      ? inferTrackerRecommendation(task.title, task.description)
      : null,
    lastActivityLabel: formatRelayRelativeTime(lastAt),
    completionLine: null,
    isDone: false,
    categoryLabel: relayCategoryLabel(task),
    referenceLabel: patient ?? (task.submission_id ? shortSubmissionRef(task.submission_id) : null),
  };
}

function mapRoutineRow(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  enrichment?: RelayTaskEnrichment
): RelayV3RoutineRow {
  const meta = resolveRelayOpsStatus(task, enrichment);
  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    title: task.title,
    rhythmLabel: recurrenceBadgeLabel(task.recurrence_type) ?? "Wiederkehrend",
    assigneeLabel: assigneeLabelForTask(task, membersById),
    nextDueLabel: dueLabelShort(task.due_date),
    lastActivityLabel: formatRelayRelativeTime(taskLastActivityAt(task)),
    statusLabel: meta.label,
    isCritical: meta.isCritical,
    sourceLabel: task.submission_id ? "Tracker" : "Intern",
  };
}

function mapHandoffRow(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  enrichment?: RelayTaskEnrichment
): RelayV3HandoffRow {
  const meta = resolveRelayOpsStatus(task, enrichment);
  const reason =
    inferTrackerRecommendation(task.title, task.description) ??
    relayCategoryLabel(task);

  let nextStep = "Bearbeiten";
  if (meta.status === "waiting_patient") nextStep = "Patient kontaktieren / Rückmeldung abwarten";
  else if (meta.label === "Wartet auf Arzt") nextStep = "Ärztliche Entscheidung";
  else if (meta.status === "waiting_practice") nextStep = "Team übernimmt";
  else if (task.status === "pending_review") nextStep = "Freigabe prüfen";

  const fromLabel = task.submission_id ? "Tracker" : "Praxis";
  const toLabel =
    meta.label === "Wartet auf Arzt"
      ? "Arzt"
      : meta.status === "waiting_patient"
        ? "Patient"
        : assigneeLabelForTask(task, membersById);

  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    title: task.title,
    fromLabel,
    toLabel,
    reasonLabel: reason,
    patientLabel: task.submission_patient_name?.trim() || null,
    timeLabel: formatRelayRelativeTime(taskLastActivityAt(task)),
    statusLabel: meta.label,
    nextStepLabel: nextStep,
    isCritical: meta.isCritical,
    kind: "task",
  };
}

export function buildRelayV3Snapshot(input: {
  open: MyTask[];
  pending: MyTask[];
  done: MyTask[];
  members: AssignableMember[];
  draftBySubmissionId: Record<string, MessageDraftListStatus>;
  conversations: RelayConversationRow[];
  isDoctor: boolean;
}) {
  const enrichments = buildSubmissionEnrichmentMap(input.draftBySubmissionId);
  const membersById = new Map(input.members.map((m) => [m.user_id, m]));
  const active = [...input.open, ...input.pending];

  const operationsTasks: MyTask[] = [];
  const routinesTasks: MyTask[] = [];
  const handoffTasks: MyTask[] = [];

  for (const task of active) {
    const enrichment = task.submission_id
      ? enrichments.get(task.submission_id)
      : undefined;
    const bucket = taskBucket(task, enrichment);
    if (!taskVisibleForRole(task, bucket, input.isDoctor, enrichment)) continue;

    if (bucket === "operations") operationsTasks.push(task);
    else if (bucket === "routines") routinesTasks.push(task);
    else handoffTasks.push(task);
  }

  const sortActive = (tasks: MyTask[]) =>
    [...tasks].sort((a, b) => {
      const ea = enrichments.get(a.submission_id ?? "");
      const eb = enrichments.get(b.submission_id ?? "");
      const sa = resolveRelayOpsStatus(a, ea);
      const sb = resolveRelayOpsStatus(b, eb);
      return taskPriorityScore(b, sb.isCritical) - taskPriorityScore(a, sa.isCritical);
    });

  const operationsBand: RelayOperationsBand = {
    openCount: operationsTasks.length,
    overdue: operationsTasks.filter(isOverdue).length,
    waitingPatient: 0,
    waitingTeam: 0,
    doneToday: input.done.filter((t) => t.recurrence_type === "once" && isDoneToday(t)).length,
  };

  for (const task of operationsTasks) {
    const enrichment = task.submission_id
      ? enrichments.get(task.submission_id)
      : undefined;
    const meta = resolveRelayOpsStatus(task, enrichment);
    if (meta.status === "waiting_patient") operationsBand.waitingPatient += 1;
    if (meta.status === "waiting_practice") operationsBand.waitingTeam += 1;
  }

  const routinesBand: RelayRoutinesBand = {
    dueToday: routinesTasks.filter((t) => isDueToday(t.due_date)).length,
    dueThisWeek: routinesTasks.filter((t) => isDueThisWeek(t.due_date)).length,
    overdue: routinesTasks.filter(isOverdue).length,
    paused: 0,
    doneToday: input.done.filter((t) => t.recurrence_type !== "once" && isDoneToday(t)).length,
  };

  const handoffsBand: RelayHandoffsBand = {
    waitingDoctor: handoffTasks.filter((t) =>
      isWaitingOnDoctorTask(t, t.submission_id ? enrichments.get(t.submission_id) : undefined)
    ).length,
    waitingTeam: handoffTasks.filter((t) => {
      const meta = resolveRelayOpsStatus(
        t,
        t.submission_id ? enrichments.get(t.submission_id) : undefined
      );
      return meta.status === "waiting_practice" && meta.label !== "Wartet auf Arzt";
    }).length,
    critical: handoffTasks.filter((t) => t.priority === "important").length,
    newCount:
      handoffTasks.filter((t) => isRecentlyCreated(t.created_at)).length +
      input.conversations.filter((c) => c.unread_count > 0).length,
    doneToday: input.done.filter(
      (t) =>
        isDoneToday(t) &&
        (t.submission_id != null || t.recipient_type === "doctor_only" || t.status === "pending_review")
    ).length,
  };

  const operationsRows = sortActive(operationsTasks).map((t) =>
    mapOperationsRow(t, membersById, t.submission_id ? enrichments.get(t.submission_id) : undefined)
  );

  const routineRows = sortActive(routinesTasks).map((t) =>
    mapRoutineRow(t, membersById, t.submission_id ? enrichments.get(t.submission_id) : undefined)
  );

  const handoffRows: RelayV3HandoffRow[] = sortActive(handoffTasks).map((t) =>
    mapHandoffRow(t, membersById, t.submission_id ? enrichments.get(t.submission_id) : undefined)
  );

  return {
    enrichments,
    operations: { band: operationsBand, rows: operationsRows },
    routines: { band: routinesBand, rows: routineRows },
    handoffs: { band: handoffsBand, rows: handoffRows },
  };
}

export { buildSubmissionEnrichmentMap };
