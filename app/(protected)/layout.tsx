import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { Sidebar, SIDEBAR_MAIN_PAD } from "@/components/app-shell/sidebar";
import { TopbarContextActions } from "@/components/app-shell/topbar-context-actions";
import { UserMenu } from "@/components/app-shell/user-menu";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";
import { AssistShell } from "@/components/command-assist/assist-shell";

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
  type ProfileHeader = { photo_url: string | null; display_name: string | null };
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
          .select("photo_url, display_name")
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

  return (
    <AssistShell>
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-surface-page via-surface-page to-surface-sunken/40">
      <div className="flex min-h-0 flex-1 flex-row">
        <Sidebar
          role={role}
          inboxCount={inboxCount}
          myTasksCount={myTasksCount}
          myTasksOverdueCount={myTasksOverdueCount}
        />

        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${SIDEBAR_MAIN_PAD}`}
        >
          {/* Topbar — immer sichtbar, Inhalt scrollt darunter */}
          <header
            className="sticky top-0 z-30 flex shrink-0 items-center bg-white/85 backdrop-blur-xl"
            style={{ minHeight: "64px" }}
          >
            <div className="flex h-full min-h-[64px] w-full items-center justify-end gap-2 px-4 md:min-h-[80px] md:gap-3 md:px-10">
              <div className="flex min-w-0 items-center gap-2 md:gap-3">
                <TopbarContextActions />

                <UserMenu
                  email={user.email || ""}
                  workspaceName={workspaceName}
                  role={role}
                  initialTheme={theme}
                  avatarUrl={profileData?.photo_url ?? null}
                  displayName={profileData?.display_name ?? null}
                />
              </div>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain max-lg:[-webkit-overflow-scrolling:touch]">
            {children}
          </main>
        </div>
      </div>

    </div>
    </AssistShell>
  );
}
