import { getCurrentWorkspace, requireUser } from "@/lib/auth-helpers";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";

import { WorkspaceMobileShortcuts } from "./workspace-mobile-shortcuts";

/** Server: Schnellzugriff mit Live-Zähler aus Supabase (nur Tracker/Relay, nicht Dashboard). */
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

  return (
    <WorkspaceMobileShortcuts
      showDashboard={role === "doctor"}
      inboxBadge={inboxBadge}
      relayBadge={relayBadge}
    />
  );
}
