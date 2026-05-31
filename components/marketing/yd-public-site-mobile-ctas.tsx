"use client";

import Link from "next/link";

import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import { PUBLIC_SITE_HERO, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";
import { scrollToPublicSection } from "@/lib/marketing/public-site-scroll";

type YdPublicSiteMobileCtasProps = {
  dashboardHref?: string | null;
};

/** Mobile Hero-CTAs — Demo scrollt, Zugang → Register, Anmelden → Login. */
export function YdPublicSiteMobileCtas({ dashboardHref = null }: YdPublicSiteMobileCtasProps) {
  return (
    <section className="yd-public-site-mobile-ctas" aria-label="Zugang zur Praxis">
      {dashboardHref ? (
        <Link prefetch href={dashboardHref} className="yd-public-site-cta-dashboard">
          Zum Dashboard
        </Link>
      ) : null}
      <button
        type="button"
        className="yd-clinical-cta-primary yd-public-site-cta-primary"
        onClick={() => scrollToPublicSection(PUBLIC_SITE_SECTIONS.demo)}
      >
        {PUBLIC_SITE_HERO.primaryCta}
      </button>
      <Link
        prefetch
        href={buildRegisterEntryHref()}
        className="yd-clinical-cta-secondary yd-public-site-cta-secondary"
      >
        {PUBLIC_SITE_HERO.secondaryCta}
      </Link>
      <p className="yd-clinical-cta-signin yd-public-site-cta-signin">
        {PUBLIC_SITE_HERO.signInPrefix}{" "}
        <Link prefetch href="/login">
          {PUBLIC_SITE_HERO.signInLabel}
        </Link>
      </p>
    </section>
  );
}
