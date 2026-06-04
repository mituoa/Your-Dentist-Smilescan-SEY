/** Leere Arbeitsfläche — ohne Demo-Texte, nur Atmosphäre. */
export function TrackerIndexPlaceholder() {
  return (
    <div className="yd-tracker-workspace-placeholder" aria-hidden>
      <div className="yd-tracker-workspace-placeholder__glow" />
      <div className="yd-tracker-workspace-placeholder__frames">
        <span className="yd-tracker-workspace-placeholder__frame" />
        <span className="yd-tracker-workspace-placeholder__frame" />
        <span className="yd-tracker-workspace-placeholder__frame" />
      </div>
    </div>
  );
}
