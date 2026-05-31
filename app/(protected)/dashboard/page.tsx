import { redirect } from "next/navigation";

import {
  DashboardAmbientCharts,
  DashboardAmbientHeader,
  DashboardAmbientKpis,
  DashboardAmbientSubmissions,
} from "@/components/dashboard/hc/dashboard-ambient-sections";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { DashboardMobileShell } from "@/components/dashboard/hc/dashboard-mobile-shell";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcDistributionArc } from "@/components/dashboard/hc/distribution-arc";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import {
  KPI_HOVER_AKTIVE_FAELLE,
  KPI_HOVER_AUFGABEN,
  KPI_HOVER_EINSENDUNGEN,
} from "@/lib/dashboard/kpi-hover-copy";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import {
  getTotalUnseenSubmissions,
  getTotalSubmissionsCount,
  getOpenTasks,
  getWeeklySubmissionCounts,
  getRecentSubmissionsPreview,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
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
  const doctorLabel = cockpitDoctorLabel(displayName);

  const [unseenRes, totalRes, tasksRes, weeklyRes, previewRes] = await Promise.all([
    getTotalUnseenSubmissions(workspaceId),
    getTotalSubmissionsCount(workspaceId),
    getOpenTasks(workspaceId),
    getWeeklySubmissionCounts(workspaceId),
    getRecentSubmissionsPreview(workspaceId),
  ]);

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

  const dashboardOverviewIncomplete =
    !!profileError ||
    !unseenRes.ok ||
    !totalRes.ok ||
    !tasksRes.ok ||
    !previewRes.ok;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  const subtitle = "Praxis aktiv · Vorgänge und Patienten im Überblick";

  return (
    <div
      className="yd-dashboard yd-dashboard--reference relative mx-auto w-full min-w-0 pb-8"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--a" aria-hidden />
      <div className="yd-dash-ambient-orb yd-dash-ambient-orb--b" aria-hidden />

      <DashboardMobileShell
        greeting={greeting}
        displayName={doctorLabel}
        pendingApprovals={unseenCount}
        openTaskCount={openTaskCount}
        weeklyCounts={weeklyCounts}
        unseenCount={unseenCount}
        seenCount={seenCount}
        totalCount={totalCount}
        previewRows={previewRows}
      />

      <div className="hidden md:contents">
        <DashboardAmbientHeader>
          <DashboardHeader
            greeting={greeting}
            displayName={doctorLabel}
            subtitle={subtitle}
          />
        </DashboardAmbientHeader>

        {dashboardOverviewIncomplete ? (
          <p
            className="yd-dash-meta mb-3 max-w-2xl normal-case tracking-normal"
            style={{ color: YD.text.secondary }}
            role="status"
          >
            Einige Bereiche konnten nicht geladen werden — bitte Seite erneut laden.
          </p>
        ) : null}

        <DashboardAmbientKpis>
          <div className="yd-dash-zone yd-dash-zone--kpis grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
            <div className="flex min-w-0 sm:col-span-1 lg:col-span-4">
              <HcStatCard
                href="/inbox"
                title="Neue Einsendungen"
                value={unseenCount === null ? "—" : unseenCount}
                iconName="clipboard-list"
                footnote="Patientenfälle zur Durchsicht"
                hoverHint={KPI_HOVER_EINSENDUNGEN}
              />
            </div>
            <div className="flex min-w-0 sm:col-span-1 lg:col-span-4">
              <HcStatCard
                href="/inbox"
                title="Aktive Fälle"
                value={seenCount === null ? "—" : seenCount}
                iconName="user-plus"
                footnote="Laufende Patientenprozesse"
                hoverHint={KPI_HOVER_AKTIVE_FAELLE}
              />
            </div>
            <div className="flex min-w-0 sm:col-span-1 lg:col-span-4">
              <HcStatCard
                href="/relay"
                title="Offene Aufgaben"
                value={openTaskCount}
                iconName="list-todo"
                footnote="Praxisworkflow"
                hoverHint={KPI_HOVER_AUFGABEN}
              />
            </div>
          </div>
        </DashboardAmbientKpis>

        <DashboardAmbientSubmissions>
          <div className="yd-dash-zone yd-dash-zone--submissions min-w-0">
            <HcRecentTable rows={previewRows} />
          </div>
        </DashboardAmbientSubmissions>

        <DashboardAmbientCharts>
          <div className="yd-dash-zone yd-dash-zone--charts yd-dash-zone--secondary grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="min-w-0 lg:col-span-8">
              <HcAnalyticsBars counts={weeklyCounts} totalLabel="Einsendungsverlauf · 7 Tage" />
            </div>
            <div className="min-w-0 lg:col-span-4">
              <HcDistributionArc unseen={unseenCount} seen={seenCount} total={totalCount} />
            </div>
          </div>
        </DashboardAmbientCharts>
      </div>
    </div>
  );
}
