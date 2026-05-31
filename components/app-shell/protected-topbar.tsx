"use client";

import { usePathname } from "next/navigation";

import { BrandMark } from "./brand-mark";
import { MobileMenuButton, useMobileNav } from "./mobile-nav";
import { TopbarContextActions } from "./topbar-context-actions";
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
};

/** Topbar — Dashboard: mobile shell bar; andere Seiten: Kontext + Profil. */
export function ProtectedTopbar({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
}: ProtectedTopbarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const mobileNav = useMobileNav();
  const drawerOpen = mobileNav.open;

  return (
    <header
      className={cn(
        "yd-protected-topbar sticky top-0 z-30 flex shrink-0 flex-col pt-[env(safe-area-inset-top,0px)]",
        isDashboard && "yd-mobile-workspace-topbar",
        isDashboard
          ? "border-b border-[rgba(180,198,218,0.22)] bg-white/72 backdrop-blur-[16px] md:hidden"
          : "border-b border-[rgba(180,198,218,0.22)] bg-white/72 backdrop-blur-[16px] md:border-0 md:bg-transparent md:backdrop-blur-none"
      )}
    >
      {isDashboard ? (
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
      ) : (
        <div className="flex h-[52px] w-full items-center gap-2.5 px-3.5 md:h-16 md:gap-3 md:px-6">
          <MobileMenuButton />
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-3">
            <TopbarContextActions />
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
      )}
    </header>
  );
}
