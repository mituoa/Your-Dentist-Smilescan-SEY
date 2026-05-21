"use client";

import Link from "next/link";

import { YdPracticeWorld } from "@/components/marketing/yd-practice-world";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

const HERO_BENEFITS = [
  "Weniger Telefonstress und E-Mail-Chaos",
  "Strukturierte Patientenanfragen mit Fotos",
  "Interne Teamkommunikation am Fall",
  "Klare Übergaben — wer macht was",
] as const;

const PAINS = [
  "Patientinnen rufen an, schreiben Mails oder schicken Bilder über Messenger — nichts ist am Fall gebunden.",
  "Rückfragen landen bei der falschen Person; Übergaben gehen im Hektik unter.",
  "Das Team arbeitet parallel in Telefon, Postfach und Chat — ohne gemeinsamen Überblick.",
] as const;

const RELIEF = [
  "Ein geschützter Praxisbereich für Eingang, Sichtung und interne Abstimmung.",
  "Patientinnen nutzen einen klaren Weg — Ihr Team sieht strukturiert, was ankommt.",
  "Aufgaben und Kommentare bleiben am Fall: weniger Stress, mehr Ruhe im Alltag.",
] as const;

const FLOW = [
  { label: "Eingang", detail: "Fotos & Anliegen strukturiert" },
  { label: "Sichtung", detail: "Priorisieren im Praxisbereich" },
  { label: "Team", detail: "Aufgaben mit klarem Status" },
  { label: "Antwort", detail: "Professionell zurück zur Patientin" },
] as const;

const MODULES = [
  { name: "Atlas", role: "Überblick", body: "Orientierung im vollen Praxisalltag." },
  { name: "Tracker", role: "Einsendungen", body: "Der ruhige Eingang für Patientenfälle." },
  { name: "Relay", role: "Aufgaben", body: "Intern abstimmen — ohne Nebenkanäle." },
  { name: "Profil", role: "Praxisseite", body: "Modern nach außen, kontrolliert nach innen." },
  { name: "Journal", role: "Aufklärung", body: "Medizinische Texte an Ihre Praxis gebunden." },
  { name: "Workspace", role: "Team", body: "Rollen und Zugänge an einem Ort." },
] as const;

const TRUST = [
  "Geschützter Praxisbereich",
  "Verschlüsselte Verbindung",
  "Freischaltung nach Prüfung",
  "Klare Rollen im Team",
] as const;

type YdHomeDesktopProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

export function YdHomeDesktop({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeDesktopProps) {
  return (
    <article className="yd-clinical-page yd-clinical-desktop-only">
      <YdProductChrome setupHref="/#pricing" />

      <section className="yd-clinical-hero yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "1" }} aria-labelledby="yd-clinical-hero-title">
        <div className="yd-clinical-hero-lights" aria-hidden />
        <div className="yd-clinical-hero-grid">
          <div>
            <p className="yd-clinical-eyebrow">
              Kommunikation & Organisation — ruhig an einem Ort
            </p>
            <h1 id="yd-clinical-hero-title" className="yd-clinical-display">
              Weniger Chaos im Alltag. <em>Klarere</em> Übergaben im Team.
            </h1>
            <p className="yd-clinical-lead">
              Your Dentist ist die interne Infrastruktur Ihrer Praxis: strukturierte
              Patientenanfragen, sichere Kommunikation und koordinierte Teamarbeit — ohne
              Telefonketten und ohne verstreute E-Mails.
            </p>
            <ul className="yd-clinical-hero-benefits">
              {HERO_BENEFITS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="yd-clinical-hero-cta">
              <Link href="/#pricing" className="yd-clinical-cta-primary">
                Praxis einrichten
              </Link>
              <Link prefetch href="/login" className="yd-clinical-cta-secondary">
                Anmelden
              </Link>
              <Link href="#ablauf" className="yd-clinical-cta-ghost">
                So funktioniert es
              </Link>
            </div>
            <p className="yd-clinical-whisper">
              Endlich Ordnung und Ruhe — wenn der Praxisalltag ohnehin voll ist.
            </p>
          </div>
          <div className="yd-clinical-hero-world">
            <YdPracticeWorld />
          </div>
        </div>
      </section>

      <section className="yd-clinical-act yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "2" }} aria-labelledby="yd-clinical-relief-title">
        <h2 id="yd-clinical-relief-title" className="yd-clinical-act-title">
          Das löst Ihren <em>stressigen</em> Praxisalltag — nicht nur „eine Plattform“
        </h2>
        <p className="yd-clinical-body">
          Praxen brauchen keine weitere App — sondern einen ruhigen Ort, an dem Patientenwege und
          interne Abstimmung zusammenlaufen. Weniger Hektik am Telefon, weniger Nachfragen in
          E-Mails, mehr Klarheit für Ärztinnen und Team.
        </p>
        <div className="yd-clinical-duo">
          <div className="yd-clinical-duo-col">
            <h3>Was belastet</h3>
            <ul>
              {PAINS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="yd-clinical-duo-col yd-clinical-duo-col--hope">
            <h3>Was entlastet</h3>
            <ul>
              {RELIEF.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="ablauf" className="yd-clinical-act yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "3" }} aria-labelledby="yd-clinical-flow-title">
        <h2 id="yd-clinical-flow-title" className="yd-clinical-act-title">
          Vom Eingang bis zur <em>Antwort</em>
        </h2>
        <p className="yd-clinical-body">Ein durchgängiger Fluss — lesbar, ruhig, ohne E-Mail-Chaos.</p>
        <div className="yd-clinical-flow">
          {FLOW.map((step, i) => (
            <div key={step.label} className="yd-clinical-flow-step">
              <span className="yd-clinical-flow-num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="yd-clinical-flow-label">{step.label}</p>
              <p className="yd-clinical-flow-detail">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="yd-clinical-act yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "4" }} aria-labelledby="yd-clinical-modules-title">
        <h2 id="yd-clinical-modules-title" className="yd-clinical-act-title">
          Ein <em>zusammenhängender</em> Praxisraum
        </h2>
        <p className="yd-clinical-body">
          Dieselbe ruhige Oberfläche wie im geschützten Bereich — kein Feature-Katalog, sondern ein
          Ort zum Arbeiten.
        </p>
        <div className="yd-clinical-modules">
          {MODULES.map((m) => (
            <div key={m.name} className="yd-clinical-module">
              <div>
                <span className="yd-clinical-module-name">{m.name}</span>
                <span className="yd-clinical-module-role">{m.role}</span>
              </div>
              <p className="yd-clinical-module-body">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="yd-clinical-trust-band yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "5" }} aria-labelledby="yd-clinical-trust-title">
        <h2 id="yd-clinical-trust-title" className="yd-clinical-act-title">
          Vertrauen durch <em>Zurückhaltung</em>
        </h2>
        <p className="yd-clinical-body">
          Diskretion und klare Prozesse — ohne unbelegte Versprechen, ohne Angstmarketing.
        </p>
        <ul className="yd-clinical-trust-list">
          {TRUST.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <YdPublicPricingStage
        fieldIndex={6}
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />

      <footer className="yd-clinical-footer yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "7" }}>
        <div className="yd-clinical-footer-links">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </div>
        <p>Your Dentist — ruhige Infrastruktur für moderne Zahnarztpraxen</p>
      </footer>
    </article>
  );
}
