import { WorkspaceHeaderControls } from "./workspace-header-controls";
import type { ThemePreference } from "@/lib/theme";

export type WorkspaceIntegratedHeaderProps = {
  eyebrow: string;
  greeting: string;
  hideGreeting?: boolean;
  displayName: string;
  subtitle: string;
  subtitleMeta?: string;
  email: string;
  workspaceName: string;
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
  role,
  initialTheme,
  avatarUrl,
  inboxCount,
  showSearch = true,
}: WorkspaceIntegratedHeaderProps) {
  return (
    <header className="yd-dash-header-premium yd-workspace-integrated-header w-full min-w-0 max-w-full">
      <div className="yd-dash-header-premium__grid">
        <div className="yd-dash-header-premium__identity">
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
        </div>

        <WorkspaceHeaderControls
          email={email}
          workspaceName={workspaceName}
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
