"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { YdEcosystemRelayCommand } from "@/components/marketing/yd-ecosystem-relay-command";
import { YdPracticeWorld } from "@/components/marketing/yd-practice-world";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

const HERO_LINES = [
  "Patient:innen senden Fotos und Anliegen strukturiert in Ihren Praxisbereich.",
  "Interne Nachrichten, Gruppen, Übergaben und Aufgaben — ruhig in Relay, nicht in WhatsApp.",
  COMMAND_AI_PUBLIC.heroLine,
] as const;

const WORKFLOW = [
  { label: "Eingang", detail: "Patientin · strukturierter Weg", product: "Tracker" },
  { label: "Sichtung", detail: "Priorität im Praxisbereich", product: "Tracker" },
  { label: "Intern", detail: "Nachrichten · Gruppen · Übergaben", product: "Relay" },
  { label: "Routinen", detail: "Mo Laborkontrolle · tägl. Steri", product: "Relay" },
  { label: "Assistenz", detail: "Diktat · Entwürfe · zwischen Terminen", product: "Command AI" },
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
    role: COMMAND_AI_PUBLIC.moduleRole,
    body: COMMAND_AI_PUBLIC.moduleBody,
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
      <YdProductChrome showSetupInHeader={false} />

      <section
        className="yd-clinical-hero yd-clinical-hero--premium yd-clinical-hero--orchestrated yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-clinical-hero-title"
      >
        <div className="yd-clinical-hero-lights" aria-hidden />
        <div className="yd-clinical-hero-vignette" aria-hidden />
        <div className="yd-clinical-hero-stage">
          <div className="yd-clinical-hero-grid">
          <div className="yd-clinical-hero-copy">
            <p className="yd-clinical-eyebrow">Geschützter Praxisbereich</p>
            <h1 id="yd-clinical-hero-title" className="yd-clinical-display yd-clinical-display--direct">
              Weniger Chaos. Mehr Ruhe im Team.
            </h1>
            <p className="yd-clinical-lead">
              Ein geschützter Raum für Eingang, interne Kommunikation, Aufgaben, Routinen und leise
              Unterstützung — damit Ihr Team den Tag ruhiger erlebt.
            </p>
            <ul className="yd-clinical-hero-benefits">
              {HERO_LINES.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="yd-clinical-hero-cta-stack">
              <Link href="/#pricing" className="yd-clinical-cta-primary">
                Praxisbereich starten
              </Link>
              <p className="yd-clinical-cta-signin">
                Bereits registriert?{" "}
                <Link prefetch href="/login">
                  Anmelden
                </Link>
              </p>
            </div>
            <p className="yd-clinical-whisper">
              Weniger Chaos im Kopf — mehr Ordnung im Praxisalltag. Modern, menschlich, sicher.
            </p>
          </div>
          <div className="yd-clinical-hero-world">
            <YdPracticeWorld />
          </div>
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
        <h2 id="yd-clinical-flow-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          Ein geschützter Fluss — Eingang bis Team bis Erinnerung
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
        <h2 id="yd-clinical-modules-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          Ein Raum — nicht ein Modulkatalog
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
