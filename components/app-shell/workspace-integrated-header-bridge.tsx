"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import {
  resolveWorkspaceGreeting,
  resolveWorkspaceIntegratedHeader,
} from "@/lib/app-shell/workspace-integrated-header-context";
import type { ThemePreference } from "@/lib/theme";

import { WorkspaceIntegratedHeader } from "./workspace-integrated-header";

type WorkspaceIntegratedHeaderBridgeProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  displayName: string;
  avatarUrl?: string | null;
  inboxCount?: number;
};

/** Route-aware integrierte Headline — Desktop md+, ersetzt die alte Toolbar. */
export function WorkspaceIntegratedHeaderBridge({
  email,
  workspaceName,
  role,
  initialTheme,
  displayName,
  avatarUrl,
  inboxCount,
}: WorkspaceIntegratedHeaderBridgeProps) {
  const pathname = usePathname() || "";
  const ctx = resolveWorkspaceIntegratedHeader(pathname);

  const greeting = useMemo(() => {
    return resolveWorkspaceGreeting(new Date().getHours());
  }, []);

  return (
    <div className="hidden md:block">
      <WorkspaceIntegratedHeader
        eyebrow={ctx.eyebrow}
        greeting={greeting}
        hideGreeting={ctx.hideGreeting}
        displayName={displayName}
        subtitle={ctx.subtitle}
        email={email}
        workspaceName={workspaceName}
        role={role}
        initialTheme={initialTheme}
        avatarUrl={avatarUrl}
        inboxCount={inboxCount}
        showSearch={ctx.showSearch}
      />
    </div>
  );
}
