"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { usePracticeSolutionInquiry } from "@/components/profile/practice-solution-inquiry-sheet";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import { LANDING_CATEGORIES, LANDING_HERO } from "@/lib/practice-solutions/landing-page-model";
import { cn } from "@/lib/utils";

const SHOWCASE_IDS = [
  "smilescan",
  "aligner",
  "implantologie",
  "aesthetik",
  "prophylaxe",
  "oral-health-pass",
] as const;

type Props = {
  inquiryContext: PracticeSolutionInquiryContext;
};

export function ProfileSolutionsShowcase({ inquiryContext }: Props) {
  const { openInquiry, portal } = usePracticeSolutionInquiry(inquiryContext);

  const featured = LANDING_CATEGORIES.filter((c) =>
    (SHOWCASE_IDS as readonly string[]).includes(c.id)
  );

  return (
    <section
      id="praxis-loesungen"
      className="yd-pe-growth-preview"
      aria-labelledby="yd-pe-growth-preview-title"
    >
      <div className="yd-pe-growth-preview__canvas">
        <header className="yd-pe-growth-preview__hero">
          <div className="yd-pe-growth-preview__hero-copy">
            <h2 id="yd-pe-growth-preview-title" className="yd-cl-hero__title">
              {LANDING_HERO.title}
            </h2>
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

          <ul className="yd-cl-hero__benefits yd-pe-growth-preview__benefits">
            {LANDING_HERO.benefits.slice(0, 3).map((benefit) => (
              <li key={benefit.title} className="yd-cl-hero__benefit">
                <Check className="yd-cl-hero__benefit-icon" aria-hidden />
                <span className="yd-cl-hero__benefit-title">{benefit.title}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="yd-cl-catalog__grid yd-pe-growth-preview__grid" role="list">
          {featured.map((cat) => (
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
                    cat.imagePosition ? { objectPosition: cat.imagePosition } : undefined
                  }
                />
              </div>
              <div className="yd-cl-catalog__body">
                <div className="yd-cl-catalog__main">
                  {cat.badge ? (
                    <span className="yd-cl-catalog__badge">{cat.badge}</span>
                  ) : null}
                  <p className="yd-cl-catalog__category">{cat.categoryLabel}</p>
                  <h3 className="yd-cl-catalog__title">{cat.title}</h3>
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

        <footer className="yd-pe-growth-preview__foot">
          <Link href="/profile/solutions" className="yd-cl-btn yd-cl-btn--secondary">
            Alle Kampagnen & Landingpages
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </footer>
      </div>

      {portal}
    </section>
  );
}
