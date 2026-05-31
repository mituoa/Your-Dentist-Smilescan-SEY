import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Bell,
  Inbox,
  MessagesSquare,
  Sparkles,
  Building2,
  Users,
  ClipboardList,
} from "lucide-react";

import { YdPracticeWorld } from "@/components/marketing/yd-practice-world";
import { YdPublicSiteHeroCta } from "@/components/marketing/yd-public-site-hero-cta";
import { YdPublicSiteDemoForm } from "@/components/marketing/yd-public-site-demo-form";
import {
  PUBLIC_SITE_DEMO,
  PUBLIC_SITE_EINFUEHRUNG,
  PUBLIC_SITE_FUER_WEN,
  PUBLIC_SITE_HERO,
  PUBLIC_SITE_NUTZEN,
  PUBLIC_SITE_PERSPECTIVE,
  PUBLIC_SITE_PROBLEM,
  PUBLIC_SITE_SECTIONS,
} from "@/lib/marketing/public-site-ia";

const NUTZEN_ICONS = {
  eingang: Inbox,
  kommunikation: MessagesSquare,
  aufgaben: Bell,
  command: Sparkles,
} as const;

const FUER_WEN_ICONS = [Building2, Users, ClipboardList] as const;

/** Mobile start — kurzer Hero ohne Desktop-Stage, Grid oder Produkt-Mockup. */
export function YdPublicSiteHeroMobile() {
  return (
    <section
      className="yd-public-site-hero-mobile yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "1" }}
      aria-labelledby="yd-public-hero-mobile-title"
    >
      <p className="yd-clinical-eyebrow">{PUBLIC_SITE_HERO.eyebrow}</p>
      <h1 id="yd-public-hero-mobile-title" className="yd-public-site-hero-mobile-title">
        {PUBLIC_SITE_HERO.titleMobile}
      </h1>
      <p className="yd-public-site-hero-mobile-lead">{PUBLIC_SITE_HERO.lead}</p>
    </section>
  );
}

type YdPublicSiteHeroProps = {
  showSignIn?: boolean;
};

/** Desktop — emotional orchestrated hero, glass stage, abstract preview. */
export function YdPublicSiteHero({ showSignIn = true }: YdPublicSiteHeroProps) {
  return (
    <section
      className="yd-public-site-hero yd-clinical-hero yd-clinical-hero--premium yd-clinical-hero--orchestrated yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "1" }}
      aria-labelledby="yd-public-hero-title"
    >
      <div className="yd-clinical-hero-lights" aria-hidden />
      <div className="yd-clinical-hero-vignette" aria-hidden />
      <div className="yd-clinical-hero-stage">
        <div className="yd-clinical-hero-grid">
          <div className="yd-clinical-hero-copy">
            <p className="yd-clinical-eyebrow">{PUBLIC_SITE_HERO.eyebrow}</p>
            <h1
              id="yd-public-hero-title"
              className="yd-clinical-display yd-clinical-display--hero"
            >
              <span className="yd-clinical-display-line yd-clinical-display-line--serif">
                {PUBLIC_SITE_HERO.title}
              </span>
              <span className="yd-clinical-display-line yd-clinical-display-line--accent">
                {PUBLIC_SITE_HERO.titleLine2}
              </span>
            </h1>
            <p className="yd-clinical-lead">{PUBLIC_SITE_HERO.lead}</p>
            <YdPublicSiteHeroCta showSignIn={showSignIn} />
          </div>
          <div className="yd-clinical-hero-world">
            <YdPracticeWorld />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Schmerzpunkte — kurz, ohne Sales-Dichte */
export function YdPublicSiteProblem() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.problem}
      className="yd-public-site-section yd-public-site-section--problem yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "1.5" }}
      aria-labelledby="yd-public-problem-title"
    >
      <header className="yd-public-site-section-head yd-public-site-section-head--tight">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_PROBLEM.eyebrow}</p>
        <h2 id="yd-public-problem-title" className="yd-clinical-act-title">
          {PUBLIC_SITE_PROBLEM.title}
        </h2>
      </header>
      <ul className="yd-public-site-problem-grid">
        {PUBLIC_SITE_PROBLEM.pains.map((pain) => (
          <li key={pain.label} className="yd-public-site-problem-item">
            <p className="yd-public-site-problem-label">{pain.label}</p>
            <p className="yd-public-site-problem-detail">{pain.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Patient:innen und Praxis — zwei Seiten, ohne Erklärungstext. */
export function YdPublicSitePerspective() {
  const { patient, practice } = PUBLIC_SITE_PERSPECTIVE;

  return (
    <section
      id={PUBLIC_SITE_SECTIONS.perspektive}
      className="yd-public-site-section yd-public-site-section--perspective yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "1.75" }}
      aria-labelledby="yd-public-perspective-title"
    >
      <header className="yd-public-site-section-head yd-public-site-section-head--tight">
        <h2 id="yd-public-perspective-title" className="yd-clinical-act-title">
          <span className="block">{PUBLIC_SITE_PERSPECTIVE.title}</span>
          <span className="yd-clinical-display-line--accent block">
            {PUBLIC_SITE_PERSPECTIVE.titleLine2}
          </span>
        </h2>
      </header>
      <div className="yd-public-site-perspective-grid">
        <article className="yd-public-site-perspective-card">
          <h3 className="yd-public-site-perspective-label">{patient.label}</h3>
          <ul className="yd-public-site-perspective-list">
            {patient.items.map((item) => (
              <li key={item}>
                <span aria-hidden>✓ </span>
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="yd-public-site-perspective-card">
          <h3 className="yd-public-site-perspective-label">{practice.label}</h3>
          <ul className="yd-public-site-perspective-list">
            {practice.items.map((item) => (
              <li key={item}>
                <span aria-hidden>✓ </span>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

type YdPublicSiteNutzenProps = {
  compact?: boolean;
};

export function YdPublicSiteNutzen({ compact = false }: YdPublicSiteNutzenProps) {
  const cards = compact
    ? PUBLIC_SITE_NUTZEN.cards.slice(0, 2)
    : PUBLIC_SITE_NUTZEN.cards;

  return (
    <section
      id={PUBLIC_SITE_SECTIONS.nutzen}
      className={cn(
        "yd-public-site-section yd-public-site-section--nutzen yd-public-os-awaken-field yd-public-site-scroll-anchor",
        compact && "yd-public-site-section--nutzen-compact"
      )}
      style={{ ["--yd-public-field-i" as string]: "2.5" }}
      aria-labelledby="yd-public-nutzen-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_NUTZEN.eyebrow}</p>
        <h2 id="yd-public-nutzen-title" className="yd-clinical-act-title">
          {PUBLIC_SITE_NUTZEN.title}
        </h2>
      </header>
      <ul className="yd-public-site-card-grid yd-public-site-card-grid--2">
        {cards.map((card) => {
          const Icon = NUTZEN_ICONS[card.id as keyof typeof NUTZEN_ICONS];
          return (
            <li key={card.id} className="yd-public-site-card yd-public-site-card--functional">
              <span className="yd-public-site-card-icon" aria-hidden>
                <Icon className="h-4 w-4" strokeWidth={1.65} />
              </span>
              <h3 className="yd-public-site-card-title">{card.label}</h3>
              <p className="yd-public-site-card-body">{card.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function YdPublicSiteFuerWen() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.fuerWen}
      className="yd-public-site-section yd-public-site-section--audience yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "5" }}
      aria-labelledby="yd-public-fuer-wen-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_FUER_WEN.eyebrow}</p>
        <h2 id="yd-public-fuer-wen-title" className="yd-clinical-act-title">
          {PUBLIC_SITE_FUER_WEN.title}
        </h2>
      </header>
      <ul className="yd-public-site-audience-grid">
        {PUBLIC_SITE_FUER_WEN.cards.map((card, i) => {
          const Icon = FUER_WEN_ICONS[i] ?? Building2;
          return (
            <li key={card.title} className="yd-public-site-audience-card yd-public-site-card--functional">
              <span className="yd-public-site-card-icon" aria-hidden>
                <Icon className="h-4 w-4" strokeWidth={1.65} />
              </span>
              <h3 className="yd-public-site-card-title">{card.title}</h3>
              <p className="yd-public-site-card-body">{card.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function YdPublicSiteEinfuehrung() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.einfuehrung}
      className="yd-public-site-section yd-public-site-section--intro yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "6" }}
      aria-labelledby="yd-public-einfuehrung-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_EINFUEHRUNG.eyebrow}</p>
        <h2 id="yd-public-einfuehrung-title" className="yd-clinical-act-title">
          {PUBLIC_SITE_EINFUEHRUNG.title}
        </h2>
      </header>
      <ol className="yd-public-site-steps">
        {PUBLIC_SITE_EINFUEHRUNG.steps.map((step) => (
          <li key={step.num} className="yd-public-site-step yd-public-site-step--title-only">
            <span className="yd-public-site-step-num" aria-hidden>
              {step.num}
            </span>
            <h3 className="yd-public-site-card-title">{step.title}</h3>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function YdPublicSiteDemo() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.demo}
      className="yd-public-site-section yd-public-site-section--demo yd-public-site-section--demo-emphasis yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "8" }}
      aria-labelledby="yd-public-demo-title"
    >
      <div className="yd-public-site-demo-panel">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_DEMO.eyebrow}</p>
        <h2 id="yd-public-demo-title" className="yd-clinical-act-title">
          {PUBLIC_SITE_DEMO.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_DEMO.lead}</p>
        <p className="yd-public-site-demo-trust">{PUBLIC_SITE_DEMO.trustNote}</p>
        <YdPublicSiteDemoForm />
        <p className="yd-public-site-demo-note">{PUBLIC_SITE_DEMO.note}</p>
      </div>
    </section>
  );
}
