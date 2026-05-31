"use client";

import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";

import { TopbarContextActions } from "@/components/app-shell/topbar-context-actions";
import { UserMenu } from "@/components/app-shell/user-menu";
import type { ThemePreference } from "@/lib/theme";

type DashboardHeaderControlsProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
  inboxCount?: number;
};

/** Suche, Schnellaktionen und Profil — rechte Seite der integrierten Dashboard-Headline. */
export function DashboardHeaderControls({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
  inboxCount,
}: DashboardHeaderControlsProps) {
  return (
    <div className="yd-dash-header-premium__toolbar">
      <TopbarContextActions role={role} variant="dashboard" />

      <form action="/inbox" method="get" className="yd-dash-header-premium__search relative min-w-0">
        <Search
          className="yd-dash-header-premium__search-icon pointer-events-none absolute top-1/2 -translate-y-1/2"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          name="q"
          placeholder="Patient oder Anfrage suchen …"
          className="yd-dash-header-premium__search-input"
        />
      </form>

      <div className="yd-dash-header-premium__actions">
        <Link
          href="/relay?panel=messages"
          className="yd-dash-header-premium__action"
          aria-label="Relay Nachrichten"
        >
          <MessageCircle strokeWidth={1.65} />
        </Link>
        <Link
          href="/inbox"
          className="yd-dash-header-premium__action relative"
          aria-label={
            inboxCount && inboxCount > 0
              ? `Benachrichtigungen, ${inboxCount} neu`
              : "Benachrichtigungen"
          }
        >
          <Bell strokeWidth={1.65} />
          {inboxCount && inboxCount > 0 ? (
            <span className="yd-dash-header-premium__badge" aria-hidden />
          ) : null}
        </Link>
        <UserMenu
          email={email}
          workspaceName={workspaceName}
          role={role}
          initialTheme={initialTheme}
          avatarUrl={avatarUrl}
          displayName={displayName}
          compact
        />
      </div>
    </div>
  );
}
