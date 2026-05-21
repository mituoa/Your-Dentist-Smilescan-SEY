import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";

import { DashboardMobileSearch } from "@/components/dashboard/hc/dashboard-mobile-search";
import { formatDoctorDisplayName } from "@/lib/format-doctor-display-name";
import { YD } from "@/lib/design/yd-design-tokens";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  subtitle: string;
  inboxCount?: number;
};

export function DashboardHeader({
  greeting,
  displayName,
  subtitle,
  inboxCount,
}: DashboardHeaderProps) {
  const doctorLabel = formatDoctorDisplayName(displayName);

  return (
    <header className="yd-dash-header-axis w-full min-w-0 max-w-full">
      {/* Mobile: ein Workspace-Header — kein Band-Duplikat, kein zweiter Avatar */}
      <div className="md:hidden">
        <div className="yd-dash-mobile-greeting">
          <p className="yd-dash-workspace-label">Praxisbereich</p>
          <h1 className="yd-dash-title text-[1.25rem] leading-tight tracking-[-0.024em]">
            {greeting}, {doctorLabel}
          </h1>
          <p className="yd-dash-subtitle mt-1.5 text-[13px] leading-snug text-[#5a6f84]">
            {subtitle}
          </p>
        </div>
        <DashboardMobileSearch inboxCount={inboxCount} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 lg:max-w-[48%]">
            <p className="yd-dash-meta mb-0.5 uppercase">Praxisüberblick</p>
            <h1 className="yd-dash-title text-[1.65rem] lg:text-[1.75rem]">
              {greeting}, {doctorLabel}
            </h1>
            <p className="yd-dash-subtitle mt-1.5 max-w-lg text-[13px]">{subtitle}</p>
          </div>

          <div className="flex w-full min-w-0 flex-1 items-center gap-3 lg:max-w-[560px] lg:justify-end">
            <form
              action="/inbox"
              method="get"
              className="yd-dash-search relative min-w-0 flex-1 sm:min-w-[300px] lg:min-w-[340px]"
            >
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-[17px] w-[17px] -translate-y-1/2"
                style={{ color: YD.text.faint }}
                strokeWidth={1.65}
              />
              <input
                type="search"
                name="q"
                placeholder="Fälle oder Patienten suchen…"
                className="yd-dash-search-input h-12 w-full min-w-0 pl-12 pr-5 text-[13px] font-normal outline-none transition-[box-shadow,filter] duration-700 placeholder:text-[#8BA3B8] focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.14)]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(236,244,252,0.95) 100%)",
                  border: "1px solid rgba(180, 198, 218, 0.42)",
                  borderRadius: YD.radius.pill,
                  color: YD.text.primary,
                  boxShadow:
                    "inset 0 1px 2px rgba(15,35,58,0.03), 0 0 0 1px rgba(255,255,255,0.5), 0 4px 20px rgba(47,128,237,0.06)",
                }}
              />
            </form>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/inbox"
                className="yd-dash-control relative flex h-11 w-11 items-center justify-center rounded-full"
                aria-label={
                  inboxCount && inboxCount > 0
                    ? `Posteingang, ${inboxCount} ungelesen`
                    : "Posteingang"
                }
              >
                <Bell
                  className="h-[17px] w-[17px]"
                  style={{ color: YD.sidebar.iconIdle }}
                  strokeWidth={1.65}
                />
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
                className="yd-dash-control relative flex h-11 w-11 items-center justify-center rounded-full"
                aria-label="Relay"
              >
                <MessageCircle
                  className="h-[17px] w-[17px]"
                  style={{ color: YD.sidebar.iconIdle }}
                  strokeWidth={1.65}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
