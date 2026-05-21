import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, ClipboardList, Users } from "lucide-react";

import {
  DashboardAmbientCharts,
  DashboardAmbientHeader,
  DashboardAmbientKpis,
  DashboardAmbientLower,
  DashboardAmbientOps,
} from "@/components/dashboard/hc/dashboard-ambient-sections";
import { DashboardActivityStream } from "@/components/dashboard/hc/dashboard-activity-stream";
import { DashboardCommandStrip } from "@/components/dashboard/hc/dashboard-command-strip";
import { DashboardPracticeFlow } from "@/components/dashboard/hc/dashboard-practice-flow";
import { DashboardProgressiveSection } from "@/components/dashboard/hc/dashboard-progressive-section";
import { DashboardRelayCommsPanel } from "@/components/dashboard/hc/dashboard-relay-comms-panel";
import { DashboardRelayOpsPanel } from "@/components/dashboard/hc/dashboard-relay-ops-panel";
import { DashboardTeamPulse } from "@/components/dashboard/hc/dashboard-team-pulse";
import { DashboardWorkzone } from "@/components/dashboard/hc/dashboard-workzone";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcDistributionArc } from "@/components/dashboard/hc/distribution-arc";
import { HcMonthCalendar } from "@/components/dashboard/hc/month-calendar";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getTotalSubmissionsCount,
  getOpenTasks,
  getWeeklySubmissionCounts,
  getRecentSubmissionsPreview,
  getRecentActivity,
  getDashboardRoutineTasks,
  getDashboardTeamPulse,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
import { getRelayConversationsForUser } from "@/lib/queries/relay-messages";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import {
  NewSubmissionFloatingPreview,
  UnreadCasesFloatingPreview,
} from "@/components/dashboard/hc/dashboard-floating-preview";
import { formatDoctorDisplayName } from "@/lib/format-doctor-display-name";
import { YD } from "@/lib/design/yd-design-tokens";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const workspace = await requireApprovedWorkspace();
  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const workspaceId = workspace.workspace_id;
  // @ts-expect-error - workspaces joined
  const workspaceName = workspace.workspaces?.name || "Praxis";

  const supabase = await createClient();
  const { data: profileData, error: profileError } = await supabase
    .from("profile_data")
    .select("display_name, photo_url")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (profileError) {
    logDashboardDbFailure("profile_data_select_failed", profileError);
  }

  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "Team";
  const doctorDisplayName = formatDoctorDisplayName(displayName);

  const [
    newRes,
    unseenRes,
    totalRes,
    tasksRes,
    weeklyRes,
    previewRes,
    inboxBadgeRes,
    activityRes,
    routinesRes,
    teamRes,
    relayConversations,
  ] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getTotalSubmissionsCount(workspaceId),
    getOpenTasks(workspaceId),
    getWeeklySubmissionCounts(workspaceId),
    getRecentSubmissionsPreview(workspaceId),
    countUnseenInboxSubmissions(workspaceId),
    getRecentActivity(workspaceId),
    getDashboardRoutineTasks(workspaceId),
    getDashboardTeamPulse(workspaceId),
    getRelayConversationsForUser(workspaceId, user.id).catch(() => []),
  ]);

  const newCount = newRes.ok ? newRes.count : null;
  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const totalCount = totalRes.ok ? totalRes.count : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const openTaskCount = openTasks?.length ?? 0;
  const routines = routinesRes.ok ? routinesRes.routines : null;
  const routineCount = routines?.length ?? 0;
  const activityEvents = activityRes.ok ? activityRes.events : null;
  const weeklyCounts = weeklyRes.ok ? weeklyRes.counts : null;
  const previewRows = previewRes.ok ? previewRes.rows : null;
  const relayUnread = relayConversations.reduce((sum, c) => sum + c.unread_count, 0);

  const now = Date.now();
  const reminderCount =
    openTasks?.filter((t) => {
      if (!t.remind_at) return false;
      const due = new Date(t.remind_at).getTime();
      const week = 7 * 24 * 60 * 60 * 1000;
      return due <= now + week;
    }).length ?? 0;

  const commandHints: string[] = [];
  if (unseenCount !== null && unseenCount > 0) {
    commandHints.push(
      `Priorität im Eingang: ${unseenCount} ${unseenCount === 1 ? "Fall" : "Fälle"} warten auf Sichtung.`
    );
  }
  if (relayUnread > 0) {
    commandHints.push(
      `${relayUnread} interne ${relayUnread === 1 ? "Nachricht" : "Nachrichten"} — Übergaben im Blick behalten.`
    );
  }
  if (openTaskCount > 0) {
    commandHints.push(
      `${openTaskCount} offene ${openTaskCount === 1 ? "Aufgabe" : "Aufgaben"} — nächster Schritt in Relay.`
    );
  }
  if (routineCount > 0) {
    commandHints.push(
      `${routineCount} ${routineCount === 1 ? "Routine" : "Routinen"} aktiv — Erinnerungen strukturiert.`
    );
  }
  commandHints.push(COMMAND_AI_PUBLIC.showcaseAssist);
  const latestPreview = previewRows?.[0] ?? null;
  const latestUnread =
    previewRows?.find((r) => !r.seen_at) ?? latestPreview;
  const inboxCount =
    inboxBadgeRes.ok && inboxBadgeRes.count > 0 ? inboxBadgeRes.count : undefined;

  const seenCount =
    totalCount !== null && unseenCount !== null
      ? Math.max(0, totalCount - unseenCount)
      : null;

  const dashboardOverviewIncomplete =
    !!profileError ||
    !newRes.ok ||
    !unseenRes.ok ||
    !totalRes.ok ||
    !tasksRes.ok;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="yd-dashboard yd-dashboard--structured relative mx-auto w-full min-w-0 pb-10"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--a" aria-hidden />
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--b" aria-hidden />

      <DashboardWorkzone
        rail="Überblick"
        title="Praxisüberblick"
        hint={`${todayLabel}`}
        className="yd-dash-band--overview"
      >
        <DashboardAmbientHeader>
          <DashboardHeader
            greeting={greeting}
            displayName={doctorDisplayName}
            subtitle="Eingänge, Relay und Aufgaben im Überblick"
            inboxCount={inboxCount}
          />
        </DashboardAmbientHeader>

        {dashboardOverviewIncomplete ? (
          <p
            className="yd-dash-meta mb-4 max-w-2xl normal-case tracking-normal"
            style={{ color: YD.text.secondary }}
            role="status"
          >
            Einige Kennzahlen konnten nicht geladen werden —{" "}
            <Link href="/inbox" className="font-medium hover:underline" style={{ color: YD.accent.core }}>
              Posteingang
            </Link>
            {" · "}
            <Link href="/my-tasks" className="font-medium hover:underline" style={{ color: YD.accent.core }}>
              Aufgaben
            </Link>
          </p>
        ) : null}

        <DashboardAmbientKpis>
          <div className="yd-dash-deck yd-dash-deck--kpi">
            <div className="yd-dash-zone yd-dash-zone--kpis grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
              <div className="yd-dash-kpi-hero-slot min-w-0 lg:col-span-5">
            <HcStatCard
              tone="primary"
              hero
              lift
              glow
              title="Ungelesene Fälle"
              value={unseenCount === null ? "—" : unseenCount}
              icon={ClipboardList}
              footnote={
                unseenCount === 0
                  ? "Posteingang ist auf dem aktuellen Stand"
                  : "Priorität für klinische Sichtung"
              }
              footnotePositive={unseenCount === 0}
              floatingPreview={
                unseenCount !== null && unseenCount > 0 ? (
                  <UnreadCasesFloatingPreview
                    count={unseenCount}
                    latest={latestUnread}
                  />
                ) : undefined
              }
              metricA={{
                label: "Gelesen",
                value: seenCount === null ? "—" : seenCount,
              }}
              metricB={{
                label: "Gesamt",
                value: totalCount === null ? "—" : totalCount,
              }}
            />
              </div>
              <div className="yd-dash-kpi-compact-slot grid min-w-0 grid-cols-2 gap-2.5 sm:col-span-2 sm:gap-3 lg:contents lg:gap-6">
                <div className="min-w-0 lg:col-span-3">
              <HcStatCard
                tone="quiet"
                title="Einsendungen gesamt"
                value={totalCount === null ? "—" : totalCount}
                icon={Users}
                footnote={
                  newCount !== null && newCount > 0
                    ? `${newCount} neu in 24 Stunden`
                    : "Aktueller Bestand"
                }
                floatingPreview={
                  newCount !== null && newCount > 0 && latestPreview ? (
                    <NewSubmissionFloatingPreview row={latestPreview} />
                  ) : undefined
                }
                metricA={{
                  label: "Neu (24h)",
                  value: newCount === null ? "—" : newCount,
                }}
                metricB={{
                  label: "Ungelesen",
                  value: unseenCount === null ? "—" : unseenCount,
                }}
              />
                </div>
                <div className="min-w-0 lg:col-span-4">
                  <HcStatCard
                    tone="quiet"
                    title="Offene Aufgaben"
                value={openTasks === null ? "—" : openTaskCount}
                icon={CalendarCheck}
                footnote="Relay · Praxisworkflow"
                footnotePositive={false}
                metricA={{
                  label: "Relay",
                  value: openTaskCount,
                }}
                metricB={{
                  label: "Status",
                  value: openTasks === null ? "—" : "Offen",
                }}
                  />
                </div>
              </div>
            </div>
          </div>
        </DashboardAmbientKpis>
      </DashboardWorkzone>

      <DashboardWorkzone
        rail="Arbeitsfläche"
        title="Aktiver Praxisbetrieb"
        hint="Koordination, Kommunikation, Übergaben — heute"
        className="yd-dash-band--operations"
      >
        <DashboardAmbientOps>
          <DashboardPracticeFlow
            unseenCount={unseenCount}
            openTaskCount={openTaskCount}
            routineCount={routineCount}
            relayUnread={relayUnread}
            reminderCount={reminderCount}
          />

          <div className="yd-dash-deck yd-dash-deck--work">
            <DashboardProgressiveSection
              title="Module"
              hint="Relay · Aktivität · Assistenz · Team"
              defaultOpen
              mobileAlwaysOpen
            >
              <div className="yd-dash-zone yd-dash-ops-grid">
                <div className="yd-dash-ops-grid__relay min-w-0 lg:col-span-7">
                  <DashboardRelayOpsPanel tasks={openTasks} routines={routines} />
                </div>
                <div className="yd-dash-ops-grid__comms min-w-0 lg:col-span-5">
                  <DashboardRelayCommsPanel conversations={relayConversations} />
                </div>
                <div className="yd-dash-ops-grid__activity min-w-0 lg:col-span-4">
                  <DashboardActivityStream events={activityEvents} />
                </div>
                <div className="yd-dash-ops-grid__command min-w-0 lg:col-span-8">
                  <DashboardCommandStrip hints={commandHints.slice(0, 4)} />
                </div>
                <div className="yd-dash-ops-grid__team min-w-0 lg:col-span-12">
                  <DashboardTeamPulse
                    workspaceName={workspaceName}
                    memberCount={teamRes.ok ? teamRes.memberCount : null}
                    teamCount={teamRes.ok ? teamRes.teamCount : null}
                    openTaskCount={openTaskCount}
                    unseenInbox={unseenCount}
                  />
                </div>
              </div>
            </DashboardProgressiveSection>
          </div>
        </DashboardAmbientOps>
      </DashboardWorkzone>

      <DashboardWorkzone
        rail="Archiv"
        title="Verlauf & Einsendungen"
        hint="Statistik und letzte Fälle — bei Bedarf vertiefen"
        className="yd-dash-band--records"
      >
        <DashboardAmbientCharts>
          <div className="yd-dash-deck yd-dash-deck--charts mb-5">
            <DashboardProgressiveSection
              title="Verlauf & Verteilung"
              hint="Statistik — bei Bedarf öffnen"
              defaultOpen={false}
            >
              <div className="yd-dash-zone grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
                <div className="min-w-0 lg:col-span-8">
                  <HcAnalyticsBars
                    counts={weeklyCounts}
                    totalLabel="Letzte 7 Tage — Einsendungen"
                  />
                </div>
                <div className="min-w-0 lg:col-span-4 lg:pt-1">
                  <HcDistributionArc
                    unseen={unseenCount}
                    seen={seenCount}
                    total={totalCount}
                  />
                </div>
              </div>
            </DashboardProgressiveSection>
          </div>
        </DashboardAmbientCharts>

        <DashboardAmbientLower>
          <div className="yd-dash-deck yd-dash-deck--records">
            <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
              <div className="min-w-0 lg:col-span-8 lg:order-1">
                <HcRecentTable rows={previewRows} />
              </div>
              <div className="min-w-0 lg:col-span-4 lg:order-2">
                <DashboardProgressiveSection title="Kalender" hint="Terminüberblick" defaultOpen>
                  <HcMonthCalendar />
                </DashboardProgressiveSection>
              </div>
            </div>
          </div>
        </DashboardAmbientLower>
      </DashboardWorkzone>
    </div>
  );
}
