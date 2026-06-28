"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import {
  resolveWorkspaceGreeting,
  resolveWorkspaceIntegratedHeader,
} from "@/lib/app-shell/workspace-integrated-header-context";
import type { DashboardHeaderSummary } from "@/lib/dashboard/dashboard-header-summary";
import type { TrackerHeaderSummary } from "@/lib/inbox/tracker-header-summary";
import type { RelayHeaderSummary } from "@/lib/relay/relay-header-summary";
import type { ThemePreference } from "@/lib/theme";

import { WorkspaceIntegratedHeader } from "./workspace-integrated-header";

type WorkspaceIntegratedHeaderBridgeProps = {
  email: string;
  workspaceName: string;
  workspaceId: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  displayName: string;
  avatarUrl?: string | null;
  inboxCount?: number;
  trackerHeaderSummary?: TrackerHeaderSummary | null;
  dashboardHeaderSummary?: DashboardHeaderSummary | null;
  relayHeaderSummary?: RelayHeaderSummary | null;
};

/** Route-aware integrierte Headline — Desktop md+, ersetzt die alte Toolbar. */
export function WorkspaceIntegratedHeaderBridge({
  email,
  workspaceName,
  workspaceId,
  role,
  initialTheme,
  displayName,
  avatarUrl,
  inboxCount,
  trackerHeaderSummary,
  dashboardHeaderSummary,
  relayHeaderSummary,
}: WorkspaceIntegratedHeaderBridgeProps) {
  const pathname = usePathname() || "";
  const ctx = resolveWorkspaceIntegratedHeader(pathname);
  const onTracker = pathname.startsWith("/inbox");
  const onDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const onRelay = pathname === "/relay" || pathname.startsWith("/relay/");
  const dashboardEditorial =
    onDashboard && dashboardHeaderSummary
      ? dashboardHeaderSummary.editorial
      : onTracker
        ? { statusTitle: "", statusPrimary: "", metricsLine: "" }
        : null;

  const subtitle =
    onRelay && relayHeaderSummary
      ? relayHeaderSummary.lead
      : onDashboard || onTracker
        ? ""
        : ctx.subtitle;
  const subtitleMeta =
    onRelay || onDashboard || onTracker ? "" : ctx.subtitleMeta;

  const greeting = useMemo(() => {
    return resolveWorkspaceGreeting(new Date().getHours());
  }, []);

  if (ctx.hideOnDesktop) {
    return null;
  }

  return (
    <div className="hidden md:block">
      <WorkspaceIntegratedHeader
        eyebrow={ctx.eyebrow}
        greeting={greeting}
        hideGreeting={ctx.hideGreeting}
        displayName={displayName}
        subtitle={subtitle}
        subtitleMeta={subtitleMeta}
        dashboardEditorial={dashboardEditorial}
        email={email}
        workspaceName={workspaceName}
        workspaceId={workspaceId}
        role={role}
        initialTheme={initialTheme}
        avatarUrl={avatarUrl}
        inboxCount={inboxCount}
        showSearch={ctx.showSearch}
      />
    </div>
  );
}
