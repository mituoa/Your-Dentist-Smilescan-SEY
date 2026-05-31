"use client";

import Link from "next/link";

import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import { PUBLIC_SITE_HERO, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";
import { scrollToPublicSection } from "@/lib/marketing/public-site-scroll";

type YdPublicSiteMobileCtasProps = {
  dashboardHref?: string | null;
};

/** Mobile — direkter Zugang: Anmelden, Registrieren, Demo (ohne Umweg über Register). */
export function YdPublicSiteMobileCtas({ dashboardHref = null }: YdPublicSiteMobileCtasProps) {
  return (
    <section className="yd-public-site-mobile-ctas" aria-label="Zugang zur Praxis">
      {dashboardHref ? (
        <Link prefetch href={dashboardHref} className="yd-public-site-cta-dashboard">
          Zum Dashboard
        </Link>
      ) : null}
      <Link prefetch href="/login" className="yd-clinical-cta-primary yd-public-site-cta-primary">
        {PUBLIC_SITE_HERO.signInLabel}
      </Link>
      <Link
        prefetch
        href={buildRegisterEntryHref()}
        className="yd-clinical-cta-secondary yd-public-site-cta-secondary"
      >
        {PUBLIC_SITE_HERO.primaryCta}
      </Link>
      <button
        type="button"
        className="yd-public-site-cta-tertiary"
        onClick={() => scrollToPublicSection(PUBLIC_SITE_SECTIONS.demo)}
      >
        Demo buchen
      </button>
    </section>
  );
}
