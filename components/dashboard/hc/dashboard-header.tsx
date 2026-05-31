type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  subtitle: string;
};

/** Praxis-Begrüßung — Aktionen/Suche leben in der globalen Workspace-Toolbar. */
export function DashboardHeader({ greeting, displayName, subtitle }: DashboardHeaderProps) {
  return (
    <header className="yd-dash-header-axis w-full min-w-0 max-w-full">
      <p className="yd-dash-meta mb-2.5 uppercase tracking-[0.06em]">Praxisüberblick</p>
      <h1 className="yd-dash-title text-[1.4375rem] md:text-[1.8125rem]">
        {greeting}, {displayName}
      </h1>
      <p className="yd-dash-subtitle mt-3 max-w-xl text-[13px] font-medium md:mt-3.5 md:text-[14px]">
        {subtitle}
      </p>
    </header>
  );
}
