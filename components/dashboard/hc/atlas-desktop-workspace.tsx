import { AtlasCockpitActivity } from "@/components/dashboard/hc/atlas-cockpit-activity";
import { AtlasCockpitTasks } from "@/components/dashboard/hc/atlas-cockpit-tasks";
import { AtlasCommandHero } from "@/components/dashboard/hc/atlas-command-hero";
import { AtlasPatientCases } from "@/components/dashboard/hc/atlas-patient-cases";
import { AtlasRelayActivity } from "@/components/dashboard/hc/atlas-relay-activity";
import { AtlasTodayImportant } from "@/components/dashboard/hc/atlas-today-important";
import {
  buildCommandSuggestions,
  buildPatientCases,
  buildRelayActivity,
  buildTaskPreviews,
  buildTodayMetrics,
} from "@/lib/dashboard/command-center";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type {
  ActivityEvent,
  DashboardRoutineRow,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";

type AtlasDesktopWorkspaceProps = {
  unseenCount: number | null;
  previewRows: SubmissionPreviewRow[] | null;
  openTasks: OpenTaskRow[] | null;
  routines: DashboardRoutineRow[] | null;
  relayConversations: RelayConversationRow[];
  relayUnread: number;
  reminderCount: number;
  activityEvents: ActivityEvent[] | null;
};

/** Praxis-Cockpit — Aufmerksamkeit → Anfragen → Command → Team → Aktivität. */
export function AtlasDesktopWorkspace({
  unseenCount,
  previewRows,
  openTasks,
  relayConversations,
  activityEvents,
}: AtlasDesktopWorkspaceProps) {
  const openTaskCount = openTasks?.length ?? 0;
  const todayMetrics = buildTodayMetrics(unseenCount, previewRows, openTasks);
  const commandSuggestions = buildCommandSuggestions(previewRows, openTaskCount);
  const patientCases = buildPatientCases(previewRows);
  const relayLines = buildRelayActivity(relayConversations, activityEvents, openTasks);
  const taskRows = buildTaskPreviews(openTasks);

  return (
    <div className="yd-cockpit yd-cockpit-desktop hidden md:flex md:flex-col" aria-label="Praxis Cockpit">
      <AtlasTodayImportant cards={todayMetrics} />
      <AtlasPatientCases cases={patientCases} />
      <AtlasCommandHero suggestions={commandSuggestions} />
      <div className="yd-cockpit-grid">
        <AtlasRelayActivity lines={relayLines} />
        <AtlasCockpitTasks tasks={taskRows} />
      </div>
      <AtlasCockpitActivity events={activityEvents} />
    </div>
  );
}
