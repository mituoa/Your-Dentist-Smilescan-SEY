import {
  PUBLIC_SITE_DEMO,
  PUBLIC_SITE_HERO,
  PUBLIC_SITE_LOESUNG,
  PUBLIC_SITE_PATIENTEN,
  PUBLIC_SITE_PLATTFORM,
  PUBLIC_SITE_PRAXISALLTAG,
  PUBLIC_SITE_SECTIONS,
  PUBLIC_SITE_TEAM,
} from "@/lib/marketing/public-site-ia";
import { YdPublicSiteDemoForm } from "@/components/marketing/yd-public-site-demo-form";
import { YdPublicSiteHeroCta } from "@/components/marketing/yd-public-site-hero-cta";

/** Mobile — editorial hero, keine Stage. */
export function YdPublicSiteHeroMobile() {
  return (
    <section
      className="yd-public-site-hero-mobile yd-public-site-editorial-hero yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "1" }}
      aria-labelledby="yd-public-hero-mobile-title"
    >
      <p className="yd-clinical-eyebrow">{PUBLIC_SITE_HERO.eyebrow}</p>
      <h1 id="yd-public-hero-mobile-title" className="yd-public-site-editorial-title">
        {PUBLIC_SITE_HERO.titleMobile}
      </h1>
      <p className="yd-public-site-editorial-lead">{PUBLIC_SITE_HERO.leadMobile}</p>
    </section>
  );
}

/** Mobile — kompaktes „Warum“, ein Absatz. */
export function YdPublicSitePraxisalltagMobile() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.praxisalltag}
      className="yd-public-site-editorial yd-public-site-editorial--mobile-compact yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "1.5" }}
      aria-labelledby="yd-public-praxisalltag-mobile-title"
    >
      <div className="yd-public-site-editorial-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_PRAXISALLTAG.eyebrow}</p>
        <h2 id="yd-public-praxisalltag-mobile-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_PRAXISALLTAG.title}
        </h2>
        <p className="yd-public-site-editorial-body">{PUBLIC_SITE_PRAXISALLTAG.bodyMobile}</p>
      </div>
    </section>
  );
}

type YdPublicSiteHeroProps = {
  showSignIn?: boolean;
};

/** Desktop — editorial hero, zentriert, ohne Produkt-Mockup. */
export function YdPublicSiteHero({ showSignIn = true }: YdPublicSiteHeroProps) {
  return (
    <section
      className="yd-public-site-hero yd-public-site-editorial-hero yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "1" }}
      aria-labelledby="yd-public-hero-title"
    >
      <div className="yd-public-site-editorial-hero-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_HERO.eyebrow}</p>
        <h1 id="yd-public-hero-title" className="yd-public-site-editorial-display">
          <span className="yd-public-site-editorial-display-line">{PUBLIC_SITE_HERO.title}</span>
          <span className="yd-public-site-editorial-display-line yd-public-site-editorial-display-line--accent">
            {PUBLIC_SITE_HERO.titleLine2}
          </span>
        </h1>
        <p className="yd-public-site-editorial-lead">{PUBLIC_SITE_HERO.lead}</p>
        <YdPublicSiteHeroCta showSignIn={showSignIn} />
      </div>
    </section>
  );
}

/** Praxisalltag — editorial, kein Kartenraster. */
export function YdPublicSitePraxisalltag() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.praxisalltag}
      className="yd-public-site-editorial yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "1.5" }}
      aria-labelledby="yd-public-praxisalltag-title"
    >
      <div className="yd-public-site-editorial-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_PRAXISALLTAG.eyebrow}</p>
        <h2 id="yd-public-praxisalltag-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_PRAXISALLTAG.title}
        </h2>
        <div className="yd-public-site-editorial-prose">
          {PUBLIC_SITE_PRAXISALLTAG.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Patient:innen — eine Perspektive, viel Weißraum. */
export function YdPublicSitePatienten() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.patienten}
      className="yd-public-site-editorial yd-public-site-editorial--soft yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "2" }}
      aria-labelledby="yd-public-patienten-title"
    >
      <div className="yd-public-site-editorial-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_PATIENTEN.eyebrow}</p>
        <h2 id="yd-public-patienten-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_PATIENTEN.title}
        </h2>
        <p className="yd-public-site-editorial-body">{PUBLIC_SITE_PATIENTEN.body}</p>
      </div>
    </section>
  );
}

/** Praxisteam — zweite Perspektive. */
export function YdPublicSiteTeam() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.team}
      className="yd-public-site-editorial yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "2.5" }}
      aria-labelledby="yd-public-team-title"
    >
      <div className="yd-public-site-editorial-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_TEAM.eyebrow}</p>
        <h2 id="yd-public-team-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_TEAM.title}
        </h2>
        <p className="yd-public-site-editorial-body">{PUBLIC_SITE_TEAM.body}</p>
      </div>
    </section>
  );
}

/** Wie Your Dentist hilft — typografische Säulen, keine Feature-Karten. */
export function YdPublicSiteLoesung() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.loesung}
      className="yd-public-site-editorial yd-public-site-editorial--loesung yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "3" }}
      aria-labelledby="yd-public-loesung-title"
    >
      <div className="yd-public-site-editorial-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_LOESUNG.eyebrow}</p>
        <h2 id="yd-public-loesung-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_LOESUNG.title}
        </h2>
        <p className="yd-public-site-editorial-lead yd-public-site-editorial-lead--inset">
          {PUBLIC_SITE_LOESUNG.lead}
        </p>
        <dl className="yd-public-site-editorial-pillars">
          {PUBLIC_SITE_LOESUNG.pillars.map((pillar) => (
            <div key={pillar.label} className="yd-public-site-editorial-pillar">
              <dt>{pillar.label}</dt>
              <dd>{pillar.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Plattform — Module erst nach der Story, minimal typografisch. */
export function YdPublicSitePlattform() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.plattform}
      className="yd-public-site-editorial yd-public-site-editorial--plattform yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "4" }}
      aria-labelledby="yd-public-plattform-title"
    >
      <div className="yd-public-site-editorial-inner">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_PLATTFORM.eyebrow}</p>
        <h2 id="yd-public-plattform-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_PLATTFORM.title}
        </h2>
        <p className="yd-public-site-editorial-lead yd-public-site-editorial-lead--inset">
          {PUBLIC_SITE_PLATTFORM.lead}
        </p>
        <ul className="yd-public-site-module-registry">
          {PUBLIC_SITE_PLATTFORM.modules.map((mod) => (
            <li key={mod.id}>
              <span className="yd-public-site-module-name">{mod.name}</span>
              <span className="yd-public-site-module-hint">{mod.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function YdPublicSiteDemo() {
  return (
    <section
      id={PUBLIC_SITE_SECTIONS.demo}
      className="yd-public-site-editorial yd-public-site-editorial--demo yd-public-os-awaken-field yd-public-site-scroll-anchor"
      style={{ ["--yd-public-field-i" as string]: "6" }}
      aria-labelledby="yd-public-demo-title"
    >
      <div className="yd-public-site-editorial-inner yd-public-site-editorial-inner--demo">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_DEMO.eyebrow}</p>
        <h2 id="yd-public-demo-title" className="yd-public-site-editorial-act">
          {PUBLIC_SITE_DEMO.title}
        </h2>
        <p className="yd-public-site-editorial-lead yd-public-site-editorial-lead--inset">
          {PUBLIC_SITE_DEMO.lead}
        </p>
        <p className="yd-public-site-demo-trust">{PUBLIC_SITE_DEMO.trustNote}</p>
        <YdPublicSiteDemoForm />
        <p className="yd-public-site-demo-note">{PUBLIC_SITE_DEMO.note}</p>
      </div>
    </section>
  );
}
