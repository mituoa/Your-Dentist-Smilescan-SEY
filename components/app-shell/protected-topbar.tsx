"use client";

import { BrandMark } from "./brand-mark";
import { MobileMenuButton, useMobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/theme";

type ProtectedTopbarProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
  inboxCount?: number;
};

/**
 * App-Shell: Mobile-Topbar (Drawer) + Desktop-Workspace-Toolbar (global).
 * Dashboard-Inhalt bleibt ohne eigene Aktionsleiste.
 */
export function ProtectedTopbar({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
  inboxCount,
}: ProtectedTopbarProps) {
  const mobileNav = useMobileNav();
  const drawerOpen = mobileNav.open;

  return (
    <>
      <header
        className={cn(
          "yd-protected-topbar yd-mobile-workspace-topbar sticky top-0 z-30 flex shrink-0 flex-col pt-[env(safe-area-inset-top,0px)] md:hidden",
          "border-b border-[rgba(180,198,218,0.22)] bg-white/78 backdrop-blur-[16px]"
        )}
      >
        <div className="yd-mobile-topbar-grid flex h-[52px] w-full items-center gap-2 px-3">
          <MobileMenuButton />
          <div
            className={cn(
              "yd-mobile-topbar-brand flex min-w-0 flex-1 justify-center transition-opacity duration-200",
              drawerOpen && "pointer-events-none opacity-0"
            )}
            aria-hidden={drawerOpen}
          >
            <BrandMark compact />
          </div>
          <div className="flex shrink-0 justify-end">
            <UserMenu
              email={email}
              workspaceName={workspaceName}
              role={role}
              initialTheme={initialTheme}
              avatarUrl={avatarUrl}
              displayName={displayName}
            />
          </div>
        </div>
      </header>

      <WorkspaceToolbar
        email={email}
        workspaceName={workspaceName}
        role={role}
        initialTheme={initialTheme}
        avatarUrl={avatarUrl}
        displayName={displayName}
        inboxCount={inboxCount}
      />
    </>
  );
}
