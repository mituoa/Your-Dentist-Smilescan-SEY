type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  subtitle: string;
};

/** Nur Seiteninhalt — Aktionen/Suche leben in der globalen Workspace-Toolbar. */
export function DashboardHeader({ greeting, displayName, subtitle }: DashboardHeaderProps) {
  return (
    <header className="yd-dash-header-axis w-full min-w-0 max-w-full">
      <p className="yd-dash-meta mb-2 uppercase tracking-[0.06em]">Praxisüberblick</p>
      <h1 className="yd-dash-title text-[1.375rem] md:text-[1.75rem]">
        {greeting}, {displayName}
      </h1>
      <p className="yd-dash-subtitle mt-2.5 max-w-xl text-[13px] font-medium md:mt-3 md:text-[14px]">
        {subtitle}
      </p>
    </header>
  );
}
