import { ArrowRight, MessageSquare, Sparkles, ListTodo, Users } from "lucide-react";

import {
  PUBLIC_SITE_COMMAND,
  PUBLIC_SITE_SECTIONS,
} from "@/lib/marketing/public-site-ia";

const OUTCOME_ICONS = [MessageSquare, ListTodo, Users] as const;

/** Command AI — zentrales Produktversprechen auf der öffentlichen Landing Page. */
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
        <h2
          id="yd-public-command-title"
          className="yd-clinical-act-title yd-clinical-act-title--direct yd-public-command-title"
        >
          {PUBLIC_SITE_COMMAND.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_COMMAND.lead}</p>
      </header>

      <div className="yd-public-command-stage">
        <div className="yd-public-command-input" role="presentation">
          <span className="yd-public-command-input-icon" aria-hidden>
            <Sparkles className="h-4 w-4" strokeWidth={1.65} />
          </span>
          <p className="yd-public-command-input-text">
            „{PUBLIC_SITE_COMMAND.exampleCommand}"
          </p>
        </div>

        <ul className="yd-public-command-outcomes" aria-label="Vorbereitete Schritte">
          {PUBLIC_SITE_COMMAND.outcomes.map((outcome, i) => {
            const Icon = OUTCOME_ICONS[i] ?? ArrowRight;
            return (
              <li key={outcome.label} className="yd-public-command-outcome">
                <span className="yd-public-command-outcome-icon" aria-hidden>
                  <Icon className="h-4 w-4" strokeWidth={1.65} />
                </span>
                <div className="min-w-0">
                  <p className="yd-public-command-outcome-label">{outcome.label}</p>
                  <p className="yd-public-command-outcome-detail">{outcome.detail}</p>
                </div>
                <ArrowRight
                  className="yd-public-command-outcome-arrow h-4 w-4 shrink-0"
                  strokeWidth={1.65}
                  aria-hidden
                />
              </li>
            );
          })}
        </ul>

        <p className="yd-public-command-foot" role="note">
          Command AI arbeitet leise im Hintergrund — Sie prüfen und geben frei. Kein
          automatischer Versand an Patient:innen.
        </p>
      </div>
    </section>
  );
}
