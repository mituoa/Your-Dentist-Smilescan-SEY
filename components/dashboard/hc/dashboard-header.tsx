type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  attentionSummary: string;
};

/** Single greeting + one attention line — no duplicate context. */
export function DashboardHeader({
  greeting,
  displayName,
  attentionSummary,
}: DashboardHeaderProps) {
  return (
    <header className="yd-cockpit-header yd-cockpit-header-axis yd-dash-header-axis w-full min-w-0 max-w-full">
      <h1 className="yd-dash-title text-[1.5rem] md:text-[1.65rem] lg:text-[1.75rem]">
        {greeting}, {displayName}
      </h1>
      <p className="yd-dash-attention" role="status">
        {attentionSummary}
      </p>
    </header>
  );
}
