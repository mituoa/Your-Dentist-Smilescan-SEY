import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import { recurrenceBadgeLabel } from "@/lib/tasks/recurrence";
import { formatTaskCompletionLine } from "@/lib/tasks/format-task-completion";

export type RelayTodayStats = {
  openTasks: number;
  pendingReview: number;
  unreadHandoffs: number;
};

export type RelayKpiStats = {
  openTasks: number;
  newHandoffs: number;
  pendingApprovals: number;
  routinesToday: number;
};

export type RelayAssistSummary = {
  taskCount: number;
  handoffCount: number;
  approvalCount: number;
};

export type RelayTeamDetailRow = RelayTeamRow & {
  readSummary: string;
  overdueCount: number;
};

export type RelayTaskListItem = {
  id: string;
  href: string;
  title: string;
  patientLabel: string | null;
  assigneeLabel: string;
  dueLabel: string | null;
  statusLabel: string;
  completionLine: string | null;
  isDone: boolean;
};

export type RelayPriorityTask = {
  id: string;
  title: string;
  patientLabel: string | null;
  assigneeLabel: string;
  dueLabel: string | null;
  statusLabel: string;
  href: string;
};

export type RelayTeamRow = {
  key: string;
  label: string;
  hint: string | null;
  count: number;
};

export type RelayRoutineRow = {
  id: string;
  title: string;
  rhythmLabel: string;
  nextLabel: string | null;
  href: string;
};

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const token = local.split(/[._-]/)[0] ?? local;
  if (!token) return "Team";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

export function assigneeLabelForTask(
  task: MyTask,
  membersById: Map<string, AssignableMember>
): string {
  if (task.recipient_type === "all_team") return "Gesamtes Team";
  if (task.assignee_ids.length > 0) {
    const first = membersById.get(task.assignee_ids[0]!);
    if (first) return displayNameFromEmail(first.email);
    if (task.assignee_ids.length > 1) return `${task.assignee_ids.length} Personen`;
  }
  if (task.specific_recipient_id) {
    const m = membersById.get(task.specific_recipient_id);
    if (m) return displayNameFromEmail(m.email);
  }
  if (task.recipient_type === "doctor_only") return "Arzt";
  return "Praxis";
}

function dueLabel(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const d = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const key = dueDate.slice(0, 10);
  if (key === todayKey) return "Heute fällig";
  if (key < todayKey) return "Überfällig";
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function taskPriorityScore(task: MyTask): number {
  let score = 0;
  if (task.status === "pending_review") score += 100;
  if (task.priority === "important") score += 40;
  if (task.due_date) {
    const key = task.due_date.slice(0, 10);
    const todayKey = new Date().toISOString().slice(0, 10);
    if (key <= todayKey) score += 30;
  }
  if (task.status === "open") score += 10;
  return score;
}

function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function isOverdue(task: MyTask): boolean {
  if (!task.due_date || task.status === "done") return false;
  return task.due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

function taskStatusLabel(task: MyTask): string {
  if (task.status === "done") return "Erledigt";
  if (task.status === "pending_review") return "Freigabe ausstehend";
  if (task.priority === "important") return "Wichtig";
  return "Offen";
}

export function buildRelayKpiStats(
  open: MyTask[],
  pending: MyTask[],
  conversations: RelayConversationRow[]
): RelayKpiStats {
  const unreadHandoffs = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const routinesToday = open.filter(
    (t) => t.recurrence_type !== "once" && (isDueToday(t.due_date) || isOverdue(t))
  ).length;

  return {
    openTasks: open.length + pending.length,
    newHandoffs: unreadHandoffs,
    pendingApprovals: pending.length,
    routinesToday,
  };
}

export function buildRelayAssistSummary(
  open: MyTask[],
  pending: MyTask[],
  conversations: RelayConversationRow[]
): RelayAssistSummary {
  const unreadHandoffs = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  return {
    taskCount: open.length,
    handoffCount: unreadHandoffs,
    approvalCount: pending.length,
  };
}

export function buildRelayTodayStats(
  open: MyTask[],
  pending: MyTask[],
  conversations: RelayConversationRow[]
): RelayTodayStats {
  const kpis = buildRelayKpiStats(open, pending, conversations);
  return {
    openTasks: kpis.openTasks,
    pendingReview: kpis.pendingApprovals,
    unreadHandoffs: kpis.newHandoffs,
  };
}

export function buildRelayPriorityTasks(
  open: MyTask[],
  pending: MyTask[],
  members: AssignableMember[],
  limit = 5
): RelayPriorityTask[] {
  const membersById = new Map(members.map((m) => [m.user_id, m]));
  const active = [...open, ...pending].sort(
    (a, b) => taskPriorityScore(b) - taskPriorityScore(a)
  );

  return active.slice(0, limit).map((task) => {
    const patientLabel = task.submission_patient_name?.trim() || null;
    let statusLabel = "Offen";
    if (task.status === "pending_review") statusLabel = "Freigabe ausstehend";
    else if (task.priority === "important") statusLabel = "Wichtig";

    return {
      id: task.id,
      title: task.title,
      patientLabel,
      assigneeLabel: assigneeLabelForTask(task, membersById),
      dueLabel: dueLabel(task.due_date),
      statusLabel,
      href: `/my-tasks/${task.id}`,
    };
  });
}

function teamBucketForTask(
  task: MyTask,
  membersById: Map<string, AssignableMember>,
  isDoctor: boolean
): { key: string; label: string; hint: string | null } {
  if (task.status === "pending_review" && isDoctor) {
    return { key: "freigabe", label: "Freigabe", hint: "Arzt" };
  }
  if (task.recipient_type === "all_team") {
    return { key: "team-all", label: "Praxis-Team", hint: null };
  }
  if (task.recipient_type === "doctor_only") {
    return { key: "arzt", label: "Arzt", hint: null };
  }
  const assigneeId = task.assignee_ids[0] ?? task.specific_recipient_id;
  if (assigneeId) {
    const member = membersById.get(assigneeId);
    if (member) {
      const name = displayNameFromEmail(member.email);
      const hint = member.role === "doctor" ? "Arzt" : "Assistenz";
      return { key: `member-${assigneeId}`, label: name, hint };
    }
  }
  const fallback = assigneeLabelForTask(task, membersById);
  return { key: `label-${fallback}`, label: fallback, hint: "Assistenz" };
}

function readSummaryForTasks(tasks: MyTask[]): string {
  if (tasks.length === 0) return "—";
  const read = tasks.filter(
    (t) => t.delivery_status === "read" || t.receipt_summary.read > 0
  ).length;
  if (read === 0) return "noch ungelesen";
  if (read >= tasks.length) return "alle gelesen";
  return `${read} gelesen`;
}

export function buildRelayTeamOverview(
  open: MyTask[],
  pending: MyTask[],
  members: AssignableMember[],
  isDoctor: boolean
): RelayTeamRow[] {
  return buildRelayTeamDetail(open, pending, members, isDoctor).map(
    ({ key, label, hint, count }) => ({ key, label, hint, count })
  );
}

export function buildRelayTeamDetail(
  open: MyTask[],
  pending: MyTask[],
  members: AssignableMember[],
  isDoctor: boolean
): RelayTeamDetailRow[] {
  const buckets = new Map<
    string,
    { label: string; hint: string | null; tasks: MyTask[] }
  >();
  const membersById = new Map(members.map((m) => [m.user_id, m]));

  for (const task of [...open, ...pending]) {
    const bucket = teamBucketForTask(task, membersById, isDoctor);
    const prev = buckets.get(bucket.key);
    if (prev) {
      prev.tasks.push(task);
    } else {
      buckets.set(bucket.key, {
        label: bucket.label,
        hint: bucket.hint,
        tasks: [task],
      });
    }
  }

  return [...buckets.entries()]
    .map(([key, row]) => ({
      key,
      label: row.label,
      hint: row.hint,
      count: row.tasks.length,
      readSummary: readSummaryForTasks(row.tasks),
      overdueCount: row.tasks.filter(isOverdue).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function buildRelayTaskList(
  open: MyTask[],
  pending: MyTask[],
  done: MyTask[],
  members: AssignableMember[],
  doneLimit = 12
): RelayTaskListItem[] {
  const membersById = new Map(members.map((m) => [m.user_id, m]));
  const active = [...open, ...pending].sort(
    (a, b) => taskPriorityScore(b) - taskPriorityScore(a)
  );
  const recentDone = [...done]
    .sort((a, b) => {
      const at = b.done_at ? new Date(b.done_at).getTime() : 0;
      const bt = a.done_at ? new Date(a.done_at).getTime() : 0;
      return at - bt;
    })
    .slice(0, doneLimit);

  const mapTask = (task: MyTask, isDone: boolean): RelayTaskListItem => ({
    id: task.id,
    href: `/my-tasks/${task.id}`,
    title: task.title,
    patientLabel: task.submission_patient_name?.trim() || null,
    assigneeLabel: assigneeLabelForTask(task, membersById),
    dueLabel: dueLabel(task.due_date),
    statusLabel: taskStatusLabel(task),
    completionLine: isDone ? formatRelayDoneLine(task) : null,
    isDone,
  });

  return [...active.map((t) => mapTask(t, false)), ...recentDone.map((t) => mapTask(t, true))];
}

export function buildRelayPracticeRoutines(open: MyTask[]): RelayRoutineRow[] {
  return open
    .filter((t) => t.recurrence_type !== "once")
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      title: task.title,
      rhythmLabel: recurrenceBadgeLabel(task.recurrence_type) ?? "Wiederkehrend",
      nextLabel: dueLabel(task.due_date),
      href: `/my-tasks/${task.id}`,
    }));
}

export function formatRelayDoneLine(task: MyTask): string | null {
  return formatTaskCompletionLine({
    doneAt: task.done_at,
    doneByEmail: task.done_by_email,
  });
}
