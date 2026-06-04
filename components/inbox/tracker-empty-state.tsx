type TrackerEmptyStateProps = {
  title: string;
  description: string;
};

/** Ruhiger Leerzustand — Dashboard-Sprache, keine Tabellen-Card. */
export function TrackerEmptyState({ title, description }: TrackerEmptyStateProps) {
  return (
    <div
      className="yd-tracker-empty yd-dash-surface flex flex-1 flex-col items-center justify-center px-6 py-14 text-center"
      role="status"
    >
      <p className="yd-tracker-empty__title">{title}</p>
      <p className="yd-tracker-empty__text">{description}</p>
    </div>
  );
}
