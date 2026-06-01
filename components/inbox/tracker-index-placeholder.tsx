/** Platzhalter rechte Spalte, wenn auf Desktop noch kein Fall gewählt ist. */
export function TrackerIndexPlaceholder() {
  return (
    <div
      className="yd-inbox-detail-root yd-inbox-index-placeholder flex h-full min-h-0 flex-1 flex-col"
      role="status"
    >
      <p className="yd-inbox-index-placeholder__title">Fall auswählen</p>
      <p className="yd-inbox-index-placeholder__text">
        Wählen Sie in der Tabelle links einen Patientenfall — die Detailansicht öffnet sich hier.
      </p>
    </div>
  );
}
