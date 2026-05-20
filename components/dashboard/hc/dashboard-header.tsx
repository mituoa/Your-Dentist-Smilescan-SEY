import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";

import { HC } from "@/lib/design/healthcare-dashboard-tokens";

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
    <header className="mb-6 flex w-full min-w-0 max-w-full flex-col gap-4 md:mb-7 md:flex-row md:items-center md:gap-8">
      <div className="min-w-0 md:flex-[1.1]">
        <h1
          className="text-[22px] font-bold leading-[1.15] tracking-[-0.025em] md:text-[27px]"
          style={{ color: HC.text }}
        >
          {greeting}, {displayName} 👋
        </h1>
        <p className="mt-1.5 text-[13px] font-normal md:text-[14px]" style={{ color: HC.textSecondary }}>
          {subtitle}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center md:max-w-[580px] md:flex-1 md:justify-end">
        <form action="/inbox" method="get" className="relative min-w-0 flex-1 sm:min-w-[280px]">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2"
            style={{ color: HC.textMuted }}
            strokeWidth={2}
          />
          <input
            type="search"
            name="q"
            placeholder="Suchen…"
            className="h-11 w-full min-w-0 pl-11 pr-4 text-[14px] outline-none transition placeholder:font-normal focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.22)]"
            style={{
              backgroundColor: HC.searchBg,
              border: `1px solid ${HC.searchBorder}`,
              borderRadius: HC.pillRadius,
              color: HC.text,
            }}
          />
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2.5">
          <Link
            href="/inbox"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition hover:bg-white"
            style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}
            aria-label={
              inboxCount && inboxCount > 0
                ? `Posteingang, ${inboxCount} ungelesen`
                : "Posteingang"
            }
          >
            <Bell className="h-[18px] w-[18px]" style={{ color: HC.iconMuted }} strokeWidth={1.75} />
            {inboxCount && inboxCount > 0 ? (
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white"
                style={{ backgroundColor: "#EF4444" }}
                aria-hidden
              />
            ) : null}
          </Link>
          <Link
            href="/relay"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition hover:bg-white"
            style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}
            aria-label="Relay"
          >
            <MessageCircle
              className="h-[18px] w-[18px]"
              style={{ color: HC.iconMuted }}
              strokeWidth={1.75}
            />
          </Link>
          <div
            className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white"
            style={{ boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)" }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[11px] font-semibold"
                style={{ background: HC.primarySoft, color: HC.primaryDark }}
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
