"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

import { usePracticeSolutionInquiry } from "@/components/profile/practice-solution-inquiry-sheet";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import {
  LANDING_CATEGORIES,
  LANDING_CLOSING,
  LANDING_CUSTOM_FEATURES,
  LANDING_GALLERY,
  LANDING_HERO,
  LANDING_PROCESS_STEPS,
  POPULAR_CAMPAIGNS,
} from "@/lib/practice-solutions/landing-page-model";
import { cn } from "@/lib/utils";

type Props = {
  inquiryContext: PracticeSolutionInquiryContext;
};

export function PracticeSolutionsView({ inquiryContext }: Props) {
  const { openInquiry, portal } = usePracticeSolutionInquiry(inquiryContext);

  return (
    <div className="yd-campaigns-landing-shell">
      <div className="yd-campaigns-landing-scroll">
        <div className="yd-campaigns-landing-page">
          <Link href="/profile/editor" className="yd-campaigns-landing-back">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Zurück zum Profil
          </Link>

          <div className="yd-campaigns-landing-canvas">
            {/* —— Sektion 1: Hero —— */}
            <section className="yd-cl-hero" aria-labelledby="yd-cl-hero-title">
              <div className="yd-cl-hero__copy">
                <p className="yd-cl-hero__eyebrow">{LANDING_HERO.eyebrow}</p>
                <h1 id="yd-cl-hero-title" className="yd-cl-hero__title">
                  {LANDING_HERO.title}
                </h1>
                <p className="yd-cl-hero__lead">{LANDING_HERO.lead}</p>
                <div className="yd-cl-hero__actions">
                  <button
                    type="button"
                    className="yd-cl-btn yd-cl-btn--primary"
                    onClick={() => openInquiry("individuell", "Landingpage")}
                  >
                    Landingpage buchen
                  </button>
                  <button
                    type="button"
                    className="yd-cl-btn yd-cl-btn--ghost"
                    onClick={() => openInquiry("individuell", "Individuelle Landingpage")}
                  >
                    Individuelle Landingpage
                  </button>
                </div>
              </div>

              <div className="yd-cl-hero__aside">
                <ul className="yd-cl-hero__pillars" role="list">
                  {LANDING_HERO.pillars.map((pillar) => (
                    <li key={pillar.label} className="yd-cl-hero__pillar">
                      <Sparkles className="h-4 w-4" aria-hidden />
                      <span>
                        <strong>{pillar.label}</strong>
                        <span>{pillar.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <HeroMockup />
              </div>
            </section>

            {/* —— Sektion 2: Kategorien Bento —— */}
            <section className="yd-cl-section" aria-labelledby="yd-cl-categories-title">
              <header className="yd-cl-section__head">
                <h2 id="yd-cl-categories-title" className="yd-cl-section__title">
                  Landingpage-Kategorien
                </h2>
              </header>
              <div className="yd-cl-bento" role="list">
                {LANDING_CATEGORIES.map((cat) => (
                  <article
                    key={cat.id}
                    className={cn("yd-cl-bento__card", cat.span === "wide" && "yd-cl-bento__card--wide")}
                    role="listitem"
                  >
                    <div className="yd-cl-bento__media">
                      <Image
                        src={cat.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="yd-cl-bento__image"
                      />
                    </div>
                    <div className="yd-cl-bento__body">
                      <span className="yd-cl-bento__status">{cat.status}</span>
                      <h3 className="yd-cl-bento__title">{cat.title}</h3>
                      <p className="yd-cl-bento__desc">{cat.description}</p>
                      <button
                        type="button"
                        className="yd-cl-bento__cta"
                        onClick={() => openInquiry(cat.inquiryId, cat.title, String(cat.id))}
                      >
                        Landingpage buchen
                        <span className="yd-cl-bento__cta-icon" aria-hidden>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* —— Sektion 3: Beliebte Kampagnen —— */}
            <section className="yd-cl-section" aria-labelledby="yd-cl-campaigns-title">
              <header className="yd-cl-section__head">
                <h2 id="yd-cl-campaigns-title" className="yd-cl-section__title">
                  Beliebte Kampagnen
                </h2>
              </header>
              <div className="yd-cl-campaigns">
                {POPULAR_CAMPAIGNS.map((campaign) => (
                  <article key={campaign.id} className="yd-cl-campaign">
                    <div className="yd-cl-campaign__media">
                      <Image
                        src={campaign.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="yd-cl-campaign__image"
                      />
                    </div>
                    <div className="yd-cl-campaign__body">
                      <h3 className="yd-cl-campaign__title">{campaign.title}</h3>
                      <p className="yd-cl-campaign__desc">{campaign.description}</p>
                      <button
                        type="button"
                        className="yd-cl-btn yd-cl-btn--primary yd-cl-btn--compact"
                        onClick={() => openInquiry(campaign.inquiryId, campaign.title, campaign.inquiryId)}
                      >
                        Kampagne buchen
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* —— Sektion 4: Individuelle Landingpage —— */}
            <section className="yd-cl-custom" aria-labelledby="yd-cl-custom-title">
              <div className="yd-cl-custom__mockups" aria-hidden>
                <div className="yd-cl-custom__device yd-cl-custom__device--desktop" />
                <div className="yd-cl-custom__device yd-cl-custom__device--tablet" />
                <div className="yd-cl-custom__device yd-cl-custom__device--mobile" />
              </div>
              <div className="yd-cl-custom__copy">
                <h2 id="yd-cl-custom-title" className="yd-cl-custom__title">
                  Sie haben eine eigene Idee?
                </h2>
                <p className="yd-cl-custom__lead">
                  Wir entwickeln individuelle Landingpages, Kampagnen und digitale Behandlungskonzepte
                  speziell für Ihre Praxis.
                </p>
                <ul className="yd-cl-custom__features" role="list">
                  {LANDING_CUSTOM_FEATURES.map((feature) => (
                    <li key={feature}>
                      <Check className="h-4 w-4" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="yd-cl-custom__action">
                <button
                  type="button"
                  className="yd-cl-btn yd-cl-btn--primary yd-cl-btn--large"
                  onClick={() => openInquiry("individuell", "Individuelle Landingpage")}
                >
                  Landingpage buchen
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </section>

            {/* —— Sektion 5: So funktioniert es —— */}
            <section className="yd-cl-section" aria-labelledby="yd-cl-process-title">
              <header className="yd-cl-section__head">
                <h2 id="yd-cl-process-title" className="yd-cl-section__title">
                  So funktioniert es
                </h2>
              </header>
              <div className="yd-cl-process">
                {LANDING_PROCESS_STEPS.map((step) => (
                  <article key={step.step} className="yd-cl-process__card">
                    <span className="yd-cl-process__step">{step.step}</span>
                    <h3 className="yd-cl-process__title">{step.title}</h3>
                    <p className="yd-cl-process__desc">{step.description}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* —— Sektion 6: Referenzgalerie —— */}
            <section className="yd-cl-section" aria-labelledby="yd-cl-gallery-title">
              <header className="yd-cl-section__head">
                <h2 id="yd-cl-gallery-title" className="yd-cl-section__title">
                  Referenzgalerie
                </h2>
                <p className="yd-cl-section__lead">
                  Hochwertige Landingpages — Desktop, Tablet und Mobile.
                </p>
              </header>
              <div className="yd-cl-gallery">
                {LANDING_GALLERY.map((item) => (
                  <figure
                    key={item.id}
                    className={cn("yd-cl-gallery__item", `yd-cl-gallery__item--${item.device}`)}
                  >
                    <div className="yd-cl-gallery__frame">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 80vw, 33vw"
                        className="yd-cl-gallery__image"
                      />
                    </div>
                    <figcaption className="yd-cl-gallery__caption">{item.label}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* —— Sektion 7: Abschluss-CTA —— */}
            <section className="yd-cl-closing" aria-labelledby="yd-cl-closing-title">
              <h2 id="yd-cl-closing-title" className="yd-cl-closing__title">
                {LANDING_CLOSING.title}
              </h2>
              <p className="yd-cl-closing__lead">{LANDING_CLOSING.lead}</p>
              <div className="yd-cl-closing__actions">
                <button
                  type="button"
                  className="yd-cl-btn yd-cl-btn--primary yd-cl-btn--large"
                  onClick={() => openInquiry("individuell", "Landingpage")}
                >
                  Landingpage buchen
                </button>
                <button
                  type="button"
                  className="yd-cl-btn yd-cl-btn--ghost yd-cl-btn--large"
                  onClick={() => openInquiry("individuell", "Individuelle Landingpage")}
                >
                  Individuelle Landingpage
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {portal}
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="yd-cl-hero-mockup" aria-hidden>
      <div className="yd-cl-hero-mockup__chrome">
        <span />
        <span />
        <span />
      </div>
      <div className="yd-cl-hero-mockup__screen">
        <div className="yd-cl-hero-mockup__hero-block" />
        <div className="yd-cl-hero-mockup__lines">
          <span />
          <span />
          <span />
        </div>
        <div className="yd-cl-hero-mockup__cta" />
      </div>
    </div>
  );
}
