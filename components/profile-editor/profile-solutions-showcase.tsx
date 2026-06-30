"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LandingCatalogCard } from "@/components/profile/landing-catalog-card";
import { usePracticeSolutionInquiry } from "@/components/profile/practice-solution-inquiry-sheet";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import type { LandingCategory } from "@/lib/practice-solutions/landing-page-model";
import { LANDING_CATEGORIES, LANDING_HERO } from "@/lib/practice-solutions/landing-page-model";

const SHOWCASE_IDS = [
  "smilescan",
  "aligner",
  "implantologie",
  "bleaching",
  "prophylaxe",
  "karriere",
] as const;

type Props = {
  inquiryContext: PracticeSolutionInquiryContext;
};

export function ProfileSolutionsShowcase({ inquiryContext }: Props) {
  const { openInquiry, portal } = usePracticeSolutionInquiry(inquiryContext, {
    resumePath: "/profile/editor",
  });

  const featured = LANDING_CATEGORIES.filter((c) =>
    (SHOWCASE_IDS as readonly string[]).includes(c.id)
  );

  const handleBook = (cat: LandingCategory) => {
    openInquiry(cat.inquiryId, cat.title, String(cat.id));
  };

  return (
    <section
      id="praxis-loesungen"
      className="yd-pe-growth-preview"
      aria-labelledby="yd-pe-growth-preview-title"
    >
      <div className="yd-pe-growth-preview__canvas">
        <header className="yd-pe-growth-preview__hero">
          <p className="yd-cl-hero__eyebrow">{LANDING_HERO.eyebrow}</p>
          <h2 id="yd-pe-growth-preview-title" className="yd-cl-hero__title">
            {LANDING_HERO.title}
          </h2>
          <p className="yd-cl-hero__subtitle">{LANDING_HERO.subtitle}</p>
        </header>

        <ul className="yd-cl-catalog__grid yd-pe-growth-preview__grid">
          {featured.map((cat) => (
            <LandingCatalogCard
              key={cat.id}
              category={cat}
              onBook={handleBook}
            />
          ))}
        </ul>

        <footer className="yd-pe-growth-preview__foot">
          <Link href="/profile/editor#praxis-loesungen" className="yd-pe-growth-preview__all-link">
            Alle anzeigen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </footer>
      </div>

      {portal}
    </section>
  );
}
