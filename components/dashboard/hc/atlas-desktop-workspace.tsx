import Link from "next/link";
import { Clock } from "lucide-react";

import { AtlasCommandHero } from "@/components/dashboard/hc/atlas-command-hero";
import { AtlasOpsStrip } from "@/components/dashboard/hc/atlas-ops-strip";
import { AtlasPriorityFeed } from "@/components/dashboard/hc/atlas-priority-feed";
import { DashboardActivityStream } from "@/components/dashboard/hc/dashboard-activity-stream";
import { DashboardPracticeFlow } from "@/components/dashboard/hc/dashboard-practice-flow";
import { DashboardRelayCommsPanel } from "@/components/dashboard/hc/dashboard-relay-comms-panel";
import { DashboardRelayOpsPanel } from "@/components/dashboard/hc/dashboard-relay-ops-panel";
import { DashboardWorkzone } from "@/components/dashboard/hc/dashboard-workzone";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";
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

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `vor ${h} Std`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function patientLabel(row: SubmissionPreviewRow): string {
  return row.patient_name?.trim() || row.patient_email?.trim() || "Patient";
}

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

/** Desktop — Command Center mit Arbeitszonen, ohne Mobile zu berühren. */
export function AtlasDesktopWorkspace({
  unseenCount,
  previewRows,
  openTasks,
  routines,
  relayConversations,
  relayUnread,
  reminderCount,
  activityEvents,
}: AtlasDesktopWorkspaceProps) {
  const openTaskCount = openTasks?.length ?? 0;
  const routineCount = routines?.length ?? 0;
  const priorityItems = buildPriorityFeed(previewRows, openTasks);
  const commandSuggestions = buildCommandSuggestions(previewRows, openTaskCount);

  const intakeRows = [...(previewRows ?? [])].sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1;
    if (a.seen_at && !b.seen_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const unreadRows = intakeRows.filter((r) => !r.seen_at).slice(0, 8);
  const recentSeen = intakeRows.filter((r) => r.seen_at).slice(0, 3);

  const attentionLead =
    unseenCount !== null && unseenCount > 0
      ? `${unseenCount} ${unseenCount === 1 ? "Eingang" : "Eingänge"}`
      : WORKSPACE_COPY.allCurrent;

  return (
    <div className="yd-atlas-desktop hidden md:block" aria-label={WORKSPACE_COPY.today}>
      <AtlasCommandHero suggestions={commandSuggestions} />

      <div className="yd-atlas-tier yd-atlas-tier--attention">
        <p className="yd-atlas-attention-lead" role="status">
          {attentionLead}
        </p>
        <AtlasPriorityFeed items={priorityItems} />
      </div>

      <div className="yd-command-center yd-command-center--workspace">
        <div className="yd-command-center-main">
          <DashboardWorkzone rail="Eingänge" title="Patientenfälle" className="yd-atlas-zone">
            <div className="yd-atlas-intake-body">
              {unreadRows.length > 0 ? (
                <ul className="yd-atlas-queue" aria-label="Zu sichten">
                  {unreadRows.map((row) => (
                    <li key={row.id}>
                      <Link
                        href={`/inbox/${row.id}`}
                        className="yd-atlas-queue-row yd-atlas-queue-row--waiting"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="yd-atlas-queue-name">{patientLabel(row)}</p>
                          <p className="yd-atlas-queue-meta">
                            <Clock className="inline h-3 w-3 opacity-60" strokeWidth={1.65} aria-hidden />{" "}
                            {formatRelative(row.created_at)} · zu sichten
                          </p>
                        </div>
                        <span className="yd-atlas-queue-state">Prüfen</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : recentSeen.length === 0 ? (
                <p className="yd-atlas-empty-positive">{WORKSPACE_COPY.allCurrent}</p>
              ) : (
                <p className="yd-atlas-empty-positive yd-atlas-empty-positive--inline">
                  {WORKSPACE_COPY.allCurrent}
                </p>
              )}
              {recentSeen.length > 0 ? (
                <div className="yd-atlas-queue-secondary">
                  <p className="yd-atlas-queue-secondary-label">Zuletzt</p>
                  <ul className="yd-atlas-queue yd-atlas-queue--muted">
                    {recentSeen.map((row) => (
                      <li key={row.id}>
                        <Link href={`/inbox/${row.id}`} className="yd-atlas-queue-row">
                          <div className="min-w-0 flex-1">
                            <p className="yd-atlas-queue-name">{patientLabel(row)}</p>
                            <p className="yd-atlas-queue-meta">{formatRelative(row.created_at)}</p>
                          </div>
                          <span className="yd-atlas-queue-state yd-atlas-queue-state--muted">
                            Offen
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </DashboardWorkzone>
        </div>

        <aside className="yd-command-center-aside" aria-label="Team und Aufgaben">
          <DashboardRelayOpsPanel tasks={openTasks} routines={routines} />
          <DashboardRelayCommsPanel conversations={relayConversations} />
        </aside>
      </div>

      <div className="yd-atlas-tier yd-atlas-tier--today">
        <DashboardActivityStream events={activityEvents} />
      </div>

      <div className="yd-atlas-tier yd-atlas-tier--status">
        <DashboardPracticeFlow
          unseenCount={unseenCount}
          openTaskCount={openTaskCount}
          routineCount={routineCount}
          relayUnread={relayUnread}
          reminderCount={reminderCount}
          compact
        />
        <AtlasOpsStrip
          unseenCount={unseenCount}
          openTaskCount={openTaskCount}
          relayUnread={relayUnread}
          routineCount={routineCount}
          reminderCount={reminderCount}
        />
      </div>
    </div>
  );
}
