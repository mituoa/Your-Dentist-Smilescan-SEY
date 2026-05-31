import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";

import { YD } from "@/lib/design/yd-design-tokens";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  subtitle: string;
  avatarUrl?: string | null;
  profileDisplayName?: string | null;
  workspaceName: string;
  email: string;
  inboxCount?: number;
};

export function DashboardHeader({
  greeting,
  displayName,
  subtitle,
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
    <header className="yd-dash-header-axis w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-w-0 lg:max-w-[46%]">
          <p className="yd-dash-meta mb-2 uppercase tracking-[0.06em]">Praxisüberblick</p>
          <h1 className="yd-dash-title text-[1.375rem] md:text-[1.75rem]">
            {greeting}, {displayName}
          </h1>
          <p className="yd-dash-subtitle mt-2.5 max-w-xl text-[13px] font-medium md:mt-3 md:text-[14px]">
            {subtitle}
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-[560px] lg:flex-1 lg:justify-end">
          <form
            action="/inbox"
            method="get"
            className="relative min-w-0 flex-1 sm:min-w-[300px] lg:max-w-[400px]"
          >
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2"
              style={{ color: YD.text.faint }}
              strokeWidth={1.75}
            />
            <input
              type="search"
              name="q"
              placeholder="Patient oder Fall suchen …"
              className="yd-dash-search-input h-11 w-full min-w-0 pl-11 pr-4 text-[16px] font-normal outline-none transition placeholder:text-[#8BA3B8] focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.18)] md:h-12 md:text-[13px]"
              style={{
                background: YD.surface.search,
                border: `1px solid ${YD.border.soft}`,
                borderRadius: YD.radius.pill,
                color: YD.text.primary,
                boxShadow: "inset 0 1px 2px rgba(15,35,58,0.03)",
              }}
            />
          </form>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Link
              href="/inbox"
              className="yd-dash-control relative flex h-11 w-11 items-center justify-center rounded-full transition duration-300"
              aria-label={
                inboxCount && inboxCount > 0
                  ? `Tracker, ${inboxCount} neu`
                  : "Tracker"
              }
            >
              <Bell className="h-[17px] w-[17px]" style={{ color: YD.sidebar.iconIdle }} strokeWidth={1.65} />
              {inboxCount && inboxCount > 0 ? (
                <span
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-white/90"
                  style={{ backgroundColor: "#E11D48" }}
                  aria-hidden
                />
              ) : null}
            </Link>
            <Link
              href="/relay"
              className="yd-dash-control flex h-11 w-11 items-center justify-center rounded-full transition duration-300"
              aria-label="Relay"
            >
              <MessageCircle
                className="h-[17px] w-[17px]"
                style={{ color: YD.sidebar.iconIdle }}
                strokeWidth={1.65}
              />
            </Link>
            <div
              className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/80"
              style={{ boxShadow: YD.shadow.cardQuiet }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[10px] font-semibold tracking-wide text-white"
                  style={{ background: YD.accent.iconGradient }}
                >
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
