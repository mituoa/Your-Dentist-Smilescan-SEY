import { Suspense } from "react";

import { InboxListPanelLoader } from "@/components/inbox/inbox-list-panel-loader";
import { InboxTrackerShell } from "@/components/inbox/inbox-tracker-shell";
import { TrackerInboxReadProvider } from "@/components/inbox/tracker-inbox-read-context";
import { ClinicalInboxSkeleton } from "@/components/workspace/clinical-route-skeleton";

interface InboxLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

/** Sync-Layout — darf nicht awaiten, sonst blockiert `/inbox/[id]`. */
export default function InboxLayout({ children }: InboxLayoutProps) {
  const list = (
    <Suspense fallback={<ClinicalInboxSkeleton />}>
      <InboxListPanelLoader />
    </Suspense>
  );

  return (
    <div className="yd-tracker-page yd-inbox-workspace relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--a" aria-hidden />
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--b" aria-hidden />
      <TrackerInboxReadProvider>
        <InboxTrackerShell list={list} detail={children} />
      </TrackerInboxReadProvider>
    </div>
  );
}
