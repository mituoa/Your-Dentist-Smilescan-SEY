import { DashboardDailyStatus } from "@/components/dashboard/hc/dashboard-daily-status";
import type { DailyStatusMetrics } from "@/lib/dashboard/command-center";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  greetingName: string;
  dailyStatus: DailyStatusMetrics;
};

/** Begrüßung + Tagesstatus — ohne Suchleiste oder Doppeltexte. */
export function DashboardHeader({
  greeting,
  displayName,
  greetingName,
  dailyStatus,
}: DashboardHeaderProps) {
  return (
    <header className="yd-dash-header-axis yd-cockpit-header w-full min-w-0 max-w-full">
      <div className="yd-cockpit-header-greet md:hidden">
        <h1 className="yd-dash-title yd-dash-title--mobile">
          {greeting}, {greetingName}
        </h1>
        <DashboardDailyStatus metrics={dailyStatus} />
      </div>

      <div className="hidden md:block">
        <h1 className="yd-dash-title text-[1.65rem] lg:text-[1.75rem]">
          {greeting}, {displayName}
        </h1>
        <DashboardDailyStatus metrics={dailyStatus} />
      </div>
    </header>
  );
}
