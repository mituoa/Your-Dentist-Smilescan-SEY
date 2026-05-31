import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  DashboardAmbientCharts,
  DashboardAmbientHeader,
  DashboardAmbientKpis,
  DashboardAmbientSubmissions,
} from "@/components/dashboard/hc/dashboard-ambient-sections";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { DashboardMobileShell } from "@/components/dashboard/hc/dashboard-mobile-shell";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcPracticeStatus } from "@/components/dashboard/hc/practice-status";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import { HcStatCard } from "@/components/dashboard/hc/stat-card";
import {
  buildNewSubmissionsWorkContext,
  buildOpenTasksWorkContext,
} from "@/lib/dashboard/kpi-work-context";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import {
  getTotalUnseenSubmissions,
  getTotalSubmissionsCount,
  getOpenTasks,
  getWeeklySubmissionCounts,
  getRecentSubmissionsPreview,
  getDashboardPriorityItems,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
import { DashboardAssistHydration } from "@/components/command-ai/dashboard-assist-hydration";
import {
  buildSubmissionPreparation,
  countPreparedAwaitingReview,
  countTasksNeedingDecision,
} from "@/lib/command-ai/submission-preparation";
import { YD } from "@/lib/design/yd-design-tokens";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";

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
    .select("display_name, photo_url, practice_phone, appointment_link")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (profileError) {
    logDashboardDbFailure("profile_data_select_failed", profileError);
  }

  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "Team";
  const doctorLabel = cockpitDoctorLabel(displayName);
  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE_NAME)?.value);
  // @ts-expect-error - workspaces is joined
  const workspaceName = workspace.workspaces?.name || "Praxis";

  const [unseenRes, totalRes, tasksRes, weeklyRes, previewRes, priorityRes] =
    await Promise.all([
      getTotalUnseenSubmissions(workspaceId),
      getTotalSubmissionsCount(workspaceId),
      getOpenTasks(workspaceId),
      getWeeklySubmissionCounts(workspaceId),
      getRecentSubmissionsPreview(workspaceId),
      getDashboardPriorityItems(workspaceId, 6),
    ]);

  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const totalCount = totalRes.ok ? totalRes.count : null;
  const seenCount =
    totalCount !== null && unseenCount !== null
      ? Math.max(0, totalCount - unseenCount)
      : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const openTaskCount = openTasks?.length ?? 0;
  const tasksNeedingDecision = openTasks ? countTasksNeedingDecision(openTasks) : null;
  const weeklyCounts = weeklyRes.ok ? weeklyRes.counts : null;
  const previewRows = previewRes.ok ? previewRes.rows : null;
  const priorityItems = priorityRes.ok ? priorityRes.items : null;

  const newSubmissionsContext = buildNewSubmissionsWorkContext(priorityItems, previewRows);
  const openTasksContext = buildOpenTasksWorkContext(openTasks);
  const nextTaskLabel = openTasks?.[0]?.content ?? null;

  const photoCountBySubmission = new Map(
    (priorityItems ?? []).map((item) => [item.id, item.photo_count] as const)
  );

  const preparationInputs = (previewRows ?? []).map((row) => ({
    id: row.id,
    patient_name: row.patient_name,
    patient_notes: row.patient_notes,
    seen_at: row.seen_at,
    photo_count: photoCountBySubmission.get(row.id) ?? 0,
  }));

  const preparedAwaitingCount =
    previewRows === null || priorityRes.ok === false
      ? null
      : countPreparedAwaitingReview(preparationInputs);

  const preparationById = Object.fromEntries(
    preparationInputs.map((input) => [input.id, buildSubmissionPreparation(input)])
  );

  const practicePhone = profileData?.practice_phone ?? null;
  const appointmentUrl = profileData?.appointment_link ?? null;

  const dashboardOverviewIncomplete =
    !!profileError ||
    !unseenRes.ok ||
    !totalRes.ok ||
    !tasksRes.ok ||
    !previewRes.ok ||
    !priorityRes.ok;

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

      <DashboardAssistHydration
        patients={(priorityItems ?? previewRows ?? []).map((p) => ({
          id: p.id,
          patient_name: p.patient_name,
          patient_notes: p.patient_notes,
        }))}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
      />

      <DashboardMobileShell
        greeting={greeting}
        displayName={doctorLabel}
        pendingApprovals={unseenCount}
        openTaskCount={openTaskCount}
        weeklyCounts={weeklyCounts}
        unseenCount={unseenCount}
        seenCount={seenCount}
        previewRows={previewRows}
      />

      <div className="hidden md:contents">
        <DashboardAmbientHeader>
          <DashboardHeader
            greeting={greeting}
            displayName={doctorLabel}
            subtitle={subtitle}
            email={user.email || ""}
            workspaceName={workspaceName}
            role="doctor"
            initialTheme={theme}
            avatarUrl={profileData?.photo_url ?? null}
            inboxCount={unseenCount && unseenCount > 0 ? unseenCount : undefined}
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
          <div className="yd-dash-zone yd-dash-zone--kpis yd-dash-kpi-row grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            <div className="flex min-w-0">
              <HcStatCard
                href="/inbox"
                title="Neue Einsendungen"
                value={unseenCount === null ? "—" : unseenCount}
                iconName="clipboard-list"
                footnote="Patientenfälle zur Sichtung"
                workContext={newSubmissionsContext}
              />
            </div>
            <div className="flex min-w-0">
              <HcStatCard
                href="/inbox"
                title="Vorbereitet durch AI"
                value={preparedAwaitingCount === null ? "—" : preparedAwaitingCount}
                iconName="sparkles"
                footnote="Antworten & Aktionen bereit"
                hoverHint="Assistenz hat Entwürfe und nächste Schritte vorbereitet — zur Freigabe im Tracker prüfen."
              />
            </div>
            <div className="flex min-w-0">
              <HcStatCard
                href="/relay"
                title="Praxisaufgaben"
                value={tasksNeedingDecision === null ? openTaskCount : tasksNeedingDecision}
                iconName="list-todo"
                footnote="Benötigen Entscheidung"
                workContext={openTasksContext}
              />
            </div>
          </div>
        </DashboardAmbientKpis>

        <DashboardAmbientSubmissions>
          <div className="yd-dash-zone yd-dash-zone--submissions min-w-0">
            <HcRecentTable rows={previewRows} preparationById={preparationById} />
          </div>
        </DashboardAmbientSubmissions>

        <DashboardAmbientCharts>
          <div className="yd-dash-zone yd-dash-zone--charts yd-dash-zone--secondary grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="min-w-0 lg:col-span-8">
              <HcAnalyticsBars counts={weeklyCounts} />
            </div>
            <div className="min-w-0 lg:col-span-4">
              <HcPracticeStatus
                unseen={unseenCount}
                seen={seenCount}
                openTaskCount={openTaskCount}
                preparedAwaitingCount={preparedAwaitingCount}
                nextTaskLabel={nextTaskLabel}
              />
            </div>
          </div>
        </DashboardAmbientCharts>
      </div>
    </div>
  );
}
