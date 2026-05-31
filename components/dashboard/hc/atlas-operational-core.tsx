import { AtlasDesktopWorkspace } from "@/components/dashboard/hc/atlas-desktop-workspace";
import { AtlasMobileWorkspace } from "@/components/dashboard/hc/atlas-mobile-workspace";
import {
  buildCommandSuggestions,
  buildPriorityFeed,
} from "@/lib/dashboard/priority-feed";
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
  const openTaskCount = props.openTasks?.length ?? 0;
  const priorityItems = buildPriorityFeed(props.previewRows, props.openTasks);
  const commandSuggestions = buildCommandSuggestions(props.previewRows, openTaskCount);

  return (
    <>
      <AtlasMobileWorkspace
        {...props}
        priorityItems={priorityItems}
        commandSuggestions={commandSuggestions}
      />
      <AtlasDesktopWorkspace {...props} />
    </>
  );
}
