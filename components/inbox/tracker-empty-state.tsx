type TrackerEmptyStateProps = {
  title: string;
  description: string;
};

/** Ruhiger Leerzustand — ohne Dashboard-Card. */
export function TrackerEmptyState({ title, description }: TrackerEmptyStateProps) {
  return (
    <div className="yd-triage-placeholder flex-1" role="status">
      <p className="yd-triage-placeholder__title">{title}</p>
      <p className="yd-triage-placeholder__lead">{description}</p>
    </div>
  );
}
