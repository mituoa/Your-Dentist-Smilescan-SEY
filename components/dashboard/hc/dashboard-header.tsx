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
    <header className="mb-8 flex w-full min-w-0 max-w-full flex-col gap-5 md:flex-row md:items-center md:gap-10">
      <div className="min-w-0 md:flex-[1.15]">
        <h1
          className="text-[23px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[28px]"
          style={{ color: YD.text.primary }}
        >
          {greeting}, {displayName} 👋
        </h1>
        <p
          className="mt-2 text-[13px] font-normal leading-relaxed md:text-[14px]"
          style={{ color: YD.text.secondary }}
        >
          {subtitle}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center md:max-w-[600px] md:flex-1 md:justify-end">
        <form action="/inbox" method="get" className="relative min-w-0 flex-1 sm:min-w-[300px]">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2"
            style={{ color: YD.text.muted }}
            strokeWidth={2}
          />
          <input
            type="search"
            name="q"
            placeholder="Suchen…"
            className="h-11 w-full min-w-0 pl-11 pr-4 text-[14px] outline-none transition placeholder:font-normal focus-visible:ring-2"
            style={{
              background: YD.surface.search,
              border: `1px solid ${YD.border.soft}`,
              borderRadius: YD.radius.pill,
              color: YD.text.primary,
              boxShadow: "inset 0 1px 2px rgba(15,35,58,0.04)",
            }}
          />
        </form>

        <div className="flex shrink-0 items-center justify-end gap-2.5">
          <Link
            href="/inbox"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition"
            style={{
              background: "rgba(255,255,255,0.75)",
              boxShadow: "0 4px 14px rgba(30,91,189,0.12)",
            }}
            aria-label={
              inboxCount && inboxCount > 0
                ? `Posteingang, ${inboxCount} ungelesen`
                : "Posteingang"
            }
          >
            <Bell className="h-[18px] w-[18px]" style={{ color: YD.sidebar.iconIdle }} strokeWidth={1.75} />
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
            className="flex h-10 w-10 items-center justify-center rounded-full transition"
            style={{
              background: "rgba(255,255,255,0.75)",
              boxShadow: "0 4px 14px rgba(30,91,189,0.12)",
            }}
            aria-label="Relay"
          >
            <MessageCircle
              className="h-[18px] w-[18px]"
              style={{ color: YD.sidebar.iconIdle }}
              strokeWidth={1.75}
            />
          </Link>
          <div
            className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/90"
            style={{ boxShadow: YD.shadow.card }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-[11px] font-semibold"
                style={{
                  background: YD.accent.iconGradient,
                  color: "#fff",
                }}
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
