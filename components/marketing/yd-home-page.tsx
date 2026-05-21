"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";

const MODULES = [
  {
    id: "atlas",
    name: "Atlas",
    role: "Praxisüberblick",
    body: "Ruhiger Überblick für Ihre Praxis: Kennzahlen, Verläufe und priorisierte Hinweise — ohne dichtes Admin-Dashboard.",
  },
  {
    id: "tracker",
    name: "Tracker",
    role: "Einsendungen",
    body: "Patientenanfragen und Überweisungsinhalte strukturiert erfassen, sichten und in den Arbeitsfluss überführen.",
  },
  {
    id: "relay",
    name: "Relay",
    role: "Aufgaben & Team",
    body: "Interne Aufgaben, Zuweisungen und Fristen im Praxisteam — klar, nachvollziehbar, ohne Ticket-Chaos.",
  },
  {
    id: "profile",
    name: "Praxisprofil",
    role: "Öffentliche Praxisseite",
    body: "Professionelle Präsenz mit Upload-Flow für Patienten und optionalen Termin- bzw. Kontaktwegen.",
  },
  {
    id: "journal",
    name: "Journal",
    role: "Aufklärung & Vertrauen",
    body: "Medizinisch fundierte Inhalte für Patientinnen — ruhig aufbereitet, an Ihre Praxis gebunden.",
  },
  {
    id: "workspace",
    name: "Workspace",
    role: "Praxis & Team",
    body: "Abgeschotteter Bereich pro Praxis: Rollen, Einladungen, Einstellungen und gemeinsamer Arbeitskontext.",
  },
] as const;

const WORKFLOW = [
  { step: "Einsendung", detail: "Patient oder Überweiser reicht Inhalte über Ihre Praxisseite ein." },
  { step: "Sichtung", detail: "Im Tracker strukturiert prüfen, priorisieren und zuordnen." },
  { step: "Bearbeitung", detail: "Relay-Aufgaben im Team, mit klarem Status und Verantwortlichkeit." },
  { step: "Abschluss", detail: "Dokumentation und Rückmeldung — der Überblick bleibt im Atlas." },
] as const;

const TRUST = [
  "Geschützter Praxis-Workspace pro Einrichtung",
  "Registrierung mit Prüfung und kontrollierter Freischaltung",
  "Verschlüsselte Verbindung im produktiven Betrieb",
  "DSGVO-orientierte, zurückhaltende Datenkommunikation in der Oberfläche",
] as const;

export function YdHomePage() {
  return (
    <div className="yd-home-page">
      <header className="yd-home-top yd-auth-awaken-field">
        <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" centered />
        <nav className="yd-home-top-nav" aria-label="Hauptnavigation">
          <Link prefetch href="/login" className="yd-auth-link">
            Anmelden
          </Link>
          <Link href="/pricing" className="yd-auth-btn-primary yd-home-top-cta">
            Praxis einrichten
          </Link>
        </nav>
      </header>

      <section className="yd-home-hero yd-auth-awaken-field" aria-labelledby="yd-home-hero-title">
        <p className="yd-home-eyebrow">Premium Dental Operating System</p>
        <h1 id="yd-home-hero-title" className="yd-home-hero-title">
          Ruhige klinische Infrastruktur für moderne Zahnarztpraxen
        </h1>
        <p className="yd-home-hero-lead">
          Your Dentist bündelt Einsendungen, Teamaufgaben, Praxisüberblick und öffentliche
          Patientenwege in einem geschützten Workspace — spatial, vertrauenswürdig und bewusst
          ohne Marketing-Lärm.
        </p>
        <div className="yd-home-hero-actions">
          <Link href="/pricing" className="yd-auth-btn-primary">
            Pakete & Registrierung
          </Link>
          <Link prefetch href="/login" className="yd-auth-btn-secondary">
            Zum Login
          </Link>
        </div>
      </section>

      <section className="yd-home-section yd-auth-awaken-field" aria-labelledby="yd-home-platform-title">
        <h2 id="yd-home-platform-title" className="yd-home-section-title">
          Was Your Dentist ist
        </h2>
        <p className="yd-home-section-lead">
          Kein generisches Praxis-CRM und kein Startup-Dashboard: ein operatives System für den
          klinischen Alltag — von der ersten Einsendung bis zur Team-Rückmeldung, in einer
          durchgängigen, medizinisch-professionellen Oberfläche.
        </p>
        <ul className="yd-home-pillars">
          <li>Ein Workspace pro Praxis — Daten und Team klar abgegrenzt</li>
          <li>Module mit festen Rollen: Überblick, Eingang, Aufgaben, Außenauftritt</li>
          <li>Freischaltung nach Registrierung und Prüfung — transparent und nachvollziehbar</li>
        </ul>
      </section>

      <section
        id="module"
        className="yd-home-section yd-auth-awaken-field"
        aria-labelledby="yd-home-modules-title"
      >
        <h2 id="yd-home-modules-title" className="yd-home-section-title">
          Module im Praxisbereich
        </h2>
        <p className="yd-home-section-lead">
          Jedes Modul folgt derselben ruhigen Gestaltungssprache wie der geschützte Arbeitsbereich —
          lesbar, hierarchisch und auf Entscheidungen im Praxisalltag ausgerichtet.
        </p>
        <div className="yd-home-modules-grid">
          {MODULES.map((m) => (
            <article key={m.id} className="yd-home-module-card">
              <p className="yd-home-module-name">{m.name}</p>
              <p className="yd-home-module-role">{m.role}</p>
              <p className="yd-home-module-body">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="yd-home-section yd-auth-awaken-field" aria-labelledby="yd-home-flow-title">
        <h2 id="yd-home-flow-title" className="yd-home-section-title">
          Typischer Praxisablauf
        </h2>
        <ol className="yd-home-flow-list">
          {WORKFLOW.map((item, i) => (
            <li key={item.step} className="yd-home-flow-item">
              <span className="yd-home-flow-num" aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className="yd-home-flow-step">{item.step}</p>
                <p className="yd-home-flow-detail">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="yd-home-section yd-auth-awaken-field" aria-labelledby="yd-home-trust-title">
        <h2 id="yd-home-trust-title" className="yd-home-section-title">
          Vertrauen & Betrieb
        </h2>
        <ul className="yd-home-trust-list">
          {TRUST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="yd-home-trust-note">
          Sensible Inhalte werden nur im vorgesehenen Kontext verarbeitet. Es werden keine
          unbelegten Zertifizierungs- oder Compliance-Versprechen in der Oberfläche verwendet.
        </p>
      </section>

      <section
        id="start"
        className="yd-home-cta-band yd-auth-awaken-field"
        aria-labelledby="yd-home-cta-title"
      >
        <h2 id="yd-home-cta-title" className="yd-home-cta-title">
          In den Praxisbereich starten
        </h2>
        <p className="yd-home-cta-lead">
          Neue Praxis: Paket wählen, registrieren, Freischaltung abwarten. Bestehende Nutzerinnen:
          direkt anmelden.
        </p>
        <div className="yd-home-cta-actions">
          <Link href="/pricing" className="yd-auth-btn-primary">
            Zu Paketen & Onboarding
          </Link>
          <Link prefetch href="/login" className="yd-auth-btn-secondary">
            Anmelden
          </Link>
        </div>
      </section>

      <footer className="yd-home-footer yd-auth-awaken-field">
        <div className="yd-home-footer-links">
          <Link href="/impressum" className="yd-auth-link">
            Impressum
          </Link>
          <Link href="/datenschutz" className="yd-auth-link">
            Datenschutz
          </Link>
          <Link href="/agb" className="yd-auth-link">
            AGB
          </Link>
        </div>
        <p className="yd-home-footer-copy">Your Dentist · Neutral Practice Platform</p>
      </footer>
    </div>
  );
}
