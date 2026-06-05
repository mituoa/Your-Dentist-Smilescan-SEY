import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";
import { assigneeLabelForTask } from "@/lib/relay/build-relay-snapshot";
import { buildSubmissionEnrichmentMap } from "@/lib/relay/build-relay-ops-snapshot";
import {
  inferTrackerRecommendation,
  isWaitingOnDoctorTask,
  resolveRelayOpsStatus,
  taskLastActivityAt,
  type RelayTaskEnrichment,
} from "@/lib/relay/relay-ops-status";
import {
  resolveRelayPracticePersona,
  taskCategoryMatchesPersonaFocus,
  type RelayPracticePersona,
} from "@/lib/relay/relay-practice-persona";
import { relayCategoryLabel, resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";

export type RelayPracticeBucket = "waiting_on_you" | "waiting_on_team" | "overdue";

export type RelayDecisionRow = {
  id: string;
  href: string;
  primaryLabel: string;
  context: string;
  waitingLabel: string;
  actionLabel: string;
  bucket: RelayPracticeBucket;
};

export type RelayAttentionHighlight = {
  id: string;
  label: string;
};

export type RelayDecisionsTodaySummary = {
  allClear: boolean;
  todayLabel: string;
  todayCalmLine: string | null;
};

export type RelayDecisionsSnapshot = {
  persona: RelayPracticePersona;
  summary: RelayDecisionsTodaySummary;
  needsAttention: RelayAttentionHighlight[];
  waitingOnYou: RelayDecisionRow[];
  waitingOnTeam: RelayDecisionRow[];
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

function formatTodayLabel(): string {
  try {
    return new Intl.DateTimeFormat("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
  } catch {
    return "Heute";
  }
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
  bucket: RelayPracticeBucket,
  enrichment?: RelayTaskEnrichment
): string {
  if (task.status === "pending_review") return "Freigeben";
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

type LegacyBucket = "patient_waiting" | "team_waiting" | "approvals" | "overdue";

function resolveLegacyBucket(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean
): LegacyBucket | null {
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

function isAssignedToUser(task: MyTask, userId: string): boolean {
  return task.assignee_ids.includes(userId) || task.specific_recipient_id === userId;
}

function resolvePracticeBucket(
  task: MyTask,
  enrichment: RelayTaskEnrichment | undefined,
  isDoctor: boolean,
  userId: string
): RelayPracticeBucket | null {
  const legacy = resolveLegacyBucket(task, enrichment, isDoctor);
  if (!legacy) {
    if (task.status === "open" && taskVisibleForDecisions(task, isDoctor, enrichment)) {
      return isAssignedToUser(task, userId) ? "waiting_on_you" : "waiting_on_team";
    }
    return null;
  }

  if (legacy === "overdue") return "overdue";

  if (isDoctor) {
    if (legacy === "approvals" || legacy === "team_waiting") return "waiting_on_you";
    if (isAssignedToUser(task, userId)) return "waiting_on_you";
    if (legacy === "patient_waiting") return "waiting_on_team";
    return "waiting_on_team";
  }

  if (isAssignedToUser(task, userId)) return "waiting_on_you";
  if (legacy === "patient_waiting" || legacy === "approvals") return "waiting_on_you";
  return "waiting_on_team";
}

function mapDecisionRow(
  task: MyTask,
  bucket: RelayPracticeBucket,
  membersById: Map<string, AssignableMember>,
  enrichment?: RelayTaskEnrichment
): RelayDecisionRow {
  const patient = task.submission_patient_name?.trim() || null;
  const waitingAt = task.submitted_for_review_at ?? taskLastActivityAt(task);
  const context = taskContext(task, enrichment);

  let primaryLabel: string;
  if (bucket === "waiting_on_you") {
    primaryLabel = patient ?? task.title;
  } else if (bucket === "waiting_on_team") {
    primaryLabel = patient ?? assigneeLabelForTask(task, membersById);
  } else {
    primaryLabel = patient ?? assigneeLabelForTask(task, membersById);
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

type AttentionCounts = {
  approvals: number;
  teamRequests: number;
  recallBlocked: number;
  overdue: number;
  waitingOnYou: number;
  waitingOnTeam: number;
  callbacks: number;
  appointments: number;
  aftercare: number;
  unreadComms: number;
};

function buildAttentionHighlights(
  counts: AttentionCounts,
  persona: RelayPracticePersona
): RelayAttentionHighlight[] {
  const candidates: { priority: number; label: string }[] = [];

  if (persona === "zahnarzt") {
    if (counts.approvals > 0) {
      candidates.push({
        priority: 100,
        label:
          counts.approvals === 1
            ? "1 Freigabe offen"
            : `${counts.approvals} Freigaben offen`,
      });
    }
    if (counts.teamRequests > 0) {
      candidates.push({
        priority: 95,
        label:
          counts.teamRequests === 1
            ? "1 Teamanfrage wartet"
            : `${counts.teamRequests} Teamanfragen warten`,
      });
    }
    if (counts.recallBlocked > 0) {
      candidates.push({
        priority: 90,
        label:
          counts.recallBlocked === 1
            ? "1 Recall blockiert"
            : `${counts.recallBlocked} Recalls blockiert`,
      });
    }
  } else if (persona === "rezeption") {
    if (counts.callbacks > 0) {
      candidates.push({
        priority: 100,
        label:
          counts.callbacks === 1
            ? "1 Rückruf offen"
            : `${counts.callbacks} Rückrufe offen`,
      });
    }
    if (counts.appointments > 0) {
      candidates.push({
        priority: 95,
        label:
          counts.appointments === 1
            ? "1 Termin offen"
            : `${counts.appointments} Termine offen`,
      });
    }
  } else if (persona === "zfa") {
    if (counts.aftercare > 0) {
      candidates.push({
        priority: 100,
        label:
          counts.aftercare === 1
            ? "1 Nachsorge offen"
            : `${counts.aftercare} Nachsorge-Vorgänge offen`,
      });
    }
    if (counts.callbacks > 0) {
      candidates.push({
        priority: 95,
        label:
          counts.callbacks === 1
            ? "1 Fotoanforderung offen"
            : `${counts.callbacks} Fotoanforderungen offen`,
      });
    }
  } else if (persona === "zmp") {
    if (counts.recallBlocked > 0) {
      candidates.push({
        priority: 100,
        label:
          counts.recallBlocked === 1
            ? "1 Recall ausstehend"
            : `${counts.recallBlocked} Recalls ausstehend`,
      });
    }
    if (counts.aftercare > 0) {
      candidates.push({
        priority: 95,
        label:
          counts.aftercare === 1
            ? "1 Nachbetreuung offen"
            : `${counts.aftercare} Nachbetreuungen offen`,
      });
    }
  } else if (persona === "praxismanager") {
    if (counts.waitingOnTeam > 0) {
      candidates.push({
        priority: 100,
        label:
          counts.waitingOnTeam === 1
            ? "1 Teamaufgabe offen"
            : `${counts.waitingOnTeam} Teamaufgaben offen`,
      });
    }
    if (counts.approvals > 0) {
      candidates.push({
        priority: 95,
        label:
          counts.approvals === 1
            ? "1 Freigabe ausstehend"
            : `${counts.approvals} Freigaben ausstehend`,
      });
    }
  }

  if (counts.overdue > 0) {
    candidates.push({
      priority: 85,
      label:
        counts.overdue === 1
          ? "1 Vorgang überfällig"
          : `${counts.overdue} Vorgänge überfällig`,
    });
  }

  if (counts.unreadComms > 0) {
    candidates.push({
      priority: 80,
      label:
        counts.unreadComms === 1
          ? "1 interne Nachricht ungelesen"
          : `${counts.unreadComms} interne Nachrichten ungelesen`,
    });
  }

  return candidates
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map((item, index) => ({
      id: `attention-${index}`,
      label: item.label,
    }));
}

export function buildRelayDecisionsSnapshot(input: {
  open: MyTask[];
  pending: MyTask[];
  members: AssignableMember[];
  draftBySubmissionId: Record<string, MessageDraftListStatus>;
  isDoctor: boolean;
  userId: string;
  unreadCommsCount?: number;
}): RelayDecisionsSnapshot {
  const persona = resolveRelayPracticePersona(input.isDoctor);
  const enrichments = buildSubmissionEnrichmentMap(input.draftBySubmissionId);
  const membersById = new Map(input.members.map((m) => [m.user_id, m]));
  const active = [...input.open, ...input.pending];

  const buckets: Record<RelayPracticeBucket, RelayDecisionRow[]> = {
    waiting_on_you: [],
    waiting_on_team: [],
    overdue: [],
  };

  let approvalsCount = 0;
  let teamRequestsCount = 0;
  let recallBlockedCount = 0;
  let callbacksCount = 0;
  let appointmentsCount = 0;
  let aftercareCount = 0;

  const sorted = [...active].sort((a, b) => {
    const ea = a.submission_id ? enrichments.get(a.submission_id) : undefined;
    const eb = b.submission_id ? enrichments.get(b.submission_id) : undefined;
    const sa = resolveRelayOpsStatus(a, ea);
    const sb = resolveRelayOpsStatus(b, eb);
    return taskPriorityScore(b, sb.isCritical) - taskPriorityScore(a, sa.isCritical);
  });

  for (const task of sorted) {
    const enrichment = task.submission_id ? enrichments.get(task.submission_id) : undefined;
    const legacy = resolveLegacyBucket(task, enrichment, input.isDoctor);
    const category = resolveRelayTaskCategory(task);
    const bucket = resolvePracticeBucket(task, enrichment, input.isDoctor, input.userId);
    if (!bucket) continue;

    if (legacy === "approvals") approvalsCount += 1;
    if (legacy === "team_waiting") teamRequestsCount += 1;
    if (category === "recall" && task.status !== "done") recallBlockedCount += 1;
    if (category === "patient_contact") callbacksCount += 1;
    if (category === "appointment") appointmentsCount += 1;
    if (category === "aftercare") aftercareCount += 1;

    buckets[bucket].push(mapDecisionRow(task, bucket, membersById, enrichment));
  }

  const attentionCounts: AttentionCounts = {
    approvals: approvalsCount,
    teamRequests: teamRequestsCount,
    recallBlocked: recallBlockedCount,
    overdue: buckets.overdue.length,
    waitingOnYou: buckets.waiting_on_you.length,
    waitingOnTeam: buckets.waiting_on_team.length,
    callbacks: callbacksCount,
    appointments: appointmentsCount,
    aftercare: aftercareCount,
    unreadComms: input.unreadCommsCount ?? 0,
  };

  const needsAttention = buildAttentionHighlights(attentionCounts, persona);
  const allClear =
    buckets.waiting_on_you.length === 0 &&
    buckets.waiting_on_team.length === 0 &&
    buckets.overdue.length === 0 &&
    needsAttention.length === 0;

  return {
    persona,
    summary: {
      allClear,
      todayLabel: formatTodayLabel(),
      todayCalmLine: allClear
        ? "Neue Vorgänge erscheinen hier, sobald Patienten oder Team auf die Praxis warten."
        : null,
    },
    needsAttention,
    waitingOnYou: buckets.waiting_on_you,
    waitingOnTeam: buckets.waiting_on_team,
    overdue: buckets.overdue,
  };
}

/** Hilfsfunktion für künftige Profil-Rollen — priorisiert passende Aufgaben in der Liste. */
export function sortRowsForPersona(rows: RelayDecisionRow[], tasksById: Map<string, MyTask>, persona: RelayPracticePersona): RelayDecisionRow[] {
  return [...rows].sort((a, b) => {
    const ta = tasksById.get(a.id);
    const tb = tasksById.get(b.id);
    const fa = ta ? taskCategoryMatchesPersonaFocus(ta, persona) : false;
    const fb = tb ? taskCategoryMatchesPersonaFocus(tb, persona) : false;
    if (fa && !fb) return -1;
    if (!fa && fb) return 1;
    return 0;
  });
}
