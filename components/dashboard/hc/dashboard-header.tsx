import { DashboardHeaderControls } from "./dashboard-header-controls";
import type { ThemePreference } from "@/lib/theme";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  subtitle: string;
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  inboxCount?: number;
};

/** Integrierte Praxis-Headline — Begrüßung links, Suche & Aktionen rechts (Referenz-Layout). */
export function DashboardHeader({
  greeting,
  displayName,
  subtitle,
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  inboxCount,
}: DashboardHeaderProps) {
  return (
    <header className="yd-dash-header-premium w-full min-w-0 max-w-full">
      <div className="yd-dash-header-premium__grid">
        <div className="yd-dash-header-premium__identity">
          <p className="yd-dash-header-premium__headline">Praxisüberblick</p>
          <h1 className="yd-dash-header-premium__greeting">
            {greeting}, {displayName}
          </h1>
          <p className="yd-dash-header-premium__subtitle">{subtitle}</p>
        </div>

        <DashboardHeaderControls
          email={email}
          workspaceName={workspaceName}
          role={role}
          initialTheme={initialTheme}
          avatarUrl={avatarUrl}
          displayName={displayName}
          inboxCount={inboxCount}
        />
      </div>
    </header>
  );
}
