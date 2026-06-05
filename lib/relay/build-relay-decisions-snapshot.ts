import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";
import { assigneeLabelForTask } from "@/lib/relay/build-relay-snapshot";
import { buildSubmissionEnrichmentMap } from "@/lib/relay/build-relay-ops-snapshot";
import {
  formatRelayRelativeTime,
  inferTrackerRecommendation,
  isWaitingOnDoctorTask,
  resolveRelayOpsStatus,
  taskLastActivityAt,
  type RelayTaskEnrichment,
} from "@/lib/relay/relay-ops-status";
import { relayCategoryLabel, resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";

export type RelayDecisionBucket = "patient_waiting" | "team_waiting" | "approvals" | "overdue";

export type RelayDecisionRow = {
  id: string;
  href: string;
  primaryLabel: string;
  context: string;
  waitingLabel: string;
  actionLabel: string;
  bucket: RelayDecisionBucket;
};

export type RelayDecisionsTodaySummary = {
  areaCount: number;
  patientWaiting: number;
  teamWaiting: number;
  approvals: number;
  overdue: number;
  intro: string | null;
  lines: string[];
};

export type RelayDecisionsSnapshot = {
  summary: RelayDecisionsTodaySummary;
  patientWaiting: RelayDecisionRow[];
  teamWaiting: RelayDecisionRow[];
  approvals: RelayDecisionRow[];
  overdue: RelayDecisionRow[];
};

function isOverdueTask(task: MyTask): boolean {
  if (!task.due_date || task.status === "done") return false;
  return task.due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

function formatWaitingSince(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "Wartet";
  const diffMs = Date.now() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return "Gerade eingegangen";
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return diffH === 1 ? "Wartet seit 1 Stunde" : `Wartet seit ${diffH} Stunden`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Wartet seit gestern";
  if (diffD < 7) return `Wartet seit ${diffD} Tagen`;
  return `Wartet seit ${then.toLocaleDateString("de-DE", { day: "numeric", month: "short" })}`;
}

function taskContext(task: MyTask, enrichment?: RelayTaskEnrichment): string {
  const recommendation = task.submission_id
    ? inferTrackerRecommendation(task.title, task.description)
    : null;
  if (recommendation) return recommendation;
  const category = resolveRelayTaskCategory(task);
  if (category === "clinical_decision") return "Ärztliche Entscheidung";
  if (category === "recall") return "Recall-Freigabe";
  if (category === "aftercare") return "Nachsorge";
  const draftStatus = enrichment?.messageDraftStatus ?? "none";
  if (draftStatus === "draft") return "Patientenantwort";
  if (draftStatus === "approved") return "Versand ausstehend";
  return relayCategoryLabel(task);
}

function inferActionLabel(
  task: MyTask,
  bucket: RelayDecisionBucket,
  enrichment?: RelayTaskEnrichment
): string {
  if (bucket === "approvals" || task.status === "pending_review") return "Freigeben";
  const draftStatus = enrichment?.messageDraftStatus ?? "none";
  if (draftStatus === "draft" || draftStatus === "approved") return "Freigeben";
  const category = resolveRelayTaskCategory(task);
  if (category === "clinical_decision" || task.recipient_type === "doctor_only") return "Entscheiden";
  if (category === "recall") return "Freigeben";
  if (bucket === "overdue") return "Bearbeiten";
  return "Öffnen";
}

function taskVisibleForDecisions(
  task: MyTask,
  isDoctor: boolean,
  enrichment?: RelayTaskEnrichment
): boolean {
  if (isDoctor) return true;
  if (task.recipient_type === "doctor_only" || task.status === "pending_review") return false;
  if (resolveRelayTaskCategory(task) === "clinical_decision") return false;
  if (isWaitingOnDoctorTask(task, enrichment)) return false;
  return true;
}

function resolveDecisionBucket(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): RelayDecisionBucket | null {
  if (task.status === "done") return null;
  if (!taskVisibleForDecisions(task, isDoctor, enrichment)) return null;

  const meta = resolveRelayOpsStatus(task, enrichment);
  const patientLinked = Boolean(task.submission_id);
  const draftStatus = enrichment?.messageDraftStatus ?? "none";
  const category = resolveRelayTaskCategory(task);

  if (isOverdueTask(task) || meta.status === "overdue") return "overdue";

  if (task.status === "pending_review") return "approvals";
  if (patientLinked && draftStatus === "draft") return "approvals";
  if (/freigabe|freigeben|journal|nachrichtenvorlage/i.test(task.title)) return "approvals";
  if (category === "recall" && task.status === "open") return "approvals";

  if (isWaitingOnDoctorTask(task, enrichment)) return "team_waiting";
  if (task.recipient_type === "doctor_only" && task.status === "open") return "team_waiting";
  if (meta.label === "Wartet auf Arzt") return "team_waiting";

  if (patientLinked && draftStatus === "approved") return "patient_waiting";
  if (patientLinked && meta.label === "Wartet auf Praxis") return "patient_waiting";
  if (patientLinked && (meta.status === "new" || meta.status === "in_progress")) {
    return "patient_waiting";
  }

  if (meta.isCritical) return patientLinked ? "patient_waiting" : "team_waiting";

  return null;
}

function mapDecisionRow(
  task: MyTask,
  bucket: RelayDecisionBucket,
  membersById: Map<string, AssignableMember>,
  enrichment?: RelayTaskEnrichment
): RelayDecisionRow {
  const patient = task.submission_patient_name?.trim() || null;
  const waitingAt = task.submitted_for_review_at ?? taskLastActivityAt(task);
  const context = taskContext(task, enrichment);

  let primaryLabel: string;
  if (bucket === "patient_waiting" || (bucket === "approvals" && patient)) {
    primaryLabel = patient ?? task.title;
  } else if (bucket === "team_waiting") {
    primaryLabel = assigneeLabelForTask(task, membersById);
  } else if (bucket === "overdue") {
    primaryLabel = patient ?? assigneeLabelForTask(task, membersById);
  } else {
    primaryLabel = patient ?? task.title;
  }

  return {
    id: task.id,
    href: `/my-tasks/${task.id}`,
    primaryLabel,
    context,
    waitingLabel: formatWaitingSince(waitingAt),
    actionLabel: inferActionLabel(task, bucket, enrichment),
    bucket,
  };
}

function taskPriorityScore(task: MyTask, isCritical: boolean): number {
  let score = 0;
  if (task.status === "pending_review") score += 100;
  if (isCritical) score += 50;
  if (isOverdueTask(task)) score += 40;
  return score;
}

function buildSummaryLines(summary: Omit<RelayDecisionsTodaySummary, "intro" | "lines" | "areaCount">): string[] {
  const lines: string[] = [];
  if (summary.patientWaiting > 0) {
    lines.push(
      summary.patientWaiting === 1
        ? "1 Patient wartet auf Rückmeldung."
        : `${summary.patientWaiting} Patienten warten auf Rückmeldung.`
    );
  }
  if (summary.teamWaiting > 0) {
    lines.push(
      summary.teamWaiting === 1
        ? "1 Teamentscheidung ist offen."
        : `${summary.teamWaiting} Teamentscheidungen sind offen.`
    );
  }
  if (summary.approvals > 0) {
    lines.push(
      summary.approvals === 1
        ? "1 Freigabe steht aus."
        : `${summary.approvals} Freigaben stehen aus.`
    );
  }
  if (summary.overdue > 0) {
    lines.push(
      summary.overdue === 1
        ? "1 Vorgang ist überfällig."
        : `${summary.overdue} Vorgänge sind überfällig.`
    );
  }
  return lines;
}

export function buildRelayDecisionsSnapshot(input: {
  open: MyTask[];
  pending: MyTask[];
  members: AssignableMember[];
  draftBySubmissionId: Record<string, MessageDraftListStatus>;
  isDoctor: boolean;
}): RelayDecisionsSnapshot {
  const enrichments = buildSubmissionEnrichmentMap(input.draftBySubmissionId);
  const membersById = new Map(input.members.map((m) => [m.user_id, m]));
  const active = [...input.open, ...input.pending];

  const buckets: Record<RelayDecisionBucket, RelayDecisionRow[]> = {
    patient_waiting: [],
    team_waiting: [],
    approvals: [],
    overdue: [],
  };

  const sorted = [...active].sort((a, b) => {
    const ea = a.submission_id ? enrichments.get(a.submission_id) : undefined;
    const eb = b.submission_id ? enrichments.get(b.submission_id) : undefined;
    const sa = resolveRelayOpsStatus(a, ea);
    const sb = resolveRelayOpsStatus(b, eb);
    return taskPriorityScore(b, sb.isCritical) - taskPriorityScore(a, sa.isCritical);
  });

  for (const task of sorted) {
    const enrichment = task.submission_id ? enrichments.get(task.submission_id) : undefined;
    const bucket = resolveDecisionBucket(task, enrichment, input.isDoctor);
    if (!bucket) continue;
    buckets[bucket].push(mapDecisionRow(task, bucket, membersById, enrichment));
  }

  const counts = {
    patientWaiting: buckets.patient_waiting.length,
    teamWaiting: buckets.team_waiting.length,
    approvals: buckets.approvals.length,
    overdue: buckets.overdue.length,
  };

  const areaCount = [
    counts.patientWaiting,
    counts.teamWaiting,
    counts.approvals,
    counts.overdue,
  ].filter((n) => n > 0).length;

  const lines = buildSummaryLines(counts);

  const intro =
    areaCount === 0
      ? null
      : areaCount === 1
        ? "Heute benötigt Ihre Praxis Aufmerksamkeit in 1 Bereich."
        : `Heute benötigt Ihre Praxis Aufmerksamkeit in ${areaCount} Bereichen.`;

  return {
    summary: {
      ...counts,
      areaCount,
      intro,
      lines,
    },
    patientWaiting: buckets.patient_waiting,
    teamWaiting: buckets.team_waiting,
    approvals: buckets.approvals,
    overdue: buckets.overdue,
  };
}
