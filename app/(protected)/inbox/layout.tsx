import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxTrackerShell } from "@/components/inbox/inbox-tracker-shell";
import { TrackerEmptyState } from "@/components/inbox/tracker-empty-state";
import { TrackerInboxPanel } from "@/components/inbox/tracker-inbox-panel";

interface InboxLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function InboxLayout({ children }: InboxLayoutProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  const listFailed = !listResult.ok;
  const submissions = listResult.ok ? listResult.items : [];

  const list = (
    <div className="flex h-full min-h-0 flex-col px-1 pb-1 md:px-2 md:pb-2">
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
        <TrackerInboxPanel items={submissions} />
      )}
    </div>
  );

  return (
    <div className="yd-tracker-page yd-inbox-workspace relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--a" aria-hidden />
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--b" aria-hidden />
      <InboxTrackerShell list={list} detail={children} />
    </div>
  );
}
