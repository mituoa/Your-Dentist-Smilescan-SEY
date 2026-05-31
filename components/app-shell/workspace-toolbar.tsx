"use client";

import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";

import { YD } from "@/lib/design/yd-design-tokens";
import { TopbarContextActions } from "./topbar-context-actions";
import { UserMenu } from "./user-menu";
import { WorkspacePageContext } from "./workspace-page-context";
import type { ThemePreference } from "@/lib/theme";

type WorkspaceToolbarProps = {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
  inboxCount?: number;
};

/** Desktop — globale Praxis-Toolbar (alle geschützten Seiten inkl. Dashboard). */
export function WorkspaceToolbar({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
  inboxCount,
}: WorkspaceToolbarProps) {
  return (
    <header className="yd-workspace-toolbar hidden shrink-0 md:block">
      <div className="yd-workspace-toolbar__shell">
        <div className="yd-workspace-toolbar__inner">
        <WorkspacePageContext />

        <form action="/inbox" method="get" className="yd-workspace-toolbar__search relative min-w-0">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2"
            style={{ color: YD.text.faint }}
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            name="q"
            placeholder="Patient oder Anfrage suchen …"
            className="yd-workspace-toolbar__search-input w-full min-w-0 pl-11 pr-4 text-[13px] outline-none transition placeholder:text-[#8BA3B8] focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.14)]"
          />
        </form>

        <div className="yd-workspace-toolbar__actions">
          <TopbarContextActions role={role} />
          <Link
            href="/relay?panel=messages"
            className="yd-workspace-toolbar__icon-btn"
            aria-label="Relay Nachrichten"
          >
            <MessageCircle className="h-[17px] w-[17px]" strokeWidth={1.65} />
          </Link>
          <Link
            href="/inbox"
            className="yd-workspace-toolbar__icon-btn relative"
            aria-label={
              inboxCount && inboxCount > 0
                ? `Benachrichtigungen, ${inboxCount} neu`
                : "Benachrichtigungen"
            }
          >
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.65} />
            {inboxCount && inboxCount > 0 ? (
              <span className="yd-workspace-toolbar__badge" aria-hidden />
            ) : null}
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
        </div>
      </div>
    </header>
  );
}
