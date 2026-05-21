"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";

const MODULES = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Praxisüberblick",
    body: "Kennzahlen, Verläufe und priorisierte Hinweise — ruhig strukturiert, ohne Admin-Dichte.",
    span: "yd-public-module--span-5",
  },
  {
    id: "tracker",
    name: "Tracker",
    role: "Einsendungen",
    body: "Anfragen und Überweisungsinhalte erfassen, sichten und in den Arbeitsfluss überführen.",
    span: "yd-public-module--span-4",
  },
  {
    id: "relay",
    name: "Relay",
    role: "Aufgaben & Team",
    body: "Zuweisungen und Fristen im Praxisteam — nachvollziehbar, ohne Ticket-Chaos.",
    span: "yd-public-module--span-3",
  },
  {
    id: "profile",
    name: "Praxisprofil",
    role: "Öffentliche Praxisseite",
    body: "Professionelle Präsenz mit Upload-Flow und kontrollierten Kontaktwegen.",
    span: "yd-public-module--span-4",
  },
  {
    id: "journal",
    name: "Journal",
    role: "Aufklärung",
    body: "Medizinisch fundierte Inhalte für Patientinnen — an Ihre Praxis gebunden.",
    span: "yd-public-module--span-4",
  },
  {
    id: "workspace",
    name: "Workspace",
    role: "Praxis & Team",
    body: "Abgeschotteter Bereich: Rollen, Einladungen, Einstellungen, gemeinsamer Kontext.",
    span: "yd-public-module--span-4",
  },
] as const;

const WORKFLOW = [
  { step: "Einsendung", detail: "Inhalte über die Praxisseite — strukturiert und zweckgebunden." },
  { step: "Sichtung", detail: "Im Tracker prüfen, priorisieren und zuordnen." },
  { step: "Bearbeitung", detail: "Relay-Aufgaben mit Status und Verantwortlichkeit." },
  { step: "Abschluss", detail: "Rückmeldung und Überblick im Atlas." },
] as const;

const TRUST = [
  "Geschützter Praxis-Workspace pro Einrichtung",
  "Registrierung mit Prüfung und kontrollierter Freischaltung",
  "Verschlüsselte Verbindung im produktiven Betrieb",
  "DSGVO-orientierte, zurückhaltende Datenkommunikation",
] as const;

const PREVIEWS = [
  { kicker: "Modul", name: "Atlas", body: "Operativer Praxisüberblick", metric: "12" },
  { kicker: "Eingang", name: "Tracker", body: "Neue Einsendungen", metric: "3" },
  { kicker: "Team", name: "Relay", body: "Offene Aufgaben", metric: "7" },
] as const;

export function YdHomePage() {
  return (
    <div className="yd-public-page">
      <header
        className="yd-public-ops-bar yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "0" }}
      >
        <Link href="/" className="yd-auth-brand-link" aria-label="Startseite">
          <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" />
        </Link>
        <nav className="yd-public-ops-nav" aria-label="Hauptnavigation">
          <Link prefetch href="/login" className="yd-os-btn yd-os-btn--quiet">
            Anmelden
          </Link>
          <Link href="/pricing" className="yd-os-btn yd-os-btn--primary">
            Praxis einrichten
          </Link>
        </nav>
      </header>

      <section
        className="yd-public-hero yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-home-hero-title"
      >
        <div className="yd-public-hero-main">
          <p className="yd-os-eyebrow">Clinical Operating System</p>
          <h1 id="yd-home-hero-title" className="yd-os-title yd-os-title--lg">
            Infrastruktur für den klinischen Praxisalltag
          </h1>
          <p className="yd-os-lead">
            Your Dentist bündelt Einsendungen, Teamarbeit und Praxisüberblick in einem geschützten
            Workspace — dieselbe ruhige Gestaltungssprache wie im Arbeitsbereich, ohne
            Marketing-Oberfläche.
          </p>
          <div className="yd-public-hero-actions">
            <Link href="/pricing" className="yd-os-btn yd-os-btn--primary">
              Zugang einrichten
            </Link>
            <Link prefetch href="/login" className="yd-os-btn yd-os-btn--quiet">
              Anmelden
            </Link>
          </div>
        </div>

        <div className="yd-public-hero-stack" aria-hidden>
          {PREVIEWS.map((p, i) => (
            <div
              key={p.name}
              className={`yd-public-preview-card yd-spatial-surface ${
                i === 1 ? "yd-public-preview-card--offset" : i === 2 ? "yd-public-preview-card--pull" : ""
              }`}
            >
              <p className="yd-public-preview-kicker">{p.kicker}</p>
              <p className="yd-public-preview-name">{p.name}</p>
              <p className="yd-public-preview-body">{p.body}</p>
              <p className="yd-public-preview-metric">{p.metric}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="yd-public-zone yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "2" }}
        aria-labelledby="yd-home-platform-title"
      >
        <div className="yd-public-zone-header">
          <p className="yd-os-section-label">Plattform</p>
          <h2 id="yd-home-platform-title" className="yd-os-section-title">
            Operatives System — kein generisches Praxis-CRM
          </h2>
        </div>
        <div className="yd-public-pillars">
          <article className="yd-os-surface yd-os-surface-pad yd-public-pillar yd-spatial-surface">
            <p className="yd-public-pillar-title">Workspace</p>
            <p className="yd-public-pillar-body">Eine Praxis, ein abgeschotteter Bereich — Team und Daten klar getrennt.</p>
          </article>
          <article className="yd-os-surface yd-os-surface-pad yd-public-pillar yd-spatial-surface">
            <p className="yd-public-pillar-title">Module</p>
            <p className="yd-public-pillar-body">Atlas, Tracker, Relay — feste Rollen statt beliebiger Tool-Sammlung.</p>
          </article>
          <article className="yd-os-surface yd-os-surface-pad yd-public-pillar yd-spatial-surface">
            <p className="yd-public-pillar-title">Freischaltung</p>
            <p className="yd-public-pillar-body">Registrierung, Prüfung, Zugang — transparent und nachvollziehbar.</p>
          </article>
        </div>
      </section>

      <section
        id="module"
        className="yd-public-zone yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
        aria-labelledby="yd-home-modules-title"
      >
        <div className="yd-public-zone-header">
          <p className="yd-os-section-label">Module</p>
          <h2 id="yd-home-modules-title" className="yd-os-section-title">
            Praxisbereich — durchgängige Oberfläche
          </h2>
        </div>
        <div className="yd-public-modules">
          {MODULES.map((m) => (
            <article
              key={m.id}
              className={`yd-os-surface yd-os-surface-pad yd-spatial-surface yd-public-module ${m.span}`}
            >
              <p className="yd-public-module-name">{m.name}</p>
              <p className="yd-public-module-role">{m.role}</p>
              <p className="yd-public-module-body">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="yd-public-zone yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "4" }}
        aria-labelledby="yd-home-flow-title"
      >
        <div className="yd-os-surface yd-os-surface-pad--lg yd-spatial-surface">
          <div className="yd-public-zone-header">
            <p className="yd-os-section-label">Ablauf</p>
            <h2 id="yd-home-flow-title" className="yd-os-section-title">
              Typischer Praxisverlauf
            </h2>
          </div>
          <ol className="yd-public-flow">
            {WORKFLOW.map((item, i) => (
              <li key={item.step} className="yd-public-flow-step">
                <span className="yd-public-flow-num" aria-hidden>
                  {i + 1}
                </span>
                <p className="yd-public-flow-label">{item.step}</p>
                <p className="yd-public-flow-detail">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="yd-public-zone yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "5" }}
        aria-labelledby="yd-home-trust-title"
      >
        <div className="yd-public-trust-grid">
          <div className="yd-os-surface yd-os-surface-pad yd-spatial-surface">
            <p className="yd-os-section-label">Vertrauen</p>
            <h2 id="yd-home-trust-title" className="yd-os-section-title">
              Betrieb & Datenschutz
            </h2>
            <ul className="yd-public-trust-list">
              {TRUST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="yd-os-surface yd-os-surface--sunken yd-os-surface-pad">
            <p className="yd-public-trust-note">
              Sensible Inhalte werden nur im vorgesehenen Kontext verarbeitet. Es werden keine
              unbelegten Zertifizierungs- oder Compliance-Versprechen in der Oberfläche verwendet.
            </p>
          </div>
        </div>
      </section>

      <section
        id="start"
        className="yd-public-zone yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "6" }}
        aria-labelledby="yd-home-entry-title"
      >
        <div className="yd-os-surface yd-os-surface-pad--lg yd-spatial-surface">
          <div className="yd-public-entry-bar">
            <div>
              <p className="yd-os-section-label">Zugang</p>
              <h2 id="yd-home-entry-title" className="yd-os-section-title">
                In den Praxisbereich
              </h2>
              <p className="yd-os-lead" style={{ marginTop: "0.5rem", maxWidth: "28rem" }}>
                Neue Praxis: Paket und Registrierung. Bestehende Nutzerinnen: direkt anmelden.
              </p>
            </div>
            <div className="yd-public-entry-actions">
              <Link href="/pricing" className="yd-os-btn yd-os-btn--primary">
                Pakete & Onboarding
              </Link>
              <Link prefetch href="/login" className="yd-os-btn yd-os-btn--quiet">
                Anmelden
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="yd-public-footer yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "7" }}
      >
        <div className="yd-public-footer-links">
          <Link href="/impressum" className="yd-os-link">
            Impressum
          </Link>
          <Link href="/datenschutz" className="yd-os-link">
            Datenschutz
          </Link>
          <Link href="/agb" className="yd-os-link">
            AGB
          </Link>
        </div>
        <p className="yd-public-footer-copy">Your Dentist · Neutral Practice Platform</p>
      </footer>
    </div>
  );
}
