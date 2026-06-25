"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { usePracticeSolutionInquiry } from "@/components/profile/practice-solution-inquiry-sheet";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import {
  LANDING_CATEGORIES,
  LANDING_CLOSING,
  LANDING_HERO,
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
            <section className="yd-cl-hero" aria-labelledby="yd-cl-hero-title">
              <div className="yd-cl-hero__copy">
                <h1 id="yd-cl-hero-title" className="yd-cl-hero__title">
                  {LANDING_HERO.title}
                </h1>
                <p className="yd-cl-hero__subtitle">{LANDING_HERO.subtitle}</p>
                <div className="yd-cl-hero__actions">
                  <button
                    type="button"
                    className="yd-cl-btn yd-cl-btn--primary"
                    onClick={() => openInquiry("smilescan", "SmileScan", "smilescan")}
                  >
                    Landingpage buchen
                  </button>
                  <button
                    type="button"
                    className="yd-cl-btn yd-cl-btn--secondary"
                    onClick={() => openInquiry("individuell", "Individuelles Projekt")}
                  >
                    Individuelles Projekt
                  </button>
                </div>
              </div>

              <ul className="yd-cl-hero__benefits">
                {LANDING_HERO.benefits.map((benefit) => (
                  <li key={benefit.title} className="yd-cl-hero__benefit">
                    <Check className="yd-cl-hero__benefit-icon" aria-hidden />
                    <span className="yd-cl-hero__benefit-title">{benefit.title}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="yd-cl-catalog" aria-label="Landingpages">
              <div className="yd-cl-catalog__grid" role="list">
                {LANDING_CATEGORIES.map((cat) => (
                  <article
                    key={cat.id}
                    className={cn(
                      "yd-cl-catalog__card",
                      cat.tier === "featured" && "yd-cl-catalog__card--featured"
                    )}
                    role="listitem"
                  >
                    <div className="yd-cl-catalog__media">
                      <Image
                        src={cat.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 80px, 120px"
                        className="yd-cl-catalog__image"
                        style={
                          cat.imagePosition
                            ? { objectPosition: cat.imagePosition }
                            : undefined
                        }
                      />
                    </div>
                    <div className="yd-cl-catalog__body">
                      <div className="yd-cl-catalog__main">
                        {cat.badge ? (
                          <span className="yd-cl-catalog__badge">{cat.badge}</span>
                        ) : null}
                        <p className="yd-cl-catalog__category">{cat.categoryLabel}</p>
                        <h2 className="yd-cl-catalog__title">{cat.title}</h2>
                        <p className="yd-cl-catalog__tagline">{cat.tagline}</p>
                      </div>
                      <button
                        type="button"
                        className="yd-cl-catalog__cta"
                        onClick={() => openInquiry(cat.inquiryId, cat.title, String(cat.id))}
                      >
                        Landingpage buchen
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="yd-cl-closing" aria-labelledby="yd-cl-closing-title">
              <div className="yd-cl-closing__rule" aria-hidden />
              <h2 id="yd-cl-closing-title" className="yd-cl-closing__title">
                {LANDING_CLOSING.title}
              </h2>
              <p className="yd-cl-closing__lead">{LANDING_CLOSING.lead}</p>
              <button
                type="button"
                className="yd-cl-btn yd-cl-btn--secondary"
                onClick={() => openInquiry("individuell", "Individuelles Projekt")}
              >
                Individuelles Projekt anfragen
              </button>
            </section>
          </div>
        </div>
      </div>

      {portal}
    </div>
  );
}
