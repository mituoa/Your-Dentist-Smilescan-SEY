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
  buildTodayImportant,
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

/** Mobile — 5 Sekunden zwischen Patienten: Command → Wichtig → Fälle → Relay → Aufgaben. */
export function AtlasMobileWorkspace({
  previewRows,
  openTasks,
  relayConversations,
  activityEvents,
}: AtlasMobileWorkspaceProps) {
  const openTaskCount = openTasks?.length ?? 0;
  const todayCards = buildTodayImportant(previewRows, openTasks);
  const commandSuggestions = buildCommandSuggestions(previewRows, openTaskCount);
  const patientCases = buildPatientCases(previewRows);
  const relayLines = buildRelayActivity(relayConversations, activityEvents, openTasks);
  const taskRows = buildTaskPreviews(openTasks);

  return (
    <div className="yd-cockpit yd-cockpit-mobile md:hidden" aria-label="Praxis Cockpit">
      <AtlasCommandHero suggestions={commandSuggestions} compact />
      <AtlasTodayImportant cards={todayCards} />
      <AtlasPatientCases cases={patientCases} />
      <AtlasRelayActivity lines={relayLines} />
      <AtlasCockpitTasks tasks={taskRows} />
      <AtlasCockpitActivity events={activityEvents} />
    </div>
  );
}
