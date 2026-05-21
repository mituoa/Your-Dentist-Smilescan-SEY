"use client";

import Link from "next/link";

import { YdHomePricingSection } from "@/components/marketing/yd-home-pricing-section";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { YdProductPreview } from "@/components/marketing/yd-product-preview";
import { YdEditorialFigure } from "@/components/marketing/yd-editorial-figure";
import { PUBLIC_EDITORIAL_IMAGES } from "@/lib/marketing/public-editorial-images";

const PROBLEMS = [
  "Bilder und Nachrichten erreichen die Praxis über Wege, die sich unsicher oder unübersichtlich anfühlen.",
  "Wichtiges landet verteilt — in E-Mails, Anrufen, Messenger oder auf dem Schreibtisch.",
  "Das Team verliert den Überblick, gerade wenn es eilig wird.",
  "Rückfragen und Aufgaben hängen nicht am gleichen Fall — das erzeugt unnötigen Druck.",
  "Moderne Praxen verdienen einen Eingang, der beruhigt statt zusätzlich zu fordern.",
] as const;

const SOLUTION = [
  {
    title: "Ein klarer Link für Patientinnen",
    body: "Anliegen und Fotos kommen strukturiert an — freundlich, verständlich, ohne technische Hürden.",
  },
  {
    title: "Alles an einem geschützten Ort",
    body: "Ihre Praxis sieht Fälle geordnet — nicht als verstreute Anhänge, die niemand mehr zuordnen kann.",
  },
  {
    title: "Teamarbeit ohne Nebenkanäle",
    body: "Sichtung, Kommentar und Aufgabe bleiben am Fall — das Team kann in Ruhe abstimmen.",
  },
  {
    title: "Professionell nach außen",
    body: "Patientinnen erleben einen modernen, verlässlichen Weg — Ihr Team behält innen die Kontrolle.",
  },
] as const;

const WORKFLOW = [
  { step: "Patient sendet ein", detail: "Fotos und Anliegen über Ihren Praxislink — sicher und verständlich" },
  { step: "Einsendung landet geordnet", detail: "Im Praxisbereich, bereit zur Sichtung — ohne Postfach-Chaos" },
  { step: "Praxis sichtet in Ruhe", detail: "Priorisieren, kommentieren, zuordnen — in eigenem Tempo" },
  { step: "Aufgabe fürs Team", detail: "Klare Relay-Schritte, wer übernimmt und was als Nächstes gilt" },
  { step: "Antwort & Überblick", detail: "Ruhig zurück zur Patientin — mit Orientierung für die Praxis" },
] as const;

const MODULES = [
  { name: "Atlas", role: "Überblick", body: "Verläufe und Kennzahlen — Orientierung, wenn der Tag voll ist." },
  { name: "Tracker", role: "Einsendungen", body: "Der ruhige Eingang für Patientenfälle und Fotos." },
  { name: "Relay", role: "Aufgaben", body: "Intern abstimmen — ohne parallele Chat-Kanäle." },
  { name: "Profil", role: "Praxisseite", body: "Nach außen modern wirken, nach innen kontrolliert bleiben." },
  { name: "Journal", role: "Aufklärung", body: "Medizinische Texte — verständlich und an Ihre Praxis gebunden." },
  { name: "Workspace", role: "Team", body: "Rollen und Zugänge — klar, wer wofür da ist." },
] as const;

const TRUST = [
  "Ein geschützter Bereich nur für Ihre Praxis",
  "Verschlüsselte Verbindung im produktiven Betrieb",
  "Freischaltung erst nach sorgfältiger Prüfung",
  "Klare Rollen — Ärztinnen, Team, Einladungen",
  "Zurückhaltende Oberfläche — Diskretion statt Lautstärke",
] as const;

export function YdHomePage() {
  const trustImg = PUBLIC_EDITORIAL_IMAGES.trustClinical;

  return (
    <article className="yd-public-page">
      <YdProductChrome setupHref="/#pricing" />

      {/* 1 — Hero */}
      <section
        className="yd-public-hero-cinema yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-home-hero-title"
      >
        <div className="yd-public-hero-cinema-bg" aria-hidden />
        <div className="yd-public-hero-cinema-warmth" aria-hidden />
        <div className="yd-public-hero-cinema-layout">
          <div className="yd-public-hero-cinema-copy">
            <p className="yd-public-kicker yd-public-kicker--warm">Für Praxen, die im Alltag entlastet werden möchten</p>
            <h1 id="yd-home-hero-title" className="yd-public-display">
              Endlich ein ruhigerer Weg, wenn <em>Patientinnen</em> Bilder und Anliegen senden
            </h1>
            <p className="yd-public-lead yd-public-lead--hero">
              Patientinnen senden Fotos und Anliegen sicher ein. Ihre Praxis sieht alles geordnet im
              geschützten Arbeitsbereich — und kann intern weitermachen, ohne zusätzlichen Stress.
            </p>
            <div className="yd-public-hero-cta-row">
              <Link href="/#pricing" className="yd-os-btn yd-os-btn--primary">
                Praxis einrichten
              </Link>
              <Link prefetch href="/login" className="yd-os-btn yd-os-btn--ghost">
                Anmelden
              </Link>
              <Link href="#ablauf" className="yd-os-link yd-public-hero-cta-tertiary">
                So funktioniert es
              </Link>
            </div>
            <p className="yd-public-hero-trust-line">
              Weniger Hektik am Eingang. Mehr Ruhe im Team — modern, ohne Tech-Chaos.
            </p>
          </div>
          <div className="yd-public-hero-cinema-visual">
            <YdProductPreview />
            <div className="yd-public-hero-glass-note" aria-hidden>
              <span className="yd-public-hero-glass-note-label">Im geschützten Praxisbereich</span>
              <span className="yd-public-hero-glass-note-value">Eingang → Sichtung → Teamaufgabe</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Problem */}
      <section
        className="yd-public-story yd-public-story--problem yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "2" }}
        aria-labelledby="yd-home-problem-title"
      >
        <div className="yd-public-story-inner">
          <p className="yd-public-section-kicker yd-public-kicker--warm">Was viele Praxen kennen</p>
          <h2 id="yd-home-problem-title" className="yd-public-section-title yd-public-section-title--editorial">
            Der Alltag ist voll — der Eingang sollte nicht <em>noch mehr</em> fordern
          </h2>
          <p className="yd-public-prose">
            Sensible Kommunikation braucht Ruhe. Wenn Bilder und Rückfragen überall landen, steigt der
            Druck — für Ärztinnen, Team und Patientinnen gleichermaßen.
          </p>
          <ul className="yd-public-problem-list">
            {PROBLEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — Solution */}
      <section
        className="yd-public-story yd-public-story--relief yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
        aria-labelledby="yd-home-solution-title"
      >
        <div className="yd-public-story-inner">
          <p className="yd-public-section-kicker yd-public-kicker--warm">Was Your Dentist bringt</p>
          <h2 id="yd-home-solution-title" className="yd-public-section-title yd-public-section-title--editorial">
            Ein ruhiger digitaler Eingang — und <em>Klarheit</em> im Team
          </h2>
          <p className="yd-public-prose">
            Fotos, Anliegen und interne Schritte an einem geschützten Ort. Patientinnen erleben
            Professionalität — Ihr Team spürt Entlastung statt weiterer Kanäle.
          </p>
          <div className="yd-public-value-row">
            {SOLUTION.map((item) => (
              <div key={item.title} className="yd-public-value-cell">
                <p className="yd-public-value-title">{item.title}</p>
                <p className="yd-public-value-body">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Workflow */}
      <section
        id="ablauf"
        className="yd-public-story yd-public-story--flow yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "4" }}
        aria-labelledby="yd-home-flow-title"
      >
        <div className="yd-public-story-inner yd-public-story-inner--wide">
          <p className="yd-public-section-kicker yd-public-kicker--warm">So läuft es im Alltag</p>
          <h2 id="yd-home-flow-title" className="yd-public-section-title yd-public-section-title--editorial">
            Vom Eingang bis zur <em>Antwort</em> — ohne Umwege
          </h2>
          <p className="yd-public-prose">
            Patientinnen reichen strukturiert ein. Ihr Team behält den Überblick — Schritt für Schritt,
            nachvollziehbar, ohne E-Mail-Stress.
          </p>
          <ol className="yd-public-pipeline">
            {WORKFLOW.map((item, i) => (
              <li key={item.step} className="yd-public-pipeline-step">
                <span className="yd-public-pipeline-index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="yd-public-pipeline-label">{item.step}</p>
                  <p className="yd-public-pipeline-detail">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5 — Modules */}
      <section
        id="oekosystem"
        className="yd-public-story yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "5" }}
        aria-labelledby="yd-home-modules-title"
      >
        <div className="yd-public-story-inner yd-public-story-inner--wide">
          <p className="yd-public-section-kicker yd-public-kicker--warm">Zusammenhängend gedacht</p>
          <h2 id="yd-home-modules-title" className="yd-public-section-title yd-public-section-title--editorial">
            Ein Raum für Ihre Praxis — <em>verbunden</em>, nicht zerstückelt
          </h2>
          <p className="yd-public-prose">
            Dieselbe ruhige Oberfläche wie im geschützten Bereich: Überblick, Eingang, Aufgaben und
            Profil greifen ineinander — ohne Feature-Lärm.
          </p>
          <ul className="yd-public-modules-grid">
            {MODULES.map((m) => (
              <li key={m.name} className="yd-public-module-tile">
                <span className="yd-public-module-tile-name">{m.name}</span>
                <span className="yd-public-module-tile-role">{m.role}</span>
                <p className="yd-public-module-tile-body">{m.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6 — Trust */}
      <section
        id="vertrauen"
        className="yd-public-trust-editorial yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "6" }}
        aria-labelledby="yd-home-trust-title"
      >
        <div className="yd-public-trust-editorial-grid">
          <YdEditorialFigure
            src={trustImg.src}
            alt={trustImg.alt}
            width={trustImg.width}
            height={trustImg.height}
            variant="trust"
            caption="Ruhe, Licht und Diskretion — wie in einer guten Praxis"
          />
          <div className="yd-public-trust-editorial-copy">
            <p className="yd-public-section-kicker yd-public-kicker--warm">Vertrauen</p>
            <h2 id="yd-home-trust-title" className="yd-public-section-title yd-public-section-title--editorial">
              Diskretion und <em>Stabilität</em> — sichtbar in der Oberfläche
            </h2>
            <p className="yd-public-prose">
              Hier geht es um sensible Kommunikation. Wir bleiben sachlich, transparent und ohne
              unbelegte Versprechen — damit Sie und Ihre Patientinnen sich sicher fühlen können.
            </p>
            <ul className="yd-public-trust-list">
              {TRUST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7 — Pricing */}
      <YdHomePricingSection />

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
        <p className="yd-public-footer-copy">
          Your Dentist — ruhige Infrastruktur für moderne Zahnarztpraxen
        </p>
      </footer>
    </article>
  );
}
