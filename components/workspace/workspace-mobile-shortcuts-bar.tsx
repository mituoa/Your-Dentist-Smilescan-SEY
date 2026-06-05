import { getCurrentWorkspace, requireUser } from "@/lib/auth-helpers";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";

import { WorkspaceMobileShortcuts } from "./workspace-mobile-shortcuts";

/** Server: Bottom-Rail mit Live-Zähler — dieselbe IA wie Desktop-Sidebar. */
export async function WorkspaceMobileShortcutsBar() {
  const [user, workspace] = await Promise.all([requireUser(), getCurrentWorkspace()]);
  if (!workspace) return null;

  const role = (workspace.role || "team") as "doctor" | "team";

  const [unseenRes, tasksRes] = await Promise.all([
    countUnseenInboxSubmissions(workspace.workspace_id),
    countMyOpenTasks(user.id, workspace.workspace_id, role),
  ]);

  const inboxBadge = unseenRes.ok && unseenRes.count > 0 ? unseenRes.count : undefined;
  const relayBadge = tasksRes.total > 0 ? tasksRes.total : undefined;
  const relayBadgeUrgent = tasksRes.overdue > 0;

  return (
    <WorkspaceMobileShortcuts
      role={role}
      inboxBadge={inboxBadge}
      relayBadge={relayBadge}
      relayBadgeUrgent={relayBadgeUrgent}
    />
  );
}
