"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LandingCatalogCard } from "@/components/profile/landing-catalog-card";
import { usePracticeSolutionInquiry } from "@/components/profile/practice-solution-inquiry-sheet";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import type { LandingCategory } from "@/lib/practice-solutions/landing-page-model";
import {
  LANDING_CATEGORIES,
  LANDING_CLOSING,
  LANDING_HERO,
} from "@/lib/practice-solutions/landing-page-model";

type Props = {
  inquiryContext: PracticeSolutionInquiryContext;
};

export function PracticeSolutionsView({ inquiryContext }: Props) {
  const { openInquiry, portal } = usePracticeSolutionInquiry(inquiryContext);

  const handleBook = (cat: LandingCategory) => {
    openInquiry(cat.inquiryId, cat.title, String(cat.id));
  };

  return (
    <div className="yd-campaigns-landing-shell">
      <div className="yd-campaigns-landing-scroll">
        <div className="yd-campaigns-landing-page">
          <Link href="/profile/editor" className="yd-campaigns-landing-back">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Profil
          </Link>

          <div className="yd-campaigns-landing-canvas">
            <header className="yd-cl-hero">
              <p className="yd-cl-hero__eyebrow">{LANDING_HERO.eyebrow}</p>
              <h1 className="yd-cl-hero__title">{LANDING_HERO.title}</h1>
              <p className="yd-cl-hero__subtitle">{LANDING_HERO.subtitle}</p>
            </header>

            <section className="yd-cl-catalog" aria-label="Schwerpunkte">
              <ul className="yd-cl-catalog__grid">
                {LANDING_CATEGORIES.map((cat) => (
                  <LandingCatalogCard
                    key={cat.id}
                    category={cat}
                    onBook={handleBook}
                  />
                ))}
              </ul>
            </section>

            <footer className="yd-cl-closing">
              <p className="yd-cl-closing__title">{LANDING_CLOSING.title}</p>
              <button
                type="button"
                className="yd-cl-closing__link"
                onClick={() => openInquiry("individuell", "Individuelles Projekt")}
              >
                Projekt anfragen
              </button>
            </footer>
          </div>
        </div>
      </div>

      {portal}
    </div>
  );
}
