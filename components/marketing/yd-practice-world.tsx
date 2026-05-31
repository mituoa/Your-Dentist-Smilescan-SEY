import { PUBLIC_SITE_HERO_PREVIEW } from "@/lib/marketing/public-site-ia";

/**
 * Abstrakte Produktvorschau — Eingang + Command AI als WOW-Moment.
 * Keine Patientendaten auf der öffentlichen Landing.
 */
export function YdPracticeWorld() {
  const preview = PUBLIC_SITE_HERO_PREVIEW;

  return (
    <div
      className="yd-practice-world yd-practice-world--premium yd-practice-world--orchestrated yd-practice-world--abstract yd-practice-world--pipeline"
      role="img"
      aria-label="Produktvorschau: Neue Anfrage strukturiert, Command AI bereitet Antwort vor"
    >
      <p className="yd-practice-world-kicker">
        <span className="yd-practice-world-kicker-dot" aria-hidden />
        Praxisbereich
      </p>

      <div className="yd-practice-world-pipeline">
        <article className="yd-practice-world-pipeline-step">
          <p className="yd-practice-world-pipeline-title">{preview.intakeTitle}</p>
          <ul className="yd-practice-world-abstract-flow" aria-label="Bearbeitungsstand">
            {preview.intakeChecks.map((step) => (
              <li key={step} className="yd-practice-world-abstract-step">
                <span className="yd-practice-world-abstract-check" aria-hidden>
                  ✓
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="yd-practice-world-pipeline-connector" aria-hidden>
          <span className="yd-practice-world-pipeline-arrow" />
        </div>

        <article className="yd-practice-world-pipeline-step yd-practice-world-pipeline-step--command">
          <span className="yd-practice-world-label">{preview.commandLabel}</span>
          <p className="yd-practice-world-command-phrase">„{preview.commandPhrase}"</p>
          <ul className="yd-practice-world-abstract-flow" aria-label="Command AI Ergebnis">
            {preview.commandOutcomes.map((step) => (
              <li key={step} className="yd-practice-world-abstract-step">
                <span className="yd-practice-world-abstract-check" aria-hidden>
                  ✓
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
