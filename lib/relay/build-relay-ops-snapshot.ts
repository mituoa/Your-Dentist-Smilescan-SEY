import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  assigneeLabelForTask,
  formatRelayDoneLine,
} from "@/lib/relay/build-relay-snapshot";
import {
  buildRelayOpsTodayBand,
  formatRelayRelativeTime,
  inferTrackerRecommendation,
  isWaitingOnDoctorTask,
  isWaitingOnPatientTask,
  resolveRelayOpsStatus,
  shortSubmissionRef,
  taskLastActivityAt,
  type RelayOpsStatus,
  type RelayOpsTodayBand,
  type RelayTaskEnrichment,
} from "@/lib/relay/relay-ops-status";

export type RelayOpsWorkRow = {
  id: string;
  href: string;
  title: string;
  descriptionPreview: string | null;
  patientLabel: string | null;
  assigneeLabel: string;
  dueLabel: string | null;
  status: RelayOpsStatus;
  statusLabel: string;
  isCritical: boolean;
  sourceLabel: string | null;
  submissionId: string | null;
  submissionRef: string | null;
  recommendation: string | null;
  lastActivityLabel: string;
  completionLine: string | null;
  isDone: boolean;
};

export type RelayOpsFocusItem = {
  id: string;
  href: string;
  title: string;
  patientLabel: string | null;
  assigneeLabel: string;
  statusLabel: string;
  lastActivityLabel: string;
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

function descriptionPreview(description: string | null, max = 80): string | null {
  if (!description?.trim()) return null;
  const line = description.trim().split("\n")[0]?.trim() ?? "";
  if (!line || line.startsWith("Kontext:")) return null;
  return line.length > max ? `${line.slice(0, max)}…` : line;
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

export function buildSubmissionEnrichmentMap(
  draftBySubmissionId: Record<string, MessageDraftListStatus>
): Map<string, RelayTaskEnrichment> {
  const map = new Map<string, RelayTaskEnrichment>();
  for (const [submissionId, status] of Object.entries(draftBySubmissionId)) {
    map.set(submissionId, { messageDraftStatus: status });
  }
  return map;
}

export function buildRelayOpsToday(
  open: MyTask[],
  pending: MyTask[],
  done: MyTask[],
  enrichments: Map<string, RelayTaskEnrichment>
): RelayOpsTodayBand {
  return buildRelayOpsTodayBand(open, pending, done, enrichments);
}

export function buildRelayOpsWorkList(
  open: MyTask[],
  pending: MyTask[],
  done: MyTask[],
  members: AssignableMember[],
  enrichments: Map<string, RelayTaskEnrichment>,
  doneLimit = 40
): RelayOpsWorkRow[] {
  const membersById = new Map(members.map((m) => [m.user_id, m]));

  const active = [...open, ...pending].sort((a, b) => {
    const ea = enrichments.get(a.submission_id ?? "");
    const eb = enrichments.get(b.submission_id ?? "");
    const sa = resolveRelayOpsStatus(a, ea);
    const sb = resolveRelayOpsStatus(b, eb);
    return taskPriorityScore(b, sb.isCritical) - taskPriorityScore(a, sa.isCritical);
  });

  const recentDone = [...done]
    .sort((a, b) => {
      const at = b.done_at ? new Date(b.done_at).getTime() : 0;
      const bt = a.done_at ? new Date(a.done_at).getTime() : 0;
      return at - bt;
    })
    .slice(0, doneLimit);

  const mapTask = (task: MyTask, isDone: boolean): RelayOpsWorkRow => {
    const enrichment = task.submission_id
      ? enrichments.get(task.submission_id)
      : undefined;
    const meta = resolveRelayOpsStatus(task, enrichment);
    const lastAt = taskLastActivityAt(task);

    return {
      id: task.id,
      href: `/my-tasks/${task.id}`,
      title: task.title,
      descriptionPreview: descriptionPreview(task.description),
      patientLabel: task.submission_patient_name?.trim() || null,
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
      completionLine: isDone ? formatRelayDoneLine(task) : null,
      isDone,
    };
  };

  return [...active.map((t) => mapTask(t, false)), ...recentDone.map((t) => mapTask(t, true))];
}

export function buildRelayOpsFocusList(
  open: MyTask[],
  pending: MyTask[],
  members: AssignableMember[],
  enrichments: Map<string, RelayTaskEnrichment>,
  kind: "patient" | "doctor",
  limit = 8
): RelayOpsFocusItem[] {
  const membersById = new Map(members.map((m) => [m.user_id, m]));
  const active = [...open, ...pending];
  const filtered =
    kind === "patient"
      ? active.filter((t) =>
          isWaitingOnPatientTask(t, t.submission_id ? enrichments.get(t.submission_id) : undefined)
        )
      : active.filter((t) =>
          isWaitingOnDoctorTask(t, t.submission_id ? enrichments.get(t.submission_id) : undefined)
        );

  return filtered.slice(0, limit).map((task) => {
    const enrichment = task.submission_id
      ? enrichments.get(task.submission_id)
      : undefined;
    const meta = resolveRelayOpsStatus(task, enrichment);
    return {
      id: task.id,
      href: `/my-tasks/${task.id}`,
      title: task.title,
      patientLabel: task.submission_patient_name?.trim() || null,
      assigneeLabel: assigneeLabelForTask(task, membersById),
      statusLabel: meta.label,
      lastActivityLabel: formatRelayRelativeTime(taskLastActivityAt(task)),
    };
  });
}
