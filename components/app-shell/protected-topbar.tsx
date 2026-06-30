"use client";

import { MobileTopbarAssistButton } from "@/components/app-shell/mobile-topbar-assist-button";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { SignOutIconForm } from "@/components/app-shell/sign-out-form";
import { TopbarContextActions } from "@/components/app-shell/topbar-context-actions";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

type ProtectedTopbarProps = {
  email: string;
  workspaceName: string;
  workspaceId: string;
  role: "doctor" | "team";
  avatarUrl?: string | null;
  displayName?: string | null;
  inboxCount?: number;
};

/**
 * Mobile: Your Dentist immer sichtbar — zentriert in der Topbar.
 * Desktop: integrierte Headline im Canvas (Layout).
 */
export function ProtectedTopbar({
  email,
  workspaceName,
  workspaceId,
  role,
  avatarUrl,
  displayName,
}: ProtectedTopbarProps) {
  return (
    <header
      className={cn(
        "yd-protected-topbar yd-mobile-workspace-topbar sticky top-0 z-[76] flex shrink-0 flex-col pt-[env(safe-area-inset-top,0px)] md:hidden",
        "border-b border-[rgba(180,198,218,0.18)] bg-white/88 backdrop-blur-[16px]"
      )}
    >
      <div className="yd-mobile-topbar-inner">
        <div className="yd-mobile-topbar-cta-group">
          <TopbarContextActions
            role={role}
            variant="dashboard"
            workspaceId={workspaceId}
            placement="mobile"
          />
        </div>
        <div className="yd-mobile-topbar-brand" aria-label="Your Dentist">
          <YourDentistBrandLockup size="sm" tagline={null} className="min-w-0" priority />
        </div>
        <div className="yd-mobile-topbar-actions">
          <MobileTopbarAssistButton />
          <SignOutIconForm />
          <UserMenu
            email={email}
            workspaceName={workspaceName}
            role={role}
            avatarUrl={avatarUrl}
            displayName={displayName}
            compact
          />
        </div>
      </div>
    </header>
  );
}
