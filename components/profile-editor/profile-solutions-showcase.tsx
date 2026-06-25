"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

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
            <p className="yd-cl-hero__eyebrow">Kampagnen & Landingpages</p>
            <h2 id="yd-pe-growth-preview-title" className="yd-cl-hero__title">
              {LANDING_HERO.title}
            </h2>
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

          <div className="yd-pe-growth-preview__hero-aside">
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
          </div>
        </header>

        <div className="yd-cl-bento yd-pe-growth-preview__bento" role="list">
          {featured.map((cat) => (
            <article
              key={cat.id}
              className={cn(
                "yd-cl-bento__card yd-pe-growth-preview__card",
                cat.span === "wide" && "yd-cl-bento__card--wide"
              )}
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

        <footer className="yd-pe-growth-preview__foot">
          <Link href="/profile/solutions" className="yd-cl-btn yd-cl-btn--primary yd-cl-btn--large">
            Alle Kampagnen & Landingpages
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="yd-pe-growth-preview__note">
            Konzeption und Umsetzung — persönlich begleitet, ohne Shop-Charakter.
          </p>
        </footer>
      </div>

      {portal}
    </section>
  );
}
