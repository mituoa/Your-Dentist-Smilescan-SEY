import { AtlasDesktopWorkspace } from "@/components/dashboard/hc/atlas-desktop-workspace";
import { AtlasMobileWorkspace } from "@/components/dashboard/hc/atlas-mobile-workspace";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type {
  ActivityEvent,
  DashboardRoutineRow,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";

type AtlasOperationalCoreProps = {
  unseenCount: number | null;
  previewRows: SubmissionPreviewRow[] | null;
  openTasks: OpenTaskRow[] | null;
  routines: DashboardRoutineRow[] | null;
  relayConversations: RelayConversationRow[];
  relayUnread: number;
  reminderCount: number;
  activityEvents: ActivityEvent[] | null;
};

export function AtlasOperationalCore(props: AtlasOperationalCoreProps) {
  return (
    <>
      <AtlasMobileWorkspace {...props} />
      <AtlasDesktopWorkspace {...props} />
    </>
  );
}
