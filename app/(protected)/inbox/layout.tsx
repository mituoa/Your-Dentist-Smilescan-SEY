import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxTrackerShell } from "@/components/inbox/inbox-tracker-shell";
import { TrackerInboxPanel } from "@/components/inbox/tracker-inbox-panel";

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
    <div className="flex h-full min-h-0 flex-col px-1 pb-1 md:px-2 md:pb-2">
      {listFailed ? (
        <div
          className="yd-tracker-table-card flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-[15px] font-medium text-[#0F172A]">
            Einsendungen können momentan nicht geladen werden
          </p>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#64748B]">
            Bitte die Seite in Kürze erneut öffnen. Wenn das Problem bleibt, die Seite neu laden.
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div
          className="yd-tracker-table-card flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        >
          <p className="text-[15px] font-medium text-[#0F172A]">Noch keine Einsendungen</p>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#64748B]">
            Neue Patientenfälle erscheinen hier in der Übersicht.
          </p>
        </div>
      ) : (
        <TrackerInboxPanel items={submissions} showCreateCase={role === "doctor"} />
      )}
    </div>
  );

  return (
    <div className="yd-inbox-workspace relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <InboxTrackerShell list={list} detail={children} />
    </div>
  );
}
