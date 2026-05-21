"use client";

import { usePathname } from "next/navigation";
import { MobileWorkspaceTopbar } from "./mobile-workspace-topbar";
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

/** Desktop-Topbar mit Kontextaktionen; Mobile nur Burger · Marke · Avatar. */
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
    <>
      <MobileWorkspaceTopbar
        email={email}
        workspaceName={workspaceName}
        role={role}
        initialTheme={initialTheme}
        avatarUrl={avatarUrl}
        displayName={displayName}
      />

      <header
        className={`yd-protected-topbar hidden shrink-0 flex-col md:flex ${
          isDashboard ? "md:hidden" : ""
        }`}
      >
        <div className="flex h-16 w-full items-center gap-3 px-6">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
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
      </header>
    </>
  );
}
