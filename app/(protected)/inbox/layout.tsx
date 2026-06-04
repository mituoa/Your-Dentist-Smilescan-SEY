import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxTrackerShell } from "@/components/inbox/inbox-tracker-shell";
import { TrackerEmptyState } from "@/components/inbox/tracker-empty-state";
import { TrackerInboxPanel } from "@/components/inbox/tracker-inbox-panel";
import { WorkspaceMobileShortcutsBar } from "@/components/workspace/workspace-mobile-shortcuts-bar";

interface InboxLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function InboxLayout({ children }: InboxLayoutProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  const role = (workspace.role || "team") as "doctor" | "team";

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  const listFailed = !listResult.ok;
  const submissions = listResult.ok ? listResult.items : [];

  const list = (
    <div className="flex h-full min-h-0 flex-col px-0 pb-0 md:px-1 md:pb-1">
      {listFailed ? (
        <TrackerEmptyState
          title="Einsendungen können momentan nicht geladen werden"
          description="Bitte die Seite in Kürze erneut öffnen. Wenn das Problem bleibt, die Seite neu laden."
        />
      ) : submissions.length === 0 ? (
        <TrackerEmptyState
          title="Noch keine Einsendungen"
          description="Neue Patientenfälle erscheinen hier in der Übersicht."
        />
      ) : (
        <TrackerInboxPanel items={submissions} showCreateCase={role === "doctor"} />
      )}
    </div>
  );

  return (
    <div className="yd-tracker-page yd-tracker-page--clinical yd-inbox-workspace relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <WorkspaceMobileShortcutsBar />
      <InboxTrackerShell list={list} detail={children} />
    </div>
  );
}
