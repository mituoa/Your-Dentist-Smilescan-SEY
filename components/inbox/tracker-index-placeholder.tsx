/** Platzhalter rechte Spalte, wenn auf Desktop noch kein Fall gewählt ist. */
export function TrackerIndexPlaceholder() {
  return (
    <div
      className="yd-inbox-detail-root yd-inbox-index-placeholder flex h-full min-h-0 flex-1 flex-col items-center justify-center px-6"
      role="status"
    >
      <div className="yd-inbox-index-placeholder__card" aria-hidden>
        <span className="yd-inbox-index-placeholder__line yd-inbox-index-placeholder__line--wide" />
        <span className="yd-inbox-index-placeholder__line" />
        <span className="yd-inbox-index-placeholder__line yd-inbox-index-placeholder__line--short" />
      </div>
      <p className="yd-inbox-index-placeholder__title">Patient wählen</p>
      <p className="yd-inbox-index-placeholder__text">
        In der Liste links tippen — Fotos, Anliegen und Zeitraum erscheinen hier.
      </p>
    </div>
  );
}
