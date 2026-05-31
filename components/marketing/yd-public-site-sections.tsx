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
  Headphones,
} from "lucide-react";

import { YdPublicSiteHeroCta } from "@/components/marketing/yd-public-site-hero-cta";
import {
  PUBLIC_SITE_DEMO,
  PUBLIC_SITE_EINFUEHRUNG,
  PUBLIC_SITE_FUER_WEN,
  PUBLIC_SITE_HERO,
  PUBLIC_SITE_NUTZEN,
  PUBLIC_SITE_SECTIONS,
} from "@/lib/marketing/public-site-ia";

const NUTZEN_ICONS = {
  eingang: Inbox,
  kommunikation: MessagesSquare,
  aufgaben: Bell,
  command: Sparkles,
} as const;

const FUER_WEN_ICONS = [Building2, Users, ClipboardList, Headphones] as const;

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
        {PUBLIC_SITE_HERO.title}
      </h1>
      <ul className="yd-public-site-hero-points yd-public-site-hero-points--mobile">
        {PUBLIC_SITE_HERO.bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

type YdPublicSiteHeroProps = {
  showSignIn?: boolean;
};

/** Desktop Startseite — kompakt, nutzenorientiert, ohne Editorial-Mockup. */
export function YdPublicSiteHero({ showSignIn = true }: YdPublicSiteHeroProps) {
  return (
    <section
      className="yd-public-site-hero yd-public-site-hero--landing yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "1" }}
      aria-labelledby="yd-public-hero-title"
    >
      <div className="yd-public-site-hero-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_HERO.eyebrow}</p>
        <h1 id="yd-public-hero-title" className="yd-public-site-hero-headline">
          {PUBLIC_SITE_HERO.title}
        </h1>
        <ul className="yd-public-site-hero-points">
          {PUBLIC_SITE_HERO.bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <YdPublicSiteHeroCta showSignIn={showSignIn} />
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
      style={{ ["--yd-public-field-i" as string]: "2" }}
      aria-labelledby="yd-public-nutzen-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_NUTZEN.eyebrow}</p>
        <h2 id="yd-public-nutzen-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {PUBLIC_SITE_NUTZEN.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_NUTZEN.lead}</p>
      </header>
      <ul className="yd-public-site-card-grid yd-public-site-card-grid--2">
        {cards.map((card) => {
          const Icon = NUTZEN_ICONS[card.id as keyof typeof NUTZEN_ICONS];
          return (
            <li key={card.id} className="yd-public-site-card">
              <span className="yd-public-site-card-icon" aria-hidden>
                <Icon className="h-4 w-4" strokeWidth={1.65} />
              </span>
              <p className="yd-public-site-card-kicker">{card.label}</p>
              <h3 className="yd-public-site-card-title">{card.title}</h3>
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
      style={{ ["--yd-public-field-i" as string]: "3" }}
      aria-labelledby="yd-public-fuer-wen-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_FUER_WEN.eyebrow}</p>
        <h2 id="yd-public-fuer-wen-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {PUBLIC_SITE_FUER_WEN.title}
        </h2>
      </header>
      <ul className="yd-public-site-audience-grid">
        {PUBLIC_SITE_FUER_WEN.cards.map((card, i) => {
          const Icon = FUER_WEN_ICONS[i] ?? Building2;
          return (
            <li key={card.title} className="yd-public-site-audience-card">
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
      style={{ ["--yd-public-field-i" as string]: "4" }}
      aria-labelledby="yd-public-einfuehrung-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_EINFUEHRUNG.eyebrow}</p>
        <h2
          id="yd-public-einfuehrung-title"
          className="yd-clinical-act-title yd-clinical-act-title--direct"
        >
          {PUBLIC_SITE_EINFUEHRUNG.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_EINFUEHRUNG.lead}</p>
      </header>
      <ol className="yd-public-site-steps">
        {PUBLIC_SITE_EINFUEHRUNG.steps.map((step) => (
          <li key={step.num} className="yd-public-site-step">
            <span className="yd-public-site-step-num" aria-hidden>
              {step.num}
            </span>
            <div className="min-w-0">
              <h3 className="yd-public-site-card-title">{step.title}</h3>
              <p className="yd-public-site-card-body">{step.body}</p>
            </div>
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
      className="yd-public-site-section yd-public-site-section--demo yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "6" }}
      aria-labelledby="yd-public-demo-title"
    >
      <div className="yd-public-site-demo-panel">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_DEMO.eyebrow}</p>
        <h2 id="yd-public-demo-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {PUBLIC_SITE_DEMO.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_DEMO.lead}</p>
        <div className="yd-public-site-demo-actions">
          <a href={`mailto:info@your-dentist.de?subject=${encodeURIComponent("Demo-Anfrage Your Dentist")}`} className="yd-clinical-cta-primary">
            {PUBLIC_SITE_DEMO.primaryCta}
          </a>
          <Link href={PUBLIC_SITE_DEMO.contactHref} className="yd-clinical-cta-secondary">
            {PUBLIC_SITE_DEMO.secondaryCta}
          </Link>
        </div>
        <p className="yd-public-site-demo-note">{PUBLIC_SITE_DEMO.note}</p>
      </div>
    </section>
  );
}
