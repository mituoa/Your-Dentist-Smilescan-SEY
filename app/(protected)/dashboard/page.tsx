import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { Greeting } from "@/components/dashboard/greeting";
import { NewSubmissionsBlock } from "@/components/dashboard/new-submissions-block";
import { OpenTasksBlock } from "@/components/dashboard/open-tasks-block";
import { RecentActivityBlock } from "@/components/dashboard/recent-activity-block";
import { createClient } from "@/lib/supabase/server";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getOpenTasks,
  getRecentActivity,
} from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  if (!user || !workspace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const workspaceId = workspace.workspace_id;
  const role = workspace.role;
  const isDoctor = role === "doctor";

  const supabase = await createClient();
  const { data: profileData } = await supabase
    .from("profile_data")
    .select("display_name")
    .eq("workspace_id", workspaceId)
    .single();

  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "";

  const [newCount, totalUnseen, tasks, activity] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getOpenTasks(workspaceId),
    getRecentActivity(workspaceId),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Greeting name={displayName} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NewSubmissionsBlock newCount={newCount} totalUnseen={totalUnseen} />
        <OpenTasksBlock tasks={tasks} canCheckOff={isDoctor} />
        <RecentActivityBlock events={activity} />
      </div>
    </div>
  );
}
