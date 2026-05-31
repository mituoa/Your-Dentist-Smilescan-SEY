"use client";

import { PUBLIC_SITE_RELAY, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";

/** Relay — reduziert, ohne Doppelung zu Command AI. */
export function YdEcosystemRelayCommand() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.plattform}
      className="yd-ecosystem yd-ecosystem--lean yd-public-site-section yd-public-site-scroll-anchor yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "4" }}
      aria-labelledby="yd-ecosystem-title"
    >
      <header className="yd-ecosystem-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_RELAY.eyebrow}</p>
        <h2 id="yd-ecosystem-title" className="yd-clinical-act-title">
          {PUBLIC_SITE_RELAY.title}
        </h2>
        <p className="yd-clinical-body yd-ecosystem-lead">{PUBLIC_SITE_RELAY.lead}</p>
      </header>

      <article className="yd-ecosystem-panel yd-ecosystem-panel--relay yd-ecosystem-panel--lean">
        <div className="yd-ecosystem-panel-badge">Relay</div>
        <ul className="yd-ecosystem-capabilities yd-ecosystem-capabilities--lean">
          {PUBLIC_SITE_RELAY.capabilities.map((label) => (
            <li key={label} className="yd-ecosystem-cap yd-ecosystem-cap--lean">
              <span className="yd-ecosystem-cap-label">{label}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
