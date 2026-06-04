"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, MessageCircle, Search } from "lucide-react";

import { TopbarContextActions } from "@/components/app-shell/topbar-context-actions";
import { UserMenu } from "@/components/app-shell/user-menu";
import type { ThemePreference } from "@/lib/theme";

type WorkspaceHeaderControlsProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
  inboxCount?: number;
  showSearch?: boolean;
};

/** Suche, Schnellaktionen und Profil — rechte Seite der integrierten Workspace-Headline. */
export function WorkspaceHeaderControls({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
  inboxCount,
  showSearch = true,
}: WorkspaceHeaderControlsProps) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const searchQ = searchParams.get("q") ?? "";
  const searchAction = pathname.startsWith("/inbox") ? pathname.split("?")[0] || "/inbox" : "/inbox";

  return (
    <div className="yd-dash-header-premium__toolbar">
      <TopbarContextActions role={role} variant="dashboard" />

      {showSearch ? (
        <form action={searchAction} method="get" className="yd-dash-header-premium__search relative min-w-0">
          <Search
            className="yd-dash-header-premium__search-icon pointer-events-none absolute top-1/2 -translate-y-1/2"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            name="q"
            key={searchQ}
            defaultValue={searchQ}
            placeholder="Patient oder Anfrage suchen …"
            className="yd-dash-header-premium__search-input"
            aria-label="Patient oder Anfrage suchen"
          />
        </form>
      ) : null}

      <div className="yd-dash-header-premium__actions">
        <Link
          href="/relay?panel=messages"
          className="yd-dash-header-premium__action"
          aria-label="Team-Nachrichten in Relay"
          title="Team-Nachrichten (Relay)"
        >
          <MessageCircle strokeWidth={1.65} />
        </Link>
        <Link
          href="/inbox"
          className="yd-dash-header-premium__action relative"
          aria-label={
            inboxCount && inboxCount > 0
              ? `Neue Einsendungen im Tracker, ${inboxCount} offen`
              : "Neue Einsendungen im Tracker"
          }
          title="Neue Einsendungen (Tracker)"
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
