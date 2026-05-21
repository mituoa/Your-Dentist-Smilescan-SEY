"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdEditorialFigure } from "@/components/marketing/yd-editorial-figure";
import { PUBLIC_EDITORIAL_IMAGES } from "@/lib/marketing/public-editorial-images";

const VALUES = [
  {
    title: "Ruhe im Alltag",
    body: "Weniger Reibung zwischen Patientenweg, Team und Überblick — damit der Fokus auf der Behandlung bleibt.",
  },
  {
    title: "Vertrauen durch Klarheit",
    body: "Nachvollziehbare Schritte, geschützte Bereiche und ehrliche Kommunikation — ohne Marketing-Versprechen.",
  },
  {
    title: "Moderne Infrastruktur",
    body: "Spatial gestaltet, medizinisch professionell — Technologie, die sich wie ein ruhiger Raum anfühlt, nicht wie Software-Lärm.",
  },
] as const;

const WORKFLOW = [
  {
    step: "Einsendung",
    detail: "Patientinnen und Überweiser erreichen Ihre Praxis über einen klaren, geschützten Weg.",
  },
  {
    step: "Sichtung",
    detail: "Im Tracker priorisieren Sie Inhalte — strukturiert, ohne E-Mail-Chaos.",
  },
  {
    step: "Teamarbeit",
    detail: "Relay hält Aufgaben, Verantwortung und Status im Praxisalltag zusammen.",
  },
  {
    step: "Überblick",
    detail: "Atlas gibt Orientierung — ruhig, ohne dichte Admin-Oberfläche.",
  },
] as const;

const MODULES = [
  { name: "Atlas", role: "Praxisüberblick", body: "Kennzahlen und Verläufe mit klinischer Ruhe." },
  { name: "Tracker", role: "Einsendungen", body: "Eingang, Sichtung und Zuordnung in einem Fluss." },
  { name: "Relay", role: "Aufgaben", body: "Teamkoordination mit klarem Status." },
  { name: "Profil", role: "Praxisseite", body: "Öffentliche Präsenz mit kontrollierten Wegen." },
  { name: "Journal", role: "Aufklärung", body: "Medizinische Inhalte — an Ihre Praxis gebunden." },
  { name: "Workspace", role: "Praxis & Team", body: "Rollen, Einladungen, gemeinsamer Kontext." },
] as const;

const TRUST = [
  "Ein geschützter Workspace pro Praxis",
  "Freischaltung nach Registrierung und Prüfung",
  "Verschlüsselte Verbindung im produktiven Betrieb",
  "DSGVO-orientierte, zurückhaltende Oberflächenkommunikation",
] as const;

export function YdHomePage() {
  const heroImg = PUBLIC_EDITORIAL_IMAGES.heroClinic;
  const trustImg = PUBLIC_EDITORIAL_IMAGES.trustClinical;

  return (
    <article className="yd-public-page">
      <header
        className="yd-public-top yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "0" }}
      >
        <Link href="/" className="yd-auth-brand-link" aria-label="Startseite">
          <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" />
        </Link>
        <nav className="yd-public-top-nav" aria-label="Hauptnavigation">
          <Link prefetch href="/login" className="yd-os-btn yd-os-btn--ghost">
            Anmelden
          </Link>
          <Link href="/pricing" className="yd-os-btn yd-os-btn--primary">
            Praxis einrichten
          </Link>
        </nav>
      </header>

      {/* 1 — Cinematic hero */}
      <section
        className="yd-public-hero-cinema yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-home-hero-title"
      >
        <div className="yd-public-hero-cinema-bg" aria-hidden />
        <div className="yd-public-hero-cinema-layout">
          <div className="yd-public-hero-cinema-copy">
            <p className="yd-public-kicker">Premium Dental Operating System</p>
            <h1 id="yd-home-hero-title" className="yd-public-display">
              Infrastruktur, der <em>moderne Praxen</em> vertrauen
            </h1>
            <p className="yd-public-lead yd-public-lead--hero">
              Your Dentist verbindet klinische Klarheit mit emotionaler Ruhe — für Teams, die
              professionell arbeiten und dabei menschlich bleiben wollen.
            </p>
            <div className="yd-public-hero-actions">
              <Link href="/pricing" className="yd-os-btn yd-os-btn--primary">
                Praxis einrichten
              </Link>
              <Link prefetch href="/login" className="yd-os-btn yd-os-btn--ghost">
                Anmelden
              </Link>
            </div>
            <p className="yd-public-hero-trust-line">
              Für ernsthafte Praxen — ohne Startup-Funnel, ohne unbelegte Compliance-Claims.
            </p>
          </div>

          <div className="yd-public-hero-cinema-visual">
            <YdEditorialFigure
              src={heroImg.src}
              alt={heroImg.alt}
              width={heroImg.width}
              height={heroImg.height}
              priority
              variant="hero"
              caption="Ruhige klinische Umgebung — Licht, Ordnung, Vertrauen"
            />
            <div className="yd-public-hero-glass-note" aria-hidden>
              <span className="yd-public-hero-glass-note-label">Eingang heute</span>
              <span className="yd-public-hero-glass-note-value">strukturiert</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Calm value */}
      <section
        className="yd-public-story yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "2" }}
        aria-labelledby="yd-home-value-title"
      >
        <div className="yd-public-story-inner">
          <p className="yd-public-section-kicker">Warum Your Dentist</p>
          <h2 id="yd-home-value-title" className="yd-public-section-title yd-public-section-title--editorial">
            Technologie, die sich nach <em>Verantwortung</em> anfühlt — nicht nach Software
          </h2>
          <p className="yd-public-prose">
            Viele Praxen jonglieren zwischen E-Mail, Tabellen und isolierten Tools. Your Dentist
            schafft einen zusammenhängenden Raum: vom ersten Kontakt bis zur Team-Rückmeldung — mit
            der gleichen ruhigen Qualität, die Sie von hochwertiger Medizintechnik kennen.
          </p>
          <div className="yd-public-value-row">
            {VALUES.map((v) => (
              <div key={v.title} className="yd-public-value-item">
                <h3 className="yd-public-value-title">{v.title}</h3>
                <p className="yd-public-value-body">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Workflow narrative */}
      <section
        className="yd-public-story yd-public-story--flow yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
        aria-labelledby="yd-home-flow-title"
      >
        <div className="yd-public-story-inner">
          <p className="yd-public-section-kicker">Arbeitsfluss</p>
          <h2 id="yd-home-flow-title" className="yd-public-section-title">
            Vom Eingang bis zum Überblick — ein klarer Praxisverlauf
          </h2>
          <ol className="yd-public-narrative-flow">
            {WORKFLOW.map((item, i) => (
              <li key={item.step} className="yd-public-narrative-flow-item">
                <span className="yd-public-narrative-flow-index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="yd-public-narrative-flow-step">{item.step}</p>
                  <p className="yd-public-narrative-flow-detail">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 — Trust & professionalism */}
      <section
        className="yd-public-trust-editorial yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "4" }}
        aria-labelledby="yd-home-trust-title"
      >
        <div className="yd-public-trust-editorial-grid">
          <YdEditorialFigure
            src={trustImg.src}
            alt={trustImg.alt}
            width={trustImg.width}
            height={trustImg.height}
            variant="trust"
          />
          <div className="yd-public-trust-editorial-copy">
            <p className="yd-public-section-kicker">Vertrauen</p>
            <h2 id="yd-home-trust-title" className="yd-public-section-title">
              Medizinische Professionalität — menschlich gedacht
            </h2>
            <p className="yd-public-prose">
              Sensible Daten verdienen Zurückhaltung in der Oberfläche und Strenge im Betrieb. Wir
              kommunizieren klar, was passiert — ohne Angstmarketing und ohne unbelegte
              Zertifizierungsversprechen.
            </p>
            <ul className="yd-public-trust-list">
              {TRUST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5 — Ecosystem / modules */}
      <section
        id="module"
        className="yd-public-story yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "5" }}
        aria-labelledby="yd-home-modules-title"
      >
        <div className="yd-public-story-inner">
          <p className="yd-public-section-kicker">Ökosystem</p>
          <h2 id="yd-home-modules-title" className="yd-public-section-title">
            Module mit festen Rollen — ein zusammenhängender Praxisbereich
          </h2>
          <ul className="yd-public-ecosystem">
            {MODULES.map((m, i) => (
              <li
                key={m.name}
                className={`yd-public-ecosystem-item ${i % 2 === 1 ? "yd-public-ecosystem-item--alt" : ""}`}
              >
                <div>
                  <p className="yd-public-ecosystem-name">{m.name}</p>
                  <p className="yd-public-ecosystem-role">{m.role}</p>
                </div>
                <p className="yd-public-ecosystem-body">{m.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6 — Onboarding path */}
      <section
        className="yd-public-onboarding yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "6" }}
        aria-labelledby="yd-home-onboard-title"
      >
        <div className="yd-public-onboarding-inner">
          <div>
            <p className="yd-public-section-kicker">Onboarding</p>
            <h2 id="yd-home-onboard-title" className="yd-public-section-title">
              In drei ruhigen Schritten in den Praxisbereich
            </h2>
            <p className="yd-public-prose">
              Plan wählen, Praxis registrieren, Freischaltung nach Prüfung — transparent und ohne
              Druck. Ihr Team erhält Zugang, sobald der Prozess abgeschlossen ist.
            </p>
          </div>
          <ol className="yd-public-onboarding-steps">
            <li>
              <span className="yd-public-onboarding-num">1</span>
              <span>Paket & Abrechnungsrhythmus festlegen</span>
            </li>
            <li>
              <span className="yd-public-onboarding-num">2</span>
              <span>Praxisdaten und Verifizierung im Assistenten</span>
            </li>
            <li>
              <span className="yd-public-onboarding-num">3</span>
              <span>Freischaltung per E-Mail nach Prüfung</span>
            </li>
          </ol>
          <Link href="/pricing" className="yd-os-btn yd-os-btn--primary yd-public-onboarding-cta">
            Zu Paketen & Registrierung
          </Link>
        </div>
      </section>

      {/* 7 — Entry */}
      <section
        id="start"
        className="yd-public-entry-cinema yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "7" }}
        aria-labelledby="yd-home-entry-title"
      >
        <h2 id="yd-home-entry-title" className="yd-public-entry-cinema-title">
          Bereit für einen ruhigeren Praxisalltag?
        </h2>
        <p className="yd-public-entry-cinema-lead">
          Neue Praxis: Onboarding starten. Bestehende Nutzerinnen: direkt anmelden.
        </p>
        <div className="yd-public-entry-actions">
          <Link href="/pricing" className="yd-os-btn yd-os-btn--primary">
            Praxis einrichten
          </Link>
          <Link prefetch href="/login" className="yd-os-btn yd-os-btn--ghost">
            Anmelden
          </Link>
        </div>
      </section>

      <footer
        className="yd-public-footer yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "8" }}
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
    </article>
  );
}
