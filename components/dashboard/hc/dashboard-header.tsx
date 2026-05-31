import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";

import { YD } from "@/lib/design/yd-design-tokens";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  pendingApprovals: number | null;
  avatarUrl?: string | null;
  profileDisplayName?: string | null;
  workspaceName: string;
  email: string;
  inboxCount?: number;
};

function statusLineTail(pending: number | null): string {
  if (pending === null) return "Status wird geladen";
  if (pending === 0) return "Keine Antworten warten auf Ihre Prüfung";
  if (pending === 1) return "1 Antwort wartet auf Ihre Prüfung";
  return `${pending} Antworten warten auf Ihre Prüfung`;
}

export function DashboardHeader({
  greeting,
  displayName,
  pendingApprovals,
  avatarUrl,
  profileDisplayName,
  workspaceName,
  email,
  inboxCount,
}: DashboardHeaderProps) {
  const fallbackBase = (profileDisplayName || workspaceName || email).trim();
  const initials = fallbackBase
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <header className="yd-dash-header-cockpit w-full min-w-0 max-w-full">
      <div className="yd-dash-header-cockpit__row flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
        <div className="yd-dash-header-cockpit__greeting min-w-0 flex-1 lg:max-w-[42%]">
          <h1 className="yd-dash-title text-[1.375rem] md:text-[1.8125rem]">
            {greeting}, {displayName}
          </h1>
          <p className="yd-dash-status-line yd-dash-subtitle mt-1.5 max-w-lg whitespace-nowrap text-[13px] md:text-[14px]">
            <span className="yd-dash-status-line__dot" aria-hidden />
            <span className="yd-dash-status-line__practice">Praxis aktiv</span>
            <span className="yd-dash-status-line__sep" aria-hidden>
              {" "}
              ·{" "}
            </span>
            <span className="yd-dash-status-line__tail">{statusLineTail(pendingApprovals)}</span>
          </p>
        </div>

        <form
          action="/inbox"
          method="get"
          className="yd-dash-header-cockpit__search relative min-w-0 lg:mx-auto lg:w-full lg:max-w-[min(100%,340px)] lg:flex-none"
        >
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2"
            style={{ color: YD.text.faint }}
            strokeWidth={1.75}
          />
          <input
            type="search"
            name="q"
            placeholder="Patient oder Anfrage suchen"
            className="yd-dash-search-input h-12 w-full min-w-0 pl-11 pr-4 text-[13px] font-normal outline-none transition placeholder:text-[#8BA3B8] focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.14)]"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(170, 188, 206, 0.38)",
              borderRadius: YD.radius.pill,
              color: YD.text.primary,
            }}
          />
        </form>

        <div className="yd-dash-header-cockpit__actions flex shrink-0 items-center gap-2 lg:ml-auto">
          <Link
            href="/inbox"
            className="yd-dash-control relative flex h-12 w-12 items-center justify-center rounded-full transition duration-300"
            aria-label={
              inboxCount && inboxCount > 0
                ? `Benachrichtigungen, ${inboxCount} neu`
                : "Benachrichtigungen"
            }
          >
            <Bell className="h-[17px] w-[17px]" style={{ color: YD.sidebar.iconIdle }} strokeWidth={1.65} />
            {inboxCount && inboxCount > 0 ? (
              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-white/90"
                style={{ backgroundColor: "#E11D48" }}
                aria-hidden
              />
            ) : null}
          </Link>
          <Link
            href="/relay"
            className="yd-dash-control flex h-12 w-12 items-center justify-center rounded-full transition duration-300"
            aria-label="Nachrichten"
          >
            <MessageCircle
              className="h-[17px] w-[17px]"
              style={{ color: YD.sidebar.iconIdle }}
              strokeWidth={1.65}
            />
          </Link>
          <div
            className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/95"
            style={{ boxShadow: "0 2px 8px rgba(15, 35, 58, 0.08)" }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[11px] font-semibold tracking-wide text-white"
                style={{ background: YD.accent.iconGradient }}
              >
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
