"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { YdEcosystemRelayCommand } from "@/components/marketing/yd-ecosystem-relay-command";
import { YdPracticeWorld } from "@/components/marketing/yd-practice-world";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

const HERO_LINES = [
  "Patient:innen senden Anliegen und Fotos strukturiert ein.",
  "Ihr Team kommuniziert intern in Relay — ruhig, am Fall, ohne WhatsApp.",
  "Routinen und Erinnerungen laufen verlässlich; Command AI entlastet leise.",
] as const;

const WORKFLOW = [
  { label: "Eingang", detail: "Patientin · strukturierter Weg", product: "Tracker" },
  { label: "Sichtung", detail: "Priorität im Praxisbereich", product: "Tracker" },
  { label: "Intern", detail: "Nachrichten · Gruppen · Übergaben", product: "Relay" },
  { label: "Routinen", detail: "Mo Laborkontrolle · tägl. Steri", product: "Relay" },
  { label: "Unterstützung", detail: "Priorität · Überblick · Entlastung", product: "Command AI" },
] as const;

const MODULES = [
  {
    name: "Relay",
    role: "Interne Kommunikation",
    body: "Nachrichten, Gruppen, Aufgaben, wiederkehrende Routinen, Erinnerungen, klare Verantwortung — kein Nebenkanal.",
    accent: false,
    featured: true,
  },
  {
    name: "Command AI",
    role: "Leise Unterstützung",
    body: "Orientierung, Priorisierung, Ablaufhilfe — weniger mentale Last, ohne KI-Marketing.",
    accent: true,
    featured: false,
  },
  { name: "Tracker", role: "Einsendungen", body: "Strukturierter Eingang für Patientenfälle.", accent: false, featured: false },
  { name: "Atlas", role: "Überblick", body: "Operationaler Blick auf den Praxisalltag.", accent: false, featured: false },
  { name: "Profil", role: "Praxisseite", body: "Nach außen klar, nach innen kontrolliert.", accent: false, featured: false },
  { name: "Workspace", role: "Team", body: "Rollen, Zugänge, geschützter Bereich.", accent: false, featured: false },
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
      <YdProductChrome setupHref="/#ecosystem" />

      <section
        className="yd-clinical-hero yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-clinical-hero-title"
      >
        <div className="yd-clinical-hero-lights" aria-hidden />
        <div className="yd-clinical-hero-vignette" aria-hidden />
        <div className="yd-clinical-hero-grid">
          <div className="yd-clinical-hero-copy">
            <p className="yd-clinical-eyebrow">Interne Kommunikation · ruhig gebündelt</p>
            <h1 id="yd-clinical-hero-title" className="yd-clinical-display">
              Endlich <em>zusammen</em> arbeiten — ohne Chaos zwischen den Kanälen.
            </h1>
            <p className="yd-clinical-lead">
              Your Dentist verbindet Patienteneingang und Teamkoordination in einem geschützten
              Praxisraum: strukturiert nach außen, ruhig und nachvollziehbar nach innen.
            </p>
            <ul className="yd-clinical-hero-benefits">
              {HERO_LINES.map((b) => (
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
              <Link href="#ecosystem" className="yd-clinical-cta-ghost">
                Relay &amp; Command AI
              </Link>
            </div>
            <p className="yd-clinical-whisper">
              Der eigentliche Gewinn: Ihre Praxis arbeitet endlich ruhig zusammen — nicht nur
              „digitaler“.
            </p>
          </div>
          <div className="yd-clinical-hero-world">
            <YdPracticeWorld />
          </div>
        </div>
      </section>

      <div
        id="ecosystem"
        className="yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
      >
        <YdEcosystemRelayCommand />
      </div>

      <section
        id="ablauf"
        className="yd-clinical-act yd-clinical-act--flow yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "4" }}
        aria-labelledby="yd-clinical-flow-title"
      >
        <h2 id="yd-clinical-flow-title" className="yd-clinical-act-title">
          Ein geschützter <em>Fluss</em> — Eingang bis Team bis Erinnerung
        </h2>
        <p className="yd-clinical-body">
          Patientenanfrage, interne Abstimmung, verlässliche Routinen — Command AI unterstützt leise
          dazwischen.
        </p>
        <div className="yd-clinical-flow">
          {WORKFLOW.map((step, i) => (
            <div key={step.label} className="yd-clinical-flow-step">
              <span className="yd-clinical-flow-num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="yd-clinical-flow-product">{step.product}</p>
              <p className="yd-clinical-flow-label">{step.label}</p>
              <p className="yd-clinical-flow-detail">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="yd-clinical-act yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "5" }}
        aria-labelledby="yd-clinical-modules-title"
      >
        <h2 id="yd-clinical-modules-title" className="yd-clinical-act-title">
          Ein Raum — <em>nicht</em> ein Modulkatalog
        </h2>
        <p className="yd-clinical-body">
          Relay ist die ruhige Kommunikationsschicht Ihrer Praxis. Command AI arbeitet zurückhaltend
          mit — für Orientierung statt Lautstärke.
        </p>
        <div className="yd-clinical-modules">
          {MODULES.map((m) => (
            <div
              key={m.name}
              className={cn(
                "yd-clinical-module",
                m.accent && "yd-clinical-module--command-ai",
                m.featured && "yd-clinical-module--relay"
              )}
            >
              <div>
                <span className="yd-clinical-module-name">{m.name}</span>
                <span className="yd-clinical-module-role">{m.role}</span>
              </div>
              <p className="yd-clinical-module-body">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      <YdPublicPricingStage
        fieldIndex={6}
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />

      <footer
        className="yd-clinical-footer yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "7" }}
      >
        <div className="yd-clinical-footer-links">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </div>
        <p>
          Interne Kommunikation · Routinen · Command AI — ein geschützter Praxisbereich
        </p>
      </footer>
    </article>
  );
}
