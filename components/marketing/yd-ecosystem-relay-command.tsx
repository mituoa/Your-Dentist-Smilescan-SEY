"use client";

import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

const REPLACES = [
  "WhatsApp-Chaos",
  "mündliche Erinnerungen",
  "Post-its & Zettel",
  "verstreute E-Mails",
  "vergessene Übergaben",
] as const;

const RELAY_COMMUNICATION = [
  { label: "Direktnachrichten", example: "Team intern · am Fall" },
  { label: "Gruppen & Kanäle", example: "Labor · Implantat · ZFA" },
  { label: "Fallbezogen", example: "Kommunikation am Patientenfall" },
  { label: "Übergaben", example: "Urlaub · Schicht · Verantwortung" },
  { label: "Status & Rückfragen", example: "„Befund freigegeben?“" },
] as const;

const RELAY_ROUTINES = [
  { label: "Wiederkehrende Aufgaben", example: "Mo Laborkontrolle" },
  { label: "Täglich · wöchentlich · monatlich", example: "Steri · Hygiene" },
  { label: "Eigene Erinnerungen", example: "Rückruf · Nachfassen" },
  { label: "Praxisroutinen", example: "Teammeeting · Freigaben" },
] as const;

const COMMAND_ASSISTS = COMMAND_AI_PUBLIC.assists;

/** Public positioning — Relay + Command AI as calm practice infrastructure. */
export function YdEcosystemRelayCommand() {
  return (
    <section className="yd-ecosystem" aria-labelledby="yd-ecosystem-title">
      <header className="yd-ecosystem-head">
        <p className="yd-clinical-eyebrow">Ein Raum für den Praxisalltag</p>
        <h2 id="yd-ecosystem-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          Ihre Praxis arbeitet endlich ruhig zusammen
        </h2>
        <p className="yd-clinical-body yd-ecosystem-lead">
          Patient:innen senden Fotos und Anliegen strukturiert ein. Ihr Team koordiniert intern —
          mit Nachrichten, Gruppen, Übergaben und verlässlichen Erinnerungen. Command AI unterstützt
          im Hintergrund, ohne Lautstärke.
        </p>
      </header>

      <div className="yd-ecosystem-grid">
        <article className="yd-ecosystem-panel yd-ecosystem-panel--relay">
          <div className="yd-ecosystem-panel-badge">Relay</div>
          <h3 className="yd-ecosystem-panel-title">Ruhige interne Organisation</h3>
          <p className="yd-ecosystem-panel-intro">
            Kein Slack-Gefühl — Kommunikation, Übergaben und Routinen in einem geschützten
            Praxisbereich. Alles am Fall, nichts verstreut.
          </p>

          <p className="yd-ecosystem-replaces-label">Statt …</p>
          <ul className="yd-ecosystem-replaces">
            {REPLACES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="yd-ecosystem-cap-group-label">Interne Kommunikation</p>
          <ul className="yd-ecosystem-capabilities">
            {RELAY_COMMUNICATION.map((cap) => (
              <li key={cap.label} className="yd-ecosystem-cap">
                <span className="yd-ecosystem-cap-label">{cap.label}</span>
                <span className="yd-ecosystem-cap-example">{cap.example}</span>
              </li>
            ))}
          </ul>

          <p className="yd-ecosystem-cap-group-label">Routinen &amp; Erinnerungen</p>
          <ul className="yd-ecosystem-capabilities yd-ecosystem-capabilities--routines">
            {RELAY_ROUTINES.map((cap) => (
              <li key={cap.label} className="yd-ecosystem-cap">
                <span className="yd-ecosystem-cap-label">{cap.label}</span>
                <span className="yd-ecosystem-cap-example">{cap.example}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="yd-ecosystem-panel yd-ecosystem-panel--command">
          <div className="yd-ecosystem-panel-badge yd-ecosystem-panel-badge--ai">Command AI</div>
          <h3 className="yd-ecosystem-panel-title">Leise Assistenz — auch zwischen Behandlungen</h3>
          <p className="yd-ecosystem-panel-intro">
            Sprechen statt tippen: Command bereitet Texte und Aufgaben als Entwurf vor. In Lücken im
            Tagesablauf bleiben Rückrufe, Freigaben und Routine übersichtlich — Sie entscheiden, nichts
            läuft automatisch an Patient:innen.
          </p>

          <ul className="yd-ecosystem-command-list">
            {COMMAND_ASSISTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="yd-ecosystem-command-whisper" role="note">
            <p className="yd-ecosystem-command-whisper-label">Im Hintergrund</p>
            <p className="yd-ecosystem-command-whisper-body">„{COMMAND_AI_PUBLIC.whisper}“</p>
          </div>
        </article>
      </div>
    </section>
  );
}
