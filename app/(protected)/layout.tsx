import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { countUnseenInboxSubmissions } from "@/lib/queries/inbox";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
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
    <div
      className="flex min-h-screen flex-col bg-gradient-to-br from-surface-page via-surface-page to-surface-sunken/40 max-md:max-h-[100dvh] max-md:overflow-hidden"
    >
      {/* Mobile nav at top */}
      <MobileNav
        role={role}
        inboxCount={inboxCount}
        myTasksCount={myTasksCount}
        myTasksOverdueCount={myTasksOverdueCount}
        initialTheme={theme}
        email={user.email || ""}
        workspaceName={workspaceName}
        avatarUrl={profileData?.photo_url ?? null}
        displayName={profileData?.display_name ?? null}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Desktop sidebar (hidden on mobile) */}
        <Sidebar
          role={role}
          inboxCount={inboxCount}
          myTasksCount={myTasksCount}
          myTasksOverdueCount={myTasksOverdueCount}
        />

        <div className="flex min-h-0 flex-1 flex-col md:min-h-screen">
          {/* Topbar (dashboard-style) */}
          <header
            className="sticky top-0 z-30 hidden bg-white/80 backdrop-blur-xl md:block"
            style={{ height: "80px" }}
          >
            <div className="flex h-full w-full items-center justify-end gap-3 px-10">
              <div className="flex items-center gap-3">
                <Link
                  href="/relay#relay-quick-create"
                  className="hidden md:inline-flex items-center gap-2 px-4 text-[14px] font-medium text-[#1E293B] transition-colors hover:bg-[#F8FAFC]"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Plus className="h-4 w-4 text-[#2F80ED]" />
                  <span>Neue Aufgabe</span>
                </Link>
                <Link
                  href="/create-case"
                  className="hidden lg:inline-flex items-center gap-2 px-5 text-white font-medium text-[14px] transition-all hover:opacity-95"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    background: "#2F80ED",
                    boxShadow:
                      "0 4px 12px rgba(47,128,237,0.28), 0 2px 4px rgba(47,128,237,0.18)",
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Neuer Fall</span>
                </Link>

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

          <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

    </div>
    </AssistShell>
  );
}
