"use client";

import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";
import { PUBLIC_ENTRY_COPY } from "@/lib/marketing/public-entry-copy";

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
        <p className="yd-clinical-eyebrow">{PUBLIC_ENTRY_COPY.ecosystem.eyebrow}</p>
        <h2 id="yd-ecosystem-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {PUBLIC_ENTRY_COPY.ecosystem.title}
        </h2>
        <p className="yd-clinical-body yd-ecosystem-lead">{PUBLIC_ENTRY_COPY.ecosystem.lead}</p>
      </header>

      <div className="yd-ecosystem-grid">
        <article className="yd-ecosystem-panel yd-ecosystem-panel--relay">
          <div className="yd-ecosystem-panel-badge">Relay</div>
          <h3 className="yd-ecosystem-panel-title">Interne Kommunikation am Fall</h3>
          <p className="yd-ecosystem-panel-intro">
            Nachrichten, Gruppen, Übergaben und Aufgaben — strukturiert in Relay statt WhatsApp,
            Telefon und verstreuten E-Mails. Alles am Patientenfall, nichts geht unter.
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
          <h3 className="yd-ecosystem-panel-title">Ruhige Assistenz im Hintergrund</h3>
          <p className="yd-ecosystem-panel-intro">
            Command AI hilft Prioritäten zu erkennen, offene Übergaben sichtbar zu halten und Routinen
            zu überwachen — Entwürfe und Erinnerungen strukturiert, ohne futuristische Show.
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
