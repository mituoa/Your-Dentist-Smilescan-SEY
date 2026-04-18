import { requireUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const workspace = await getCurrentWorkspace();

  const role = (workspace?.role || "team") as "doctor" | "team";
  // @ts-expect-error - workspaces is joined
  const workspaceName = workspace?.workspaces?.name || "Unbekannt";

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Mobile nav at top */}
      <MobileNav role={role} />

      <div className="flex">
        {/* Desktop sidebar (hidden on mobile) */}
        <Sidebar role={role} />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header with user info */}
          <header className="hidden md:flex h-14 border-b border-border bg-surface-card px-6 items-center justify-end sticky top-0 z-30">
            <UserMenu
              email={user.email || ""}
              workspaceName={workspaceName}
              role={role}
            />
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
