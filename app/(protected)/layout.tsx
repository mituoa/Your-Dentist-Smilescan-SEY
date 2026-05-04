import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

import { requireUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";
import { Bell, Plus, Search } from "lucide-react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const workspace = await getCurrentWorkspace();
  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE_NAME)?.value);

  const role = (workspace?.role || "team") as "doctor" | "team";
  // @ts-expect-error - workspaces is joined
  const workspaceName = workspace?.workspaces?.name || "Unbekannt";

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  let myTasksCount = 0;
  let myTasksOverdueCount = 0;
  if (workspace) {
    const counts = await countMyOpenTasks(
      user.id,
      workspace.workspace_id,
      role
    );
    myTasksCount = counts.total;
    myTasksOverdueCount = counts.overdue;
  }

  // TODO: replace with countOpenInboxItems(workspace_id) when implemented
  const inboxCount = 0;

  const supabase = await createClient();
  const { data: profileData } = await supabase
    .from("profile_data")
    .select("photo_url, display_name")
    .eq("workspace_id", workspace.workspace_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Mobile nav at top */}
      <MobileNav
        role={role}
        inboxCount={inboxCount}
        myTasksCount={myTasksCount}
        myTasksOverdueCount={myTasksOverdueCount}
        initialTheme={theme}
      />

      <div className="flex">
        {/* Desktop sidebar (hidden on mobile) */}
        <Sidebar
          role={role}
          inboxCount={inboxCount}
          myTasksCount={myTasksCount}
          myTasksOverdueCount={myTasksOverdueCount}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Topbar (dashboard-style) */}
          <header
            className="sticky top-0 z-30 hidden bg-white/80 backdrop-blur-xl md:block"
            style={{ height: "80px" }}
          >
            <div className="px-10 h-full flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                  <input
                    type="text"
                    placeholder="Aufgaben, Patienten oder Fälle suchen…"
                    className="w-full bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-[3px]"
                    style={{
                      height: "48px",
                      paddingLeft: "44px",
                      paddingRight: "16px",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "none",
                      // ring color
                      ["--tw-ring-color" as any]: "rgba(47,128,237,0.12)",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 ml-6">
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

                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[#F8FAFC]"
                >
                  <Bell className="h-[18px] w-[18px]" style={{ color: "#64748B" }} />
                  <span
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                    style={{ background: "#2F80ED" }}
                  />
                </button>

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

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
