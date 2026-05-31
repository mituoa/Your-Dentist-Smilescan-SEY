import { redirect } from "next/navigation";

import { AtlasOperationalCore } from "@/components/dashboard/hc/atlas-operational-core";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { buildDailyStatus } from "@/lib/dashboard/command-center";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  getTotalUnseenSubmissions,
  getOpenTasks,
  getRecentSubmissionsPreview,
  getRecentActivity,
  getDashboardRoutineTasks,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
import { getRelayConversationsForUser } from "@/lib/queries/relay-messages";
import {
  formatDoctorDisplayName,
  greetingDoctorLabel,
} from "@/lib/format-doctor-display-name";
import { YD } from "@/lib/design/yd-design-tokens";

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

  const supabase = await createClient();
  const { data: profileData, error: profileError } = await supabase
    .from("profile_data")
    .select("display_name, photo_url")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (profileError) {
    logDashboardDbFailure("profile_data_select_failed", profileError);
  }

  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "Team";
  const doctorDisplayName = formatDoctorDisplayName(displayName);
  const greetingDoctorName = greetingDoctorLabel(displayName);

  const [unseenRes, tasksRes, previewRes, activityRes, routinesRes, relayConversations] =
    await Promise.all([
      getTotalUnseenSubmissions(workspaceId),
      getOpenTasks(workspaceId),
      getRecentSubmissionsPreview(workspaceId),
      getRecentActivity(workspaceId),
      getDashboardRoutineTasks(workspaceId),
      getRelayConversationsForUser(workspaceId, user.id).catch(() => []),
    ]);

  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const routines = routinesRes.ok ? routinesRes.routines : null;
  const activityEvents = activityRes.ok ? activityRes.events : null;
  const previewRows = previewRes.ok ? previewRes.rows : null;
  const relayUnread = relayConversations.reduce((sum, c) => sum + c.unread_count, 0);
  const openTaskCount = openTasks?.length ?? 0;

  const now = Date.now();
  const reminderCount =
    openTasks?.filter((t) => {
      if (!t.remind_at) return false;
      const due = new Date(t.remind_at).getTime();
      const week = 7 * 24 * 60 * 60 * 1000;
      return due <= now + week;
    }).length ?? 0;

  const dailyStatus = buildDailyStatus(unseenCount, openTaskCount, relayUnread);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div
      className="yd-dashboard yd-dashboard--atlas relative mx-auto w-full min-w-0 pb-10"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <DashboardHeader
        greeting={greeting}
        displayName={doctorDisplayName}
        greetingName={greetingDoctorName}
        dailyStatus={dailyStatus}
      />

      <AtlasOperationalCore
        unseenCount={unseenCount}
        previewRows={previewRows}
        openTasks={openTasks}
        routines={routines}
        relayConversations={relayConversations}
        relayUnread={relayUnread}
        reminderCount={reminderCount}
        activityEvents={activityEvents}
      />
    </div>
  );
}
