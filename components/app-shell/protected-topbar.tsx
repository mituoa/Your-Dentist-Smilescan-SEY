"use client";

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
 * Mobile: ruhige Leiste ohne Hamburger — Navigation über Bottom Bar.
 * Desktop: integrierte Headline im Canvas (Layout).
 */
export function ProtectedTopbar({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
}: ProtectedTopbarProps) {
  return (
    <>
      <MobileWorkspaceBrandAnchor />
      <header
        className={cn(
          "yd-protected-topbar yd-mobile-workspace-topbar sticky top-0 z-30 flex shrink-0 flex-col pt-[env(safe-area-inset-top,0px)] md:hidden",
          "border-b border-[rgba(180,198,218,0.18)] bg-white/72 backdrop-blur-[14px]"
        )}
      >
        <div className="flex h-[48px] w-full items-center justify-end px-3">
          <UserMenu
            email={email}
            workspaceName={workspaceName}
            role={role}
            initialTheme={initialTheme}
            avatarUrl={avatarUrl}
            displayName={displayName}
          />
        </div>
      </header>
    </>
  );
}
