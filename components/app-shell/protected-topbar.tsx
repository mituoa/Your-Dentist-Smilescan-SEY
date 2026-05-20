"use client";

import { usePathname } from "next/navigation";
import { MobileMenuButton } from "./mobile-nav";
import { TopbarContextActions } from "./topbar-context-actions";
import { UserMenu } from "./user-menu";
import type { ThemePreference } from "@/lib/theme";

type ProtectedTopbarProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
};

/** Topbar — auf dem Dashboard (md+) ausgeblendet; Header lebt in der Seite. */
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

  return (
    <header
      className={`sticky top-0 z-30 flex shrink-0 flex-col pt-[env(safe-area-inset-top,0px)] ${
        isDashboard
          ? "border-b border-[rgba(15,23,42,0.06)] bg-white/95 backdrop-blur-md md:hidden"
          : "border-b border-[rgba(15,23,42,0.06)] bg-white/95 backdrop-blur-md md:border-0 md:bg-transparent md:backdrop-blur-none"
      }`}
    >
      <div className="flex h-14 w-full items-center gap-2 px-4 md:h-16 md:gap-3 md:px-6">
        <MobileMenuButton />
        {!isDashboard ? (
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
        ) : (
          <div className="flex min-w-0 flex-1 justify-end md:hidden">
            <UserMenu
              email={email}
              workspaceName={workspaceName}
              role={role}
              initialTheme={initialTheme}
              avatarUrl={avatarUrl}
              displayName={displayName}
            />
          </div>
        )}
      </div>
    </header>
  );
}
