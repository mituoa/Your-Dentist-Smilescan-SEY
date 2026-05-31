import { AtlasCommandAssist } from "@/components/dashboard/hc/atlas-command-assist";
import { AtlasInboxList } from "@/components/dashboard/hc/atlas-inbox-list";
import { AtlasOverviewMetrics } from "@/components/dashboard/hc/atlas-overview-metrics";
import { AtlasPracticeToday } from "@/components/dashboard/hc/atlas-practice-today";
import {
  buildCommandSuggestions,
  buildPatientCases,
  buildRelayActivity,
  buildTodayMetrics,
} from "@/lib/dashboard/command-center";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type {
  ActivityEvent,
  DashboardRoutineRow,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";

type AtlasMobileWorkspaceProps = {
  unseenCount: number | null;
  previewRows: SubmissionPreviewRow[] | null;
  openTasks: OpenTaskRow[] | null;
  routines: DashboardRoutineRow[] | null;
  relayConversations: RelayConversationRow[];
  relayUnread: number;
  reminderCount: number;
  activityEvents: ActivityEvent[] | null;
};

export function AtlasMobileWorkspace({
  unseenCount,
  previewRows,
  openTasks,
  relayConversations,
  activityEvents,
}: AtlasMobileWorkspaceProps) {
  const openTaskCount = openTasks?.length ?? 0;
  const todayMetrics = buildTodayMetrics(unseenCount, previewRows, openTasks);
  const commandSuggestions = buildCommandSuggestions(previewRows, openTaskCount);
  const patientCases = buildPatientCases(previewRows);
  const teamHints = buildRelayActivity(relayConversations, activityEvents, openTasks);

  return (
    <div className="yd-cockpit yd-cockpit--mobile md:hidden" aria-label="Praxis Cockpit">
      <AtlasOverviewMetrics cards={todayMetrics} />
      <AtlasInboxList cases={patientCases} />
      <AtlasCommandAssist suggestions={commandSuggestions} />
      <AtlasPracticeToday metrics={todayMetrics} teamHints={teamHints} />
    </div>
  );
}
