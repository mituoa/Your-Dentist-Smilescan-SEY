import { DashboardHeaderToolbar } from "@/components/dashboard/hc/dashboard-header-toolbar";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  attentionSummary: string;
  photoUrl?: string | null;
};

export function DashboardHeader({
  greeting,
  displayName,
  attentionSummary,
  photoUrl,
}: DashboardHeaderProps) {
  const initials = displayName
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="yd-cockpit-header">
      <div className="yd-cockpit-header__text">
        <h1 className="yd-cockpit-header__title">
          {greeting}, {displayName}
        </h1>
        <p className="yd-cockpit-header__subtitle" role="status">
          {attentionSummary}
        </p>
      </div>
      <DashboardHeaderToolbar photoUrl={photoUrl} initials={initials} />
    </header>
  );
}
