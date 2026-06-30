import { buildNavAmbientPreviews } from "@/lib/ambient/build-nav-ambient-previews";
import {
  countPreparedAwaitingReview,
  countTasksNeedingDecision,
} from "@/lib/command-ai/submission-preparation";
import { buildDashboardHeaderSummary } from "@/lib/dashboard/dashboard-header-summary";
import type { DashboardHeaderSummary } from "@/lib/dashboard/dashboard-header-summary";
import { buildTrackerHeaderSummary } from "@/lib/inbox/tracker-header-summary";
import type { TrackerHeaderSummary } from "@/lib/inbox/tracker-header-summary";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import {
  getRecentSubmissionsPreview,
  getOpenTasks,
  getTotalUnseenSubmissions,
} from "@/lib/queries/dashboard";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { getMyTasks } from "@/lib/queries/my-tasks";
import { getMessageDraftStatusMapForSubmissions } from "@/lib/queries/message-drafts";
import { getRelayConversationsForUser } from "@/lib/queries/relay-messages";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { buildRelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import { buildRelayHeaderSummary } from "@/lib/relay/relay-header-summary";
import type { RelayHeaderSummary } from "@/lib/relay/relay-header-summary";
import type { EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";
import type { YdNavAmbientMap } from "@/lib/ambient/nav-preview-types";

export type ProtectedLayoutHeavyData = {
  commandPatients: {
    id: string;
    patient_name: string | null;
    patient_notes: string | null;
  }[];
  practicePhone: string | null;
  appointmentUrl: string | null;
  trackerHeaderSummary: TrackerHeaderSummary | null;
  dashboardHeaderSummary: DashboardHeaderSummary | null;
  relayHeaderSummary: RelayHeaderSummary | null;
  navAmbient: YdNavAmbientMap;
};

export async function loadProtectedLayoutHeavyData(input: {
  workspaceId: string;
  userId: string;
  role: "doctor" | "team";
  inboxCount?: number;
  tasksOverdue: number;
  practicePhone: string | null;
  appointmentUrl: string | null;
}): Promise<ProtectedLayoutHeavyData> {
  const isDoctor = input.role === "doctor";

  const [inboxRes, tasksRes, journals, relayOpen, relayPending, relayConversations, relayMembers] =
    await Promise.all([
      getInboxSubmissions(input.workspaceId),
      getOpenTasks(input.workspaceId),
      isDoctor ? listJournalForWorkspace(input.workspaceId) : Promise.resolve([]),
      getMyTasks(input.userId, input.workspaceId, isDoctor, "open"),
      getMyTasks(input.userId, input.workspaceId, isDoctor, "pending_review"),
      getRelayConversationsForUser(input.workspaceId, input.userId),
      getAssignableWorkspaceMembers(input.workspaceId, input.userId),
    ]);

  let commandPatients: ProtectedLayoutHeavyData["commandPatients"] = [];
  let trackerHeaderSummary: TrackerHeaderSummary | null = null;
  let dashboardHeaderSummary: DashboardHeaderSummary | null = null;

  if (inboxRes.ok) {
    commandPatients = inboxRes.items.map((item) => ({
      id: item.id,
      patient_name: item.patient_name,
      patient_notes: item.patient_notes,
    }));
    trackerHeaderSummary = buildTrackerHeaderSummary(
      inboxRes.items as EnrichedSubmissionListItem[]
    );
  }

  if (isDoctor) {
    const [unseenRes, previewRes] = await Promise.all([
      getTotalUnseenSubmissions(input.workspaceId),
      getRecentSubmissionsPreview(input.workspaceId),
    ]);
    const unseenCount = unseenRes.ok ? unseenRes.count : 0;
    const previewRows = previewRes.ok ? previewRes.rows : [];
    const preparedAwaitingCount = countPreparedAwaitingReview(
      previewRows.map((row) => ({
        id: row.id,
        patient_name: row.patient_name,
        patient_notes: row.patient_notes,
        seen_at: row.seen_at,
        photo_count: 0,
      }))
    );
    const tasksNeedingDecision = tasksRes.ok
      ? countTasksNeedingDecision(tasksRes.tasks)
      : 0;

    dashboardHeaderSummary = buildDashboardHeaderSummary({
      unseenCount,
      preparedAwaitingCount,
      tasksNeedingDecision,
      preparedCasesCount: previewRows.length,
    });
  }

  const journalDrafts = journals.filter((entry) => entry.status === "draft");
  const relaySubmissionIds = [
    ...new Set(
      [...relayOpen, ...relayPending]
        .map((t) => t.submission_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const relayDraftMap = await getMessageDraftStatusMapForSubmissions(
    input.workspaceId,
    relaySubmissionIds
  );
  const relaySnapshot = buildRelayPracticeSnapshot({
    open: relayOpen,
    pending: relayPending,
    members: relayMembers,
    draftBySubmissionId: relayDraftMap.available ? relayDraftMap.statusBySubmissionId : {},
    conversations: relayConversations,
    journalDrafts,
    isDoctor,
    userId: input.userId,
    basePath: "/relay",
  });
  const relayHeaderSummary = buildRelayHeaderSummary(relaySnapshot);

  const navAmbient = buildNavAmbientPreviews({
    inboxItems: inboxRes.ok ? inboxRes.items : [],
    inboxUnseen: input.inboxCount,
    openTasks: tasksRes.ok ? tasksRes.tasks : [],
    tasksOverdue: input.tasksOverdue,
    journalEntries: journals,
    role: input.role,
  });

  return {
    commandPatients,
    practicePhone: input.practicePhone,
    appointmentUrl: input.appointmentUrl,
    trackerHeaderSummary,
    dashboardHeaderSummary,
    relayHeaderSummary,
    navAmbient,
  };
}
