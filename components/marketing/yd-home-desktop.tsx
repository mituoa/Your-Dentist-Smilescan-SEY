"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { YdPracticeWorld } from "@/components/marketing/yd-practice-world";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

const HERO_LINES = [
  "Patient:innen senden Fotos sicher ein.",
  "Ihr Team koordiniert intern — ohne WhatsApp-Chaos.",
  "Relay: Aufgaben, Nachrichten, Erinnerungen am Fall.",
] as const;

const RELIEF = [
  "Strukturierter Patienteneingang statt verstreuter Kanäle.",
  "Interne Nachrichten und Übergaben in einem geschützten Bereich.",
  "Command AI hilft leise, Fälle und Abläufe einzuordnen.",
] as const;

const WORKFLOW = [
  { label: "Eingang", detail: "Fotos & Anliegen", product: "Tracker" },
  { label: "Sichtung", detail: "Priorisieren am Fall", product: "Tracker" },
  { label: "Team", detail: "Relay · Klärung intern", product: "Relay" },
  { label: "Routine", detail: "Wiederholungen & Erinnerungen", product: "Relay" },
  { label: "Antwort", detail: "Ruhig abschließen", product: "Profil" },
] as const;

const MODULES = [
  { name: "Tracker", role: "Einsendungen", body: "Strukturierter Eingang für Patientenfälle.", accent: false },
  { name: "Relay", role: "Koordination", body: "Nachrichten, Gruppen, Aufgaben, Erinnerungen.", accent: false },
  {
    name: "Command AI",
    role: "Leise Orientierung",
    body: "Fälle und Abläufe schneller verstehen — ohne KI-Lautstärke.",
    accent: true,
  },
  { name: "Atlas", role: "Überblick", body: "Der ruhige Blick auf den Praxisalltag.", accent: false },
  { name: "Profil", role: "Praxisseite", body: "Nach außen klar, nach innen kontrolliert.", accent: false },
  { name: "Workspace", role: "Team", body: "Rollen und Zugänge an einem Ort.", accent: false },
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

      <section
        className="yd-clinical-hero yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-clinical-hero-title"
      >
        <div className="yd-clinical-hero-lights" aria-hidden />
        <div className="yd-clinical-hero-vignette" aria-hidden />
        <div className="yd-clinical-hero-grid">
          <div className="yd-clinical-hero-copy">
            <p className="yd-clinical-eyebrow">Premium-Infrastruktur für Zahnarztpraxen</p>
            <h1 id="yd-clinical-hero-title" className="yd-clinical-display">
              Weniger Chaos. <em>Mehr</em> Ruhe im Team.
            </h1>
            <p className="yd-clinical-lead">
              Ein geschützter Praxisbereich für Patientenkommunikation, interne Abstimmung und
              klare Übergaben — damit der Alltag leichter wird, nicht lauter.
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
            </div>
            <p className="yd-clinical-whisper">
              Für bestehende Praxen: direkt anmelden — Sie gelangen in Ihren geschützten Bereich.
            </p>
          </div>
          <div className="yd-clinical-hero-world">
            <YdPracticeWorld />
          </div>
        </div>
      </section>

      <section
        className="yd-clinical-os-band yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "2" }}
        aria-label="Was Your Dentist ist"
      >
        <p className="yd-clinical-os-band-lead">
          <strong>Kein Tool-Katalog</strong> — ein ruhiger Praxisraum: Eingang, interne
          Kommunikation, Aufgaben und sichere Zusammenarbeit.
        </p>
      </section>

      <section
        className="yd-clinical-act yd-clinical-act--relief yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
        aria-labelledby="yd-clinical-relief-title"
      >
        <h2 id="yd-clinical-relief-title" className="yd-clinical-act-title">
          Stress im Alltag <em>reduzieren</em>
        </h2>
        <ul className="yd-clinical-relief-list">
          {RELIEF.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section
        id="ablauf"
        className="yd-clinical-act yd-clinical-act--flow yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "4" }}
        aria-labelledby="yd-clinical-flow-title"
      >
        <h2 id="yd-clinical-flow-title" className="yd-clinical-act-title">
          Ein Fluss — <em>vom Eingang</em> bis zur Antwort
        </h2>
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
          Im <em>geschützten</em> Bereich
        </h2>
        <div className="yd-clinical-modules">
          {MODULES.map((m) => (
            <div
              key={m.name}
              className={cn(
                "yd-clinical-module",
                m.accent && "yd-clinical-module--command-ai"
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
        <p>Verschlüsselte Verbindung · Freischaltung nach Prüfung · Your Dentist</p>
      </footer>
    </article>
  );
}
