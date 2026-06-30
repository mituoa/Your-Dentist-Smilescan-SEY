import { redirect } from "next/navigation";

import { DashboardAmbientKpis, DashboardAmbientLower } from "@/components/dashboard/hc/dashboard-ambient-sections";
import { DashboardMobileHealth } from "@/components/dashboard/hc/dashboard-mobile-health";
import { DashboardPracticeState } from "@/components/dashboard/hc/dashboard-practice-state";
import { DashboardStatusStrip } from "@/components/dashboard/hc/dashboard-status-strip";
import { DashboardTimelineGantt } from "@/components/dashboard/hc/dashboard-timeline-gantt";
import { DashboardTodayPanel } from "@/components/dashboard/hc/dashboard-today-panel";
import {
  buildDashboardGanttRows,
  buildDashboardStatusStrip,
  buildDashboardTodayRelevant,
  buildPracticeStateDomains,
} from "@/lib/dashboard/dashboard-bento-model";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { buildSubmissionPreparation, countPreparedAwaitingReview, countTasksNeedingDecision } from "@/lib/command-ai/submission-preparation";
import { buildPracticeBriefing } from "@/lib/command-ai/practice-intelligence";
import { YD } from "@/lib/design/yd-design-tokens";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import {
  getTotalUnseenSubmissions,
  getOpenTasks,
  getRecentSubmissionsPreview,
  getDashboardPriorityItems,
  logDashboardDbFailure,
  getWeeklySubmissionCounts,
} from "@/lib/queries/dashboard";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { getMyTasks } from "@/lib/queries/my-tasks";
import { getRelayConversationsForUser } from "@/lib/queries/relay-messages";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import {
  attachMessageDraftStatusToRows,
  getMessageDraftStatusMapForSubmissions,
} from "@/lib/queries/message-drafts";
import { buildRelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const workspace = await requireApprovedWorkspace();
  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const workspaceId = workspace.workspace_id;
  const userId = user.id;

  const supabase = await createClient();
  const { data: profileData, error: profileError } = await supabase
    .from("profile_data")
    .select("display_name, photo_url, practice_phone, appointment_link")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (profileError) {
    logDashboardDbFailure("profile_data_select_failed", profileError);
  }

  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "Team";
  const doctorLabel = cockpitDoctorLabel(displayName);

  const [
    unseenRes,
    tasksRes,
    previewRes,
    priorityRes,
    relayOpen,
    relayPending,
    relayConversations,
    relayMembers,
    journals,
    weeklyRes,
  ] = await Promise.all([
    getTotalUnseenSubmissions(workspaceId),
    getOpenTasks(workspaceId),
    getRecentSubmissionsPreview(workspaceId),
    getDashboardPriorityItems(workspaceId, 6),
    getMyTasks(userId, workspaceId, true, "open"),
    getMyTasks(userId, workspaceId, true, "pending_review"),
    getRelayConversationsForUser(workspaceId, userId),
    getAssignableWorkspaceMembers(workspaceId, userId),
    listJournalForWorkspace(workspaceId),
    getWeeklySubmissionCounts(workspaceId),
  ]);

  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const openTaskCount = openTasks?.length ?? 0;
  const tasksNeedingDecision = openTasks ? countTasksNeedingDecision(openTasks) : null;
  const previewRows = previewRes.ok
    ? await attachMessageDraftStatusToRows(workspaceId, previewRes.rows)
    : null;
  const priorityItems = priorityRes.ok ? priorityRes.items : null;
  const photoCountBySubmission = new Map(
    (priorityItems ?? []).map((item) => [item.id, item.photo_count] as const)
  );

  const preparationInputs = (previewRows ?? []).map((row) => ({
    id: row.id,
    patient_name: row.patient_name,
    patient_notes: row.patient_notes,
    seen_at: row.seen_at,
    photo_count: photoCountBySubmission.get(row.id) ?? 0,
  }));

  const preparedAwaitingCount =
    previewRows === null || priorityRes.ok === false
      ? null
      : countPreparedAwaitingReview(preparationInputs);

  const relaySubmissionIds = [
    ...new Set(
      [...relayOpen, ...relayPending]
        .map((t) => t.submission_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const relayDraftMap = await getMessageDraftStatusMapForSubmissions(
    workspaceId,
    relaySubmissionIds
  );
  const journalDrafts = journals.filter((entry) => entry.status === "draft");

  const relaySnapshot = buildRelayPracticeSnapshot({
    open: relayOpen,
    pending: relayPending,
    members: relayMembers,
    draftBySubmissionId: relayDraftMap.available ? relayDraftMap.statusBySubmissionId : {},
    conversations: relayConversations,
    journalDrafts,
    isDoctor: true,
    userId,
    basePath: "/relay",
  });

  const statusCards = buildDashboardStatusStrip(relaySnapshot);
  const practiceDomains = buildPracticeStateDomains(relaySnapshot);
  const todayRelevant = buildDashboardTodayRelevant(relaySnapshot);
  const todayIds = new Set(todayRelevant.map((item) => item.id));
  const ganttRows = buildDashboardGanttRows(relaySnapshot, todayIds);

  const dashboardOverviewIncomplete =
    !!profileError ||
    !unseenRes.ok ||
    !tasksRes.ok ||
    !previewRes.ok ||
    !priorityRes.ok;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  const briefing =
    previewRows !== null && priorityItems !== null
      ? buildPracticeBriefing({
          displayName: doctorLabel,
          greeting,
          priorityItems: (priorityItems ?? []).map((item) => ({
            id: item.id,
            patient_name: item.patient_name,
            patient_notes: item.patient_notes,
            seen_at: item.seen_at,
            photo_count: item.photo_count,
          })),
          previewRows: previewRows ?? [],
          openTaskCount,
          tasksNeedingDecision: tasksNeedingDecision ?? 0,
          preparedAwaitingCount: preparedAwaitingCount ?? 0,
        })
      : null;

  return (
    <div
      className="yd-dashboard yd-dashboard--bento relative mx-auto w-full min-w-0 pb-12 md:pb-16"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <DashboardMobileHealth
        practiceDomains={practiceDomains}
        todayItems={todayRelevant}
        weeklyCounts={weeklyRes.ok ? weeklyRes.counts : null}
        overviewIncomplete={dashboardOverviewIncomplete}
      />

      <div className="hidden md:contents">
        {dashboardOverviewIncomplete ? (
          <p
            className="yd-dash-meta mb-3 max-w-2xl normal-case tracking-normal"
            style={{ color: YD.text.secondary }}
            role="status"
          >
            Einige Bereiche konnten nicht geladen werden — bitte Seite erneut laden.
          </p>
        ) : null}

        <div className="yd-dash-bento-canvas">
          <DashboardAmbientKpis>
            <DashboardStatusStrip cards={statusCards} />
          </DashboardAmbientKpis>

          <div className="yd-dash-ref-main-row">
            <DashboardPracticeState domains={practiceDomains} />
            <DashboardTodayPanel items={todayRelevant} weeklyCounts={weeklyRes.ok ? weeklyRes.counts : null} />
          </div>

          <DashboardAmbientLower>
            <DashboardTimelineGantt rows={ganttRows} />
          </DashboardAmbientLower>
        </div>
      </div>
    </div>
  );
}
