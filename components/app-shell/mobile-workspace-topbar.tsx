"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { MobileMenuButton } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import type { ThemePreference } from "@/lib/theme";

type MobileWorkspaceTopbarProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
};

/** Mobile: Burger · Marke · ein Avatar — sonst nichts. */
export function MobileWorkspaceTopbar({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
}: MobileWorkspaceTopbarProps) {
  return (
    <header className="yd-mobile-workspace-topbar sticky top-0 z-40 flex shrink-0 flex-col md:hidden">
      <div className="yd-mobile-workspace-topbar-inner flex h-[52px] items-center gap-2.5 px-3">
        <MobileMenuButton />
        <Link
          href="/dashboard"
          className="yd-mobile-workspace-topbar-brand min-w-0 flex-1"
          aria-label="Your Dentist — Startseite"
        >
          <YourDentistBrandLockup size="sm" tagline={null} className="min-w-0" />
        </Link>
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
  );
}
