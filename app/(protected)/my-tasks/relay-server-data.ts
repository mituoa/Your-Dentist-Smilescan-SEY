import "server-only";

import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getMyTasks } from "@/lib/queries/my-tasks";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { getMyTaskCounts } from "@/lib/queries/task-counts";
import { createClient } from "@/lib/supabase/server";

export async function loadRelayWorkspaceData(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  await searchParams;

  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDoctor = workspace.role === "doctor";

  const [openTasks, pendingTasks, doneTasks, counts, assignableMembers] = await Promise.all([
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "open"),
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "pending_review"),
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "done"),
    getMyTaskCounts(user.id, workspace.workspace_id, isDoctor),
    getAssignableWorkspaceMembers(workspace.workspace_id, user.id),
  ]);

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    isDoctor,
    columns: { open: openTasks, pending: pendingTasks, done: doneTasks },
    counts,
    assignableMembers,
  };
}
