import { AtlasInboxList } from "@/components/dashboard/hc/atlas-inbox-list";
import { AtlasOverviewMetrics } from "@/components/dashboard/hc/atlas-overview-metrics";
import { AtlasPracticeToday } from "@/components/dashboard/hc/atlas-practice-today";
import {
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
  const todayMetrics = buildTodayMetrics(unseenCount, previewRows, openTasks);
  const patientCases = buildPatientCases(previewRows);
  const teamHints = buildRelayActivity(relayConversations, activityEvents, openTasks);

  return (
    <div className="yd-med-layout yd-med-layout--mobile md:hidden" aria-label="Praxis Cockpit">
      <AtlasOverviewMetrics cards={todayMetrics} />
      <AtlasInboxList cases={patientCases} />
      <AtlasPracticeToday metrics={todayMetrics} teamHints={teamHints} />
    </div>
  );
}
