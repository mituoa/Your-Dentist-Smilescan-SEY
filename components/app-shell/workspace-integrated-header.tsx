import { WorkspaceHeaderControls } from "./workspace-header-controls";
import type { DashboardEditorialHeader } from "@/lib/dashboard/dashboard-header-summary";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type WorkspaceIntegratedHeaderProps = {
  eyebrow: string;
  greeting: string;
  hideGreeting?: boolean;
  displayName: string;
  subtitle: string;
  subtitleMeta?: string;
  dashboardEditorial?: DashboardEditorialHeader | null;
  email: string;
  workspaceName: string;
  workspaceId: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  inboxCount?: number;
  showSearch?: boolean;
};

/** Integrierte Praxis-Headline — einheitlich in Dashboard, Tracker, Relay & Co. */
export function WorkspaceIntegratedHeader({
  eyebrow,
  greeting,
  hideGreeting = false,
  displayName,
  subtitle,
  subtitleMeta,
  email,
  workspaceName,
  workspaceId,
  role,
  initialTheme,
  avatarUrl,
  inboxCount,
  showSearch = true,
  dashboardEditorial = null,
}: WorkspaceIntegratedHeaderProps) {
  const editorial = dashboardEditorial;

  return (
    <header
      className={cn(
        "yd-dash-header-premium yd-workspace-integrated-header w-full min-w-0 max-w-full",
        editorial && "yd-dash-header-premium--editorial"
      )}
    >
      <div className="yd-dash-header-premium__grid">
        <div className="yd-dash-header-premium__identity">
          {editorial ? (
            <div className="yd-dash-header-premium__editorial-greeting">
              <p className="yd-dash-header-premium__editorial-time">{greeting}</p>
              <h1 className="yd-dash-header-premium__editorial-name">{displayName}</h1>
            </div>
          ) : (
            <>
              <h1 className="yd-dash-header-premium__headline">{eyebrow}</h1>
              {hideGreeting ? null : (
                <p className="yd-dash-header-premium__greeting">
                  {greeting}, {displayName}
                </p>
              )}
              <p className="yd-dash-header-premium__subtitle">{subtitle}</p>
              {subtitleMeta ? (
                <p className="yd-dash-header-premium__subtitle-meta">{subtitleMeta}</p>
              ) : null}
            </>
          )}
        </div>

        <WorkspaceHeaderControls
          email={email}
          workspaceName={workspaceName}
          workspaceId={workspaceId}
          role={role}
          initialTheme={initialTheme}
          avatarUrl={avatarUrl}
          displayName={displayName}
          inboxCount={inboxCount}
          showSearch={showSearch}
        />
      </div>
    </header>
  );
}
