import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { YdAwakenBootstrap } from "@/components/ambient/yd-awaken-bootstrap";
import { YdWorkspaceAwakening } from "@/components/ambient/yd-workspace-awakening";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { buildNavAmbientPreviews } from "@/lib/ambient/build-nav-ambient-previews";
import { Sidebar } from "@/components/app-shell/sidebar";
import {
  MobileNavProvider,
  MobileSidebarFrame,
} from "@/components/app-shell/mobile-nav";
import { MobileScrollFoundation } from "@/components/app-shell/mobile-scroll-foundation";
import { ProtectedLayoutHeavyBridge } from "@/components/app-shell/protected-layout-heavy-bridge";
import { ProtectedTopbar } from "@/components/app-shell/protected-topbar";
import { WorkspaceMobileShortcuts } from "@/components/workspace/workspace-mobile-shortcuts";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";
import { AssistShell } from "@/components/command-assist/assist-shell";
import { HcAppCanvas } from "@/components/design/hc-app-canvas";
import { YD } from "@/lib/design/yd-design-tokens";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const workspace = await requireApprovedWorkspace();
  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE_NAME)?.value);

  const role = (workspace?.role || "team") as "doctor" | "team";
  // @ts-expect-error - workspaces is joined
  const workspaceName = workspace?.workspaces?.name || "Unbekannt";

  if (!workspace) redirect("/login?error=workspace_missing");

  const workspaceId = workspace.workspace_id;

  const [taskCounts, unseenRes, profileRes] = await Promise.all([
    countMyOpenTasks(user.id, workspaceId, role).catch(() => ({
      total: 0,
      overdue: 0,
    })),
    countUnseenInboxSubmissions(workspaceId).catch(() => ({ ok: false as const })),
    (async () => {
      try {
        const supabase = await createClient();
        return await supabase
          .from("profile_data")
          .select("photo_url, display_name, practice_phone, appointment_link")
          .eq("workspace_id", workspaceId)
          .maybeSingle();
      } catch {
        return { data: null, error: null };
      }
    })(),
  ]);

  const myTasksCount = taskCounts.total;
  const myTasksOverdueCount = taskCounts.overdue;
  const inboxCount =
    unseenRes.ok && unseenRes.count > 0 ? unseenRes.count : undefined;

  const profileData = profileRes.data;
  const doctorLabel = cockpitDoctorLabel(
    profileData?.display_name || user.email?.split("@")[0] || workspaceName
  );

  const navAmbient = buildNavAmbientPreviews({
    inboxItems: [],
    openTasks: [],
    tasksOverdue: myTasksOverdueCount,
    journalEntries: [],
    role,
  });

  const relayBadge = myTasksCount > 0 ? myTasksCount : undefined;

  return (
    <AssistShell>
      <YdWorkspaceAwakening>
        <MobileNavProvider>
          <MobileScrollFoundation>
            <Suspense fallback={null}>
              <YdAwakenBootstrap />
            </Suspense>
            <div
              className="yd-workspace yd-awaken-page relative flex h-[100dvh] flex-col overflow-hidden"
              style={{ background: YD.atmosphere.pageGradient }}
            >
              <div className="yd-app-shell-row relative flex min-h-0 flex-1 flex-row overflow-hidden">
                <MobileSidebarFrame>
                  <Sidebar
                    role={role}
                    inboxCount={inboxCount}
                    myTasksCount={myTasksCount}
                    myTasksOverdueCount={myTasksOverdueCount}
                    avatarUrl={profileData?.photo_url ?? null}
                    displayName={profileData?.display_name ?? null}
                    email={user.email || ""}
                    navAmbient={navAmbient}
                  />
                </MobileSidebarFrame>

                <div className="yd-app-shell-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <ProtectedTopbar
                    email={user.email || ""}
                    workspaceName={workspaceName}
                    workspaceId={workspaceId}
                    role={role}
                    avatarUrl={profileData?.photo_url ?? null}
                    displayName={profileData?.display_name ?? null}
                    inboxCount={inboxCount}
                  />

                  <main className="yd-workspace-main relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-2 md:p-5 md:pb-6">
                    <HcAppCanvas>
                      <ProtectedLayoutHeavyBridge
                        workspaceId={workspaceId}
                        userId={user.id}
                        role={role}
                        inboxCount={inboxCount}
                        tasksOverdue={myTasksOverdueCount}
                        practicePhone={profileData?.practice_phone ?? null}
                        appointmentUrl={profileData?.appointment_link ?? null}
                        email={user.email || ""}
                        workspaceName={workspaceName}
                        initialTheme={theme}
                        displayName={doctorLabel}
                        avatarUrl={profileData?.photo_url ?? null}
                      />
                      {children}
                    </HcAppCanvas>
                  </main>
                </div>
              </div>

              <WorkspaceMobileShortcuts
                role={role}
                inboxBadge={inboxCount}
                relayBadge={relayBadge}
                relayBadgeUrgent={myTasksOverdueCount > 0}
              />
            </div>
          </MobileScrollFoundation>
        </MobileNavProvider>
      </YdWorkspaceAwakening>
    </AssistShell>
  );
}
