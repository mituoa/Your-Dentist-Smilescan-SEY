"use client";

import { TopbarContextActions } from "@/components/app-shell/topbar-context-actions";
import { cn } from "@/lib/utils";

type WorkspaceMobileQuickActionsProps = {
  className?: string;
  role?: "doctor" | "team";
  workspaceId?: string;
  variant?: "topbar" | "bar";
};

/** Route-aware Schnellaktionen — dieselbe Logik wie Desktop-Headline. */
export function WorkspaceMobileQuickActions({
  className,
  role = "doctor",
  workspaceId = "",
  variant = "bar",
}: WorkspaceMobileQuickActionsProps) {
  if (!workspaceId) return null;

  if (variant === "topbar") {
    return (
      <TopbarContextActions
        role={role}
        variant="dashboard"
        workspaceId={workspaceId}
        placement="mobile"
      />
    );
  }

  return (
    <div className={cn("yd-dash-mobile-actions-trigger px-4 pb-2 md:hidden", className)}>
      <TopbarContextActions
        role={role}
        variant="dashboard"
        workspaceId={workspaceId}
        placement="mobile"
        className="yd-mobile-topbar-cta-group__inner yd-mobile-topbar-cta-group__inner--bar flex w-full flex-wrap items-center justify-center gap-2"
      />
    </div>
  );
}
