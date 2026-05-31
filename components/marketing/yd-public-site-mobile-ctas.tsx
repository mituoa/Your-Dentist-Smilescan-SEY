"use client";

import Link from "next/link";

import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import { PUBLIC_SITE_HERO, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";
import { scrollToPublicSection } from "@/lib/marketing/public-site-scroll";
import type { RegisterPlanId } from "@/lib/auth/register-plans";

type YdPublicSiteMobileCtasProps = {
  selectedPlan: RegisterPlanId;
};

export function YdPublicSiteMobileCtas({ selectedPlan }: YdPublicSiteMobileCtasProps) {
  return (
    <section className="yd-public-site-mobile-ctas" aria-label="Zugang zur Praxis">
      <Link
        prefetch
        href={buildRegisterEntryHref("", "", selectedPlan)}
        className="yd-clinical-cta-primary yd-public-site-cta-primary"
      >
        {PUBLIC_SITE_HERO.primaryCta}
      </Link>
      <button
        type="button"
        className="yd-clinical-cta-secondary yd-public-site-cta-secondary"
        onClick={() => scrollToPublicSection(PUBLIC_SITE_SECTIONS.demo)}
      >
        {PUBLIC_SITE_HERO.secondaryCta}
      </button>
      <p className="yd-clinical-cta-signin yd-public-site-cta-signin">
        {PUBLIC_SITE_HERO.signInPrefix}{" "}
        <Link prefetch href="/login">
          {PUBLIC_SITE_HERO.signInLabel}
        </Link>
      </p>
    </section>
  );
}
