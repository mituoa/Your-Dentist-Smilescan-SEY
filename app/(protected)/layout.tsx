import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { YdAwakenBootstrap } from "@/components/ambient/yd-awaken-bootstrap";
import { YdWorkspaceAwakening } from "@/components/ambient/yd-workspace-awakening";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { buildNavAmbientPreviews } from "@/lib/ambient/build-nav-ambient-previews";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { getOpenTasks } from "@/lib/queries/dashboard";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { Sidebar } from "@/components/app-shell/sidebar";
import {
  MobileNavProvider,
  MobileSidebarFrame,
} from "@/components/app-shell/mobile-nav";
import { WorkspaceIntegratedHeaderBridge } from "@/components/app-shell/workspace-integrated-header-bridge";
import { ProtectedTopbar } from "@/components/app-shell/protected-topbar";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";
import { CommandWorkspaceHydration } from "@/components/command-ai/command-workspace-hydration";
import { AssistCommandLayer, AssistShell } from "@/components/command-assist/assist-shell";
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

  let myTasksCount = 0;
  let myTasksOverdueCount = 0;
  let inboxCount: number | undefined;
  type ProfileHeader = {
    photo_url: string | null;
    display_name: string | null;
    practice_phone: string | null;
    appointment_link: string | null;
  };
  const headerState = { profileData: null as ProfileHeader | null };

  await Promise.all([
    (async () => {
      if (!workspace) return;
      try {
        const counts = await countMyOpenTasks(
          user.id,
          workspace.workspace_id,
          role
        );
        myTasksCount = counts.total;
        myTasksOverdueCount = counts.overdue;
      } catch (e) {
        console.error("[ProtectedLayout] countMyOpenTasks failed:", e);
      }
    })(),
    (async () => {
      if (!workspace) return;
      try {
        const unseen = await countUnseenInboxSubmissions(workspace.workspace_id);
        if (unseen.ok && unseen.count > 0) {
          inboxCount = unseen.count;
        }
      } catch (e) {
        console.error("[ProtectedLayout] inbox unseen count failed:", e);
      }
    })(),
    (async () => {
      if (!workspace) return;
      try {
        const supabase = await createClient();
        const res = await supabase
          .from("profile_data")
          .select("photo_url, display_name, practice_phone, appointment_link")
          .eq("workspace_id", workspace.workspace_id)
          .maybeSingle();
        headerState.profileData = res.data as ProfileHeader | null;
        if (res.error) {
          console.error("[ProtectedLayout] profile_data query:", res.error);
        }
      } catch (e) {
        console.error("[ProtectedLayout] profile fetch failed:", e);
      }
    })(),
  ]);

  const profileData = headerState.profileData;
  const doctorLabel = cockpitDoctorLabel(
    profileData?.display_name || user.email?.split("@")[0] || workspaceName
  );

  let navAmbient = buildNavAmbientPreviews({
    inboxItems: [],
    openTasks: [],
    tasksOverdue: myTasksOverdueCount,
    journalEntries: [],
    role,
  });

  let commandPatients: {
    id: string;
    patient_name: string | null;
    patient_notes: string | null;
  }[] = [];

  if (workspace) {
    const [inboxRes, tasksRes, journals] = await Promise.all([
      getInboxSubmissions(workspace.workspace_id),
      getOpenTasks(workspace.workspace_id),
      role === "doctor" ? listJournalForWorkspace(workspace.workspace_id) : Promise.resolve([]),
    ]);

    if (inboxRes.ok) {
      commandPatients = inboxRes.items.map((item) => ({
        id: item.id,
        patient_name: item.patient_name,
        patient_notes: item.patient_notes,
      }));
    }

    navAmbient = buildNavAmbientPreviews({
      inboxItems: inboxRes.ok ? inboxRes.items : [],
      inboxUnseen: inboxCount,
      openTasks: tasksRes.ok ? tasksRes.tasks : [],
      tasksOverdue: myTasksOverdueCount,
      journalEntries: journals,
      role,
    });
  }

  return (
    <AssistShell>
      <CommandWorkspaceHydration
        patients={commandPatients}
        practicePhone={profileData?.practice_phone ?? null}
        appointmentUrl={profileData?.appointment_link ?? null}
      />
      <YdWorkspaceAwakening>
        <MobileNavProvider>
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
                role={role}
                initialTheme={theme}
                avatarUrl={profileData?.photo_url ?? null}
                displayName={profileData?.display_name ?? null}
                inboxCount={inboxCount}
              />

              <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-2 pb-[max(3rem,env(safe-area-inset-bottom)+2rem)] md:p-5 md:pb-6">
                <HcAppCanvas>
                  <WorkspaceIntegratedHeaderBridge
                    email={user.email || ""}
                    workspaceName={workspaceName}
                    role={role}
                    initialTheme={theme}
                    displayName={doctorLabel}
                    avatarUrl={profileData?.photo_url ?? null}
                    inboxCount={inboxCount}
                  />
                  {children}
                </HcAppCanvas>
                <AssistCommandLayer />
              </main>
            </div>
          </div>
        </div>
      </MobileNavProvider>
      </YdWorkspaceAwakening>
    </AssistShell>
  );
}
