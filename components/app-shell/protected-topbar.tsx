"use client";

import { MobileMenuButton } from "./mobile-nav";
import { MobileWorkspaceBrandAnchor } from "./mobile-workspace-brand";
import { UserMenu } from "./user-menu";
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
 * App-Shell: Mobile-Topbar (Drawer) + Desktop integrierte Headline im Canvas (Layout).
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
  return (
    <>
      <MobileWorkspaceBrandAnchor />
      <header
        className={cn(
          "yd-protected-topbar yd-mobile-workspace-topbar sticky top-0 z-30 flex shrink-0 flex-col pt-[env(safe-area-inset-top,0px)] md:hidden",
          "border-b border-[rgba(180,198,218,0.22)] bg-white/78 backdrop-blur-[16px]"
        )}
      >
        <div className="yd-mobile-topbar-grid flex h-[52px] w-full items-center">
          <MobileMenuButton />
          <div className="yd-mobile-topbar-brand-spacer min-w-0 flex-1" aria-hidden />
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
    </>
  );
}
