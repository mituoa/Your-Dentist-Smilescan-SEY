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
import { greetingDoctorLabel } from "@/lib/format-doctor-display-name";
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
import { YD } from "@/lib/design/yd-design-tokens";

export const dynamic = "force-dynamic";

function buildSubtitle(readyCount: number | null): string {
  if (readyCount === null) return "Überblick wird geladen…";
  if (readyCount === 0) return "Keine Freigaben offen — Posteingang ist auf dem aktuellen Stand.";
  if (readyCount === 1) return "1 Antwort benötigt Ihre Freigabe.";
  return `${readyCount} Antworten benötigen Ihre Freigabe.`;
}

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
  const doctorLabel = greetingDoctorLabel(displayName);

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
  const seenCount =
    totalCount !== null && unseenCount !== null
      ? Math.max(0, totalCount - unseenCount)
      : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const openTaskCount = openTasks?.length ?? 0;
  const weeklyCounts = weeklyRes.ok ? weeklyRes.counts : null;
  const previewRows = previewRes.ok ? previewRes.rows : null;
  const inboxCount =
    inboxBadgeRes.ok && inboxBadgeRes.count > 0 ? inboxBadgeRes.count : undefined;

  const dashboardOverviewIncomplete =
    !!profileError || !newRes.ok || !unseenRes.ok || !totalRes.ok || !tasksRes.ok;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div
      className="yd-dashboard yd-dashboard--reference relative mx-auto w-full min-w-0 pb-8"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--a" aria-hidden />
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--b" aria-hidden />

      <DashboardAmbientHeader>
        <DashboardHeader
          greeting={greeting}
          displayName={doctorLabel}
          subtitle={buildSubtitle(unseenCount)}
          email={user.email || ""}
          workspaceName="Praxis"
          avatarUrl={profileData?.photo_url ?? null}
          profileDisplayName={profileData?.display_name ?? null}
          inboxCount={inboxCount}
        />
      </DashboardAmbientHeader>

      {dashboardOverviewIncomplete ? (
        <p
          className="yd-dash-meta mb-3 max-w-2xl normal-case tracking-normal"
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
        <div className="yd-dash-zone yd-dash-zone--kpis grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <HcStatCard
            tone="primary"
            title="Ungelesene Fälle"
            value={unseenCount === null ? "—" : unseenCount}
            icon={ClipboardList}
            footnote={
              unseenCount === 0
                ? "Posteingang ist auf dem aktuellen Stand"
                : "Priorität für Ihre Prüfung"
            }
            footnotePositive={unseenCount === 0}
            metricA={{ label: "Gelesen", value: seenCount === null ? "—" : seenCount }}
            metricB={{ label: "Gesamt", value: totalCount === null ? "—" : totalCount }}
          />
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
            footnotePositive={newCount === 0}
            metricA={{ label: "Neu (24h)", value: newCount === null ? "—" : newCount }}
            metricB={{ label: "Ungelesen", value: unseenCount === null ? "—" : unseenCount }}
          />
          <HcStatCard
            tone="quiet"
            title="Offene Aufgaben"
            value={openTasks === null ? "—" : openTaskCount}
            icon={CalendarCheck}
            footnote={openTaskCount > 0 ? "Relay · Praxisworkflow" : "Keine offenen Aufgaben"}
            footnotePositive={openTaskCount === 0}
            metricA={{ label: "Relay", value: openTaskCount }}
            metricB={{
              label: "Status",
              value: openTasks === null ? "—" : openTaskCount > 0 ? "Offen" : "Aktuell",
            }}
          />
        </div>
      </DashboardAmbientKpis>

      <DashboardAmbientCharts>
        <div className="yd-dash-zone yd-dash-zone--charts grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-8">
            <HcAnalyticsBars counts={weeklyCounts} totalLabel="Letzte 7 Tage" />
          </div>
          <div className="min-w-0 lg:col-span-4">
            <HcDistributionArc unseen={unseenCount} seen={seenCount} total={totalCount} />
          </div>
        </div>
      </DashboardAmbientCharts>

      <DashboardAmbientLower>
        <div className="yd-dash-zone yd-dash-zone--lower grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-4">
            <HcMonthCalendar />
          </div>
          <div className="min-w-0 lg:col-span-8">
            <HcRecentTable rows={previewRows} />
          </div>
        </div>
      </DashboardAmbientLower>
    </div>
  );
}
