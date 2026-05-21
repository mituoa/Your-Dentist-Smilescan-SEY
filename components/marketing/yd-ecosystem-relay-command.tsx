"use client";

const REPLACES = [
  "WhatsApp-Chaos",
  "mündliche Erinnerungen",
  "Post-its & Zettel",
  "verstreute E-Mails",
  "vergessene Übergaben",
] as const;

const RELAY_CAPABILITIES = [
  { label: "Interne Nachrichten", example: "„Röntgenfreigabe prüfen“" },
  { label: "Gruppen", example: "Laborrückfragen · Implantatfälle" },
  { label: "Wiederkehrende Routinen", example: "Laborkontrolle jeden Montag" },
  { label: "Erinnerungen", example: "Rückruf morgen · Steri täglich" },
  { label: "Klare Verantwortung", example: "Urlaubsübergabe · Teammeeting" },
] as const;

const COMMAND_ASSISTS = [
  "Prioritäten im Eingang einordnen",
  "Abläufe im Überblick halten",
  "Erinnerungen im richtigen Moment",
  "Kommunikation am Fall bündeln",
  "Weniger mentale Last im Team",
] as const;

/** Public positioning — Relay as communication layer, Command AI as quiet assistance. */
export function YdEcosystemRelayCommand() {
  return (
    <section
      className="yd-ecosystem"
      aria-labelledby="yd-ecosystem-title"
    >
      <header className="yd-ecosystem-head">
        <p className="yd-clinical-eyebrow">Das eigentliche Versprechen</p>
        <h2 id="yd-ecosystem-title" className="yd-clinical-act-title">
          Ihre Praxis arbeitet endlich <em>ruhig zusammen</em>
        </h2>
        <p className="yd-clinical-body yd-ecosystem-lead">
          Patient:innen senden strukturiert ein. Ihr Team koordiniert intern — mit Nachrichten,
          Routinen und verlässlichen Erinnerungen in einem geschützten Bereich. Command AI unterstützt
          leise im Hintergrund, ohne Lautstärke.
        </p>
      </header>

      <div className="yd-ecosystem-grid">
        <article className="yd-ecosystem-panel yd-ecosystem-panel--relay">
          <div className="yd-ecosystem-panel-badge">Relay</div>
          <h3 className="yd-ecosystem-panel-title">Ruhige interne Kommunikation</h3>
          <p className="yd-ecosystem-panel-intro">
            Kein Aufgaben-Board-Gefühl — ein Ort für Abstimmung, Übergaben und Praxisroutinen. Ersetzt
            Nebenkanäle, ohne Chat-App-Ästhetik.
          </p>

          <p className="yd-ecosystem-replaces-label">Statt …</p>
          <ul className="yd-ecosystem-replaces">
            {REPLACES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <ul className="yd-ecosystem-capabilities">
            {RELAY_CAPABILITIES.map((cap) => (
              <li key={cap.label} className="yd-ecosystem-cap">
                <span className="yd-ecosystem-cap-label">{cap.label}</span>
                <span className="yd-ecosystem-cap-example">{cap.example}</span>
              </li>
            ))}
          </ul>

          <div className="yd-ecosystem-moments" aria-hidden>
            <div className="yd-ecosystem-moment">
              <span className="yd-ecosystem-moment-type">Nachricht</span>
              <p>MFAs → Zahnärztin: „Befund passt?“</p>
            </div>
            <div className="yd-ecosystem-moment">
              <span className="yd-ecosystem-moment-type">Gruppe</span>
              <p>Morgenbesprechung · 3 Teilnehmende</p>
            </div>
            <div className="yd-ecosystem-moment yd-ecosystem-moment--routine">
              <span className="yd-ecosystem-moment-type">Routine</span>
              <p>Steri-Kontrolle · täglich 08:00</p>
            </div>
          </div>
        </article>

        <article className="yd-ecosystem-panel yd-ecosystem-panel--command">
          <div className="yd-ecosystem-panel-badge yd-ecosystem-panel-badge--ai">Command AI</div>
          <h3 className="yd-ecosystem-panel-title">Leise intelligente Unterstützung</h3>
          <p className="yd-ecosystem-panel-intro">
            Kein KI-Marketing — Orientierung im Arbeitsfluss. Weniger mentale Überlastung für
            Ärztinnen und Team, mehr Klarheit bei Prioritäten und nächsten Schritten.
          </p>

          <ul className="yd-ecosystem-command-list">
            {COMMAND_ASSISTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="yd-ecosystem-command-whisper" role="note">
            <p className="yd-ecosystem-command-whisper-label">Im Hintergrund</p>
            <p className="yd-ecosystem-command-whisper-body">
              „Drei Einsendungen warten auf Sichtung — Laborrückfrage zuerst einordnen.“
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
