"use client";

/**
 * Atmospheric product preview — dashboard DNA without live data.
 * Hero visual: patient upload → inbox → relay in one spatial composition.
 */
export function YdProductPreview() {
  return (
    <div
      className="yd-product-preview"
      role="img"
      aria-label="Vorschau: Patienten-Upload, Einsendungen in der Inbox und Teamaufgabe im Relay"
    >
      <div className="yd-product-preview-glow" aria-hidden />
      <div className="yd-product-preview-stage">
        <div className="yd-product-preview-card yd-product-preview-card--upload">
          <span className="yd-product-preview-card-label">Patient sendet ein</span>
          <p className="yd-product-preview-card-title">Fotos & Anliegen</p>
          <p className="yd-product-preview-card-meta">Über Ihren Praxislink — klar und freundlich</p>
          <div className="yd-product-preview-thumbs" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="yd-product-preview-panel">
          <div className="yd-product-preview-panel-head">
            <span className="yd-product-preview-panel-brand">Tracker</span>
            <span className="yd-product-preview-panel-badge">3 neue</span>
          </div>
          <ul className="yd-product-preview-rows">
            <li className="yd-product-preview-row yd-product-preview-row--active">
              <span className="yd-product-preview-row-dot" aria-hidden />
              <div>
                <p className="yd-product-preview-row-name">Neue Einsendung · M. K.</p>
                <p className="yd-product-preview-row-meta">Bereit zur Sichtung · vor 12 Min.</p>
              </div>
            </li>
            <li className="yd-product-preview-row">
              <span className="yd-product-preview-row-dot yd-product-preview-row-dot--muted" aria-hidden />
              <div>
                <p className="yd-product-preview-row-name">Einsendung · L. R.</p>
                <p className="yd-product-preview-row-meta">In Bearbeitung</p>
              </div>
            </li>
            <li className="yd-product-preview-row">
              <span className="yd-product-preview-row-dot yd-product-preview-row-dot--muted" aria-hidden />
              <div>
                <p className="yd-product-preview-row-name">Einsendung · anonym</p>
                <p className="yd-product-preview-row-meta">Teamkommentar hinzugefügt</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="yd-product-preview-card yd-product-preview-card--relay">
          <span className="yd-product-preview-card-label">Teamaufgabe</span>
          <p className="yd-product-preview-card-title">Rückfrage in Ruhe klären</p>
          <p className="yd-product-preview-card-meta">Direkt am Fall · klar zugeordnet</p>
        </div>
      </div>
    </div>
  );
}
