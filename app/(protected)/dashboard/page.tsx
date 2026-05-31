import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Sparkles, UserPlus } from "lucide-react";

import {
  DashboardAmbientCharts,
  DashboardAmbientHeader,
  DashboardAmbientKpis,
  DashboardAmbientLower,
  DashboardAmbientToday,
} from "@/components/dashboard/hc/dashboard-ambient-sections";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { DashboardTodayPriority } from "@/components/dashboard/hc/dashboard-today-priority";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcDistributionArc } from "@/components/dashboard/hc/distribution-arc";
import { HcMonthCalendar } from "@/components/dashboard/hc/month-calendar";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import { KpiHoverPreview } from "@/components/dashboard/hc/kpi-hover-preview";
import { KpiReviewHoverPreview } from "@/components/dashboard/hc/kpi-review-hover-preview";
import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import {
  buildHeroInlinePreview,
  buildReviewHoverPatients,
} from "@/lib/dashboard/kpi-preview-helpers";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getTotalSubmissionsCount,
  getOpenTasks,
  getWeeklySubmissionCounts,
  getRecentSubmissionsPreview,
  getDashboardPriorityItems,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { YD } from "@/lib/design/yd-design-tokens";

export const dynamic = "force-dynamic";

function buildNewCasesHover(newCount: number | null): string[] {
  const n = newCount ?? 0;
  return [
    n > 0 ? `${n} neue Anfragen` : "keine neuen Anfragen",
    "offene Patientenkommunikation",
    n > 0 ? "Eingang heute" : "ruhiger Tagesverlauf",
  ];
}

function buildAssistHover(openTasks: number, practiceClear: boolean): string[] {
  if (practiceClear) {
    return ["Antworten erstellt", "Aufgaben geprüft", "Prozesse aktiv"];
  }
  return [
    "Antworten erstellt",
    openTasks > 0 ? `${openTasks} Aufgaben offen` : "Aufgaben geprüft",
    "Prozesse aktiv",
  ];
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
  const doctorLabel = cockpitDoctorLabel(displayName);

  const [
    newRes,
    unseenRes,
    totalRes,
    tasksRes,
    weeklyRes,
    previewRes,
    inboxBadgeRes,
    priorityRes,
  ] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getTotalSubmissionsCount(workspaceId),
    getOpenTasks(workspaceId),
    getWeeklySubmissionCounts(workspaceId),
    getRecentSubmissionsPreview(workspaceId),
    countUnseenInboxSubmissions(workspaceId),
    getDashboardPriorityItems(workspaceId, 5),
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
  const priorityItems = priorityRes.ok ? priorityRes.items : null;
  const inboxCount =
    inboxBadgeRes.ok && inboxBadgeRes.count > 0 ? inboxBadgeRes.count : undefined;

  const practiceClear =
    (unseenCount ?? 0) === 0 && openTaskCount === 0 && (newCount ?? 0) === 0;

  const dashboardOverviewIncomplete =
    !!profileError ||
    !newRes.ok ||
    !unseenRes.ok ||
    !totalRes.ok ||
    !tasksRes.ok ||
    !priorityRes.ok;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  const newCasesFootnote =
    newCount !== null && newCount > 0
      ? `${newCount} neue Anfragen`
      : "Keine neuen Anfragen";

  const heroInline =
    priorityItems && unseenCount !== null
      ? buildHeroInlinePreview(priorityItems, unseenCount)
      : { names: [] as string[], moreLabel: undefined as string | undefined };

  const reviewHoverPatients = buildReviewHoverPatients(priorityItems ?? []);

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
          pendingApprovals={unseenCount}
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
          Einige Bereiche konnten nicht geladen werden — bitte Seite erneut laden.
        </p>
      ) : null}

      <DashboardAmbientKpis>
        <div className="yd-dash-zone yd-dash-zone--kpis grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          <div className="min-w-0 order-1 sm:col-span-2 lg:col-span-6">
            <HcStatCard
              primary
              href="/inbox"
              title="Bereit zur Prüfung"
              value={unseenCount === null ? "—" : unseenCount}
              icon={ClipboardList}
              footnote="Antworten vorbereitet"
              footnotePositive={(unseenCount ?? 0) > 0}
              inlinePreview={heroInline}
              hoverPreview={
                <KpiReviewHoverPreview patients={reviewHoverPatients} ctaHref="/inbox" />
              }
            />
          </div>
          <div className="min-w-0 order-2 sm:col-span-1 lg:col-span-3">
            <HcStatCard
              title="Neue Patientenfälle"
              value={newCount === null ? "—" : newCount}
              icon={UserPlus}
              footnote={newCasesFootnote}
              footnotePositive={newCount === 0}
              hoverPreview={<KpiHoverPreview lines={buildNewCasesHover(newCount)} />}
            />
          </div>
          <div className="min-w-0 order-3 sm:col-span-1 lg:col-span-3">
            <HcStatCard
              title="Praxis Assistenz"
              value={practiceClear ? "✓ Aktiv" : openTaskCount}
              icon={Sparkles}
              footnote={practiceClear ? "Alle Abläufe bereit" : "Assistenz begleitet"}
              footnotePositive={practiceClear}
              hoverPreview={
                <KpiHoverPreview lines={buildAssistHover(openTaskCount, practiceClear)} />
              }
            />
          </div>
        </div>
      </DashboardAmbientKpis>

      <DashboardAmbientToday>
        <div className="yd-dash-zone yd-dash-zone--today">
          <DashboardTodayPriority items={priorityItems} readyCount={unseenCount} />
        </div>
      </DashboardAmbientToday>

      <DashboardAmbientCharts>
        <div className="yd-dash-zone yd-dash-zone--charts yd-dash-zone--secondary grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-8">
            <HcAnalyticsBars counts={weeklyCounts} totalLabel="Patientenanfragen · 7 Tage" />
          </div>
          <div className="min-w-0 lg:col-span-4">
            <HcDistributionArc unseen={unseenCount} seen={seenCount} total={totalCount} />
          </div>
        </div>
      </DashboardAmbientCharts>

      <DashboardAmbientLower>
        <div className="yd-dash-zone yd-dash-zone--lower yd-dash-zone--secondary grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
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
