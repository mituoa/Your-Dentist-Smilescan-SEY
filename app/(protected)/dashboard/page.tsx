import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, ClipboardList, Users } from "lucide-react";

import {
  DashboardAmbientCharts,
  DashboardAmbientHeader,
  DashboardAmbientKpis,
  DashboardAmbientLower,
} from "@/components/dashboard/hc/dashboard-ambient-sections";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcDistributionArc } from "@/components/dashboard/hc/distribution-arc";
import { HcMonthCalendar } from "@/components/dashboard/hc/month-calendar";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getTotalSubmissionsCount,
  getOpenTasks,
  getWeeklySubmissionCounts,
  getRecentSubmissionsPreview,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
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
  ] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getTotalSubmissionsCount(workspaceId),
    getOpenTasks(workspaceId),
    getWeeklySubmissionCounts(workspaceId),
    getRecentSubmissionsPreview(workspaceId),
    countUnseenInboxSubmissions(workspaceId),
  ]);

  const newCount = newRes.ok ? newRes.count : null;
  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const totalCount = totalRes.ok ? totalRes.count : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const openTaskCount = openTasks?.length ?? 0;
  const weeklyCounts = weeklyRes.ok ? weeklyRes.counts : null;
  const previewRows = previewRes.ok ? previewRes.rows : null;
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
      className="yd-dashboard relative mx-auto w-full min-w-0 pb-10"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--a" aria-hidden />
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--b" aria-hidden />

      <DashboardAmbientHeader>
        <DashboardHeader
          greeting={greeting}
          displayName={doctorDisplayName}
          subtitle={`Ruhiger Überblick für ${workspaceName} — ${todayLabel}`}
          email={user.email || ""}
          workspaceName={workspaceName}
          avatarUrl={profileData?.photo_url ?? null}
          profileDisplayName={profileData?.display_name ?? null}
          inboxCount={inboxCount}
        />
      </DashboardAmbientHeader>

      {dashboardOverviewIncomplete ? (
        <p
          className="yd-dash-meta mb-8 max-w-2xl normal-case tracking-normal"
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
        <div className="yd-dash-zone yd-dash-zone--kpis grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
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
          <div className="min-w-0 lg:col-span-5">
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
          <div className="min-w-0 sm:col-span-2 lg:col-span-4">
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
      </DashboardAmbientKpis>

      <DashboardAmbientCharts>
        <div className="yd-dash-zone grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
          <div className="min-w-0 lg:col-span-8">
            <HcAnalyticsBars
              counts={weeklyCounts}
              totalLabel="Letzte 7 Tage — Einsendungen"
            />
          </div>
          <div className="min-w-0 lg:col-span-4 lg:pt-3">
            <HcDistributionArc
              unseen={unseenCount}
              seen={seenCount}
              total={totalCount}
            />
          </div>
        </div>
      </DashboardAmbientCharts>

      <DashboardAmbientLower>
        <div className="grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-8 lg:order-1">
            <HcRecentTable rows={previewRows} />
          </div>
          <div className="min-w-0 lg:col-span-4 lg:order-2 lg:pt-4">
            <HcMonthCalendar />
          </div>
        </div>
      </DashboardAmbientLower>
    </div>
  );
}
