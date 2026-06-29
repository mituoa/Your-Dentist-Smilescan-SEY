import { redirect } from "next/navigation";

import { TrackerEmptyState } from "@/components/inbox/tracker-empty-state";
import { TrackerInboxPanel } from "@/components/inbox/tracker-inbox-panel";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";

/**
 * Async Listen-Slot — in Suspense, damit `/inbox/[id]` nicht auf die volle
 * Listen-Anreicherung warten muss (Mobile-Fall-Öffnung).
 */
export async function InboxListPanelLoader() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  if (!listResult.ok) {
    return (
      <TrackerEmptyState
        title="Einsendungen können momentan nicht geladen werden"
        description="Bitte die Seite in Kürze erneut öffnen. Wenn das Problem bleibt, die Seite neu laden."
      />
    );
  }

  if (listResult.items.length === 0) {
    return (
      <TrackerEmptyState
        title="Noch keine Einsendungen"
        description="Neue Patientenfälle erscheinen hier in der Übersicht."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col px-0 pb-0 md:px-2 md:pb-2">
      <TrackerInboxPanel items={listResult.items} />
    </div>
  );
}
