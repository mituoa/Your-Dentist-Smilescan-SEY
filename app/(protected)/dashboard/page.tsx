import Link from "next/link";
import { redirect } from "next/navigation";

import { AtlasOperationalCore } from "@/components/dashboard/hc/atlas-operational-core";
import { DashboardHeader } from "@/components/dashboard/hc/dashboard-header";
import { DashboardProgressiveSection } from "@/components/dashboard/hc/dashboard-progressive-section";
import { HcAnalyticsBars } from "@/components/dashboard/hc/analytics-bars";
import { HcDistributionArc } from "@/components/dashboard/hc/distribution-arc";
import { HcRecentTable } from "@/components/dashboard/hc/recent-table";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getTotalSubmissionsCount,
  getOpenTasks,
  getWeeklySubmissionCounts,
  getRecentSubmissionsPreview,
  getRecentActivity,
  getDashboardRoutineTasks,
  logDashboardDbFailure,
} from "@/lib/queries/dashboard";
import { getRelayConversationsForUser } from "@/lib/queries/relay-messages";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import {
  formatDoctorDisplayName,
  greetingDoctorLabel,
} from "@/lib/format-doctor-display-name";
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
  const doctorDisplayName = formatDoctorDisplayName(displayName);
  const greetingDoctorName = greetingDoctorLabel(displayName);

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
    getRelayConversationsForUser(workspaceId, user.id).catch(() => []),
  ]);

  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const totalCount = totalRes.ok ? totalRes.count : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const routines = routinesRes.ok ? routinesRes.routines : null;
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

  const inboxCount =
    inboxBadgeRes.ok && inboxBadgeRes.count > 0 ? inboxBadgeRes.count : undefined;

  const seenCount =
    totalCount !== null && unseenCount !== null
      ? Math.max(0, totalCount - unseenCount)
      : null;

  const dashboardOverviewIncomplete =
    !!profileError || !newRes.ok || !unseenRes.ok || !totalRes.ok || !tasksRes.ok;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div
      className="yd-dashboard yd-dashboard--atlas relative mx-auto w-full min-w-0 pb-10"
      style={{ maxWidth: YD.space.contentMax }}
    >
      <DashboardHeader
        greeting={greeting}
        displayName={doctorDisplayName}
        greetingName={greetingDoctorName}
        subtitle="Eingang, Relay, Aufgaben, Routinen und Aktivität — ruhig im Überblick"
        inboxCount={inboxCount}
      />

      {dashboardOverviewIncomplete ? (
        <p
          className="yd-dash-meta mb-4 max-w-2xl normal-case tracking-normal"
          style={{ color: YD.text.secondary }}
          role="status"
        >
          Einige Bereiche konnten nicht geladen werden —{" "}
          <Link href="/inbox" className="font-medium hover:underline" style={{ color: YD.accent.core }}>
            Eingang
          </Link>
          {" · "}
          <Link href="/my-tasks" className="font-medium hover:underline" style={{ color: YD.accent.core }}>
            Aufgaben
          </Link>
        </p>
      ) : null}

      <AtlasOperationalCore
        unseenCount={unseenCount}
        previewRows={previewRows}
        openTasks={openTasks}
        routines={routines}
        relayConversations={relayConversations}
        relayUnread={relayUnread}
        reminderCount={reminderCount}
        activityEvents={activityEvents}
      />

      <section className="yd-atlas-records mt-10" aria-labelledby="yd-atlas-records-title">
        <h2 id="yd-atlas-records-title" className="sr-only">
          Verlauf und Statistik
        </h2>
        <DashboardProgressiveSection
          title="Verlauf & Statistik"
          hint="Nur bei Bedarf — kein operativer Mittelpunkt"
          defaultOpen={false}
        >
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="min-w-0 lg:col-span-8">
              <HcRecentTable rows={previewRows} />
            </div>
            <div className="min-w-0 space-y-5 lg:col-span-4">
              <HcAnalyticsBars counts={weeklyCounts} totalLabel="Einsendungen · 7 Tage" />
              <HcDistributionArc unseen={unseenCount} seen={seenCount} total={totalCount} />
            </div>
          </div>
        </DashboardProgressiveSection>
      </section>
    </div>
  );
}
