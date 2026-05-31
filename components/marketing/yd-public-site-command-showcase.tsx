import { Sparkles } from "lucide-react";

import {
  PUBLIC_SITE_COMMAND,
  PUBLIC_SITE_SECTIONS,
} from "@/lib/marketing/public-site-ia";

/** Command AI — leise Assistenz, zwei konkrete Praxisbeispiele. */
export function YdPublicSiteCommandShowcase() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.command}
      className="yd-public-site-section yd-public-site-section--command yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "3" }}
      aria-labelledby="yd-public-command-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_COMMAND.eyebrow}</p>
        <h2 id="yd-public-command-title" className="yd-clinical-act-title yd-public-command-title">
          {PUBLIC_SITE_COMMAND.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_COMMAND.lead}</p>
      </header>

      <div className="yd-public-command-demos">
        {PUBLIC_SITE_COMMAND.demos.map((demo) => (
          <article
            key={demo.command}
            className="yd-public-command-stage yd-public-command-stage--compact yd-public-command-demo"
          >
            <div className="yd-public-command-input" role="presentation">
              <span className="yd-public-command-input-icon" aria-hidden>
                <Sparkles className="h-4 w-4" strokeWidth={1.65} />
              </span>
              <p className="yd-public-command-input-text">„{demo.command}"</p>
            </div>
            <ul className="yd-public-command-outcomes yd-public-command-outcomes--compact" aria-label="Ergebnis">
              {demo.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="yd-public-command-outcome yd-public-command-outcome--compact"
                >
                  <span className="yd-public-command-outcome-check" aria-hidden>
                    ✓
                  </span>
                  <span className="yd-public-command-outcome-label">{outcome}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
