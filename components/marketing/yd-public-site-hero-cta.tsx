"use client";

import Link from "next/link";

import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import { PUBLIC_SITE_HERO, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";
import { scrollToPublicSection } from "@/lib/marketing/public-site-scroll";

type YdPublicSiteHeroCtaProps = {
  showSignIn?: boolean;
  registerPlan?: string;
};

export function YdPublicSiteHeroCta({ showSignIn = true, registerPlan }: YdPublicSiteHeroCtaProps) {
  return (
    <div className="yd-clinical-hero-cta-stack yd-public-site-hero-cta-stack">
      <button
        type="button"
        className="yd-clinical-cta-primary yd-public-site-cta-primary"
        onClick={() => scrollToPublicSection(PUBLIC_SITE_SECTIONS.demo)}
      >
        {PUBLIC_SITE_HERO.primaryCta}
      </button>
      <Link
        prefetch
        href={buildRegisterEntryHref("", "", registerPlan ?? "yearly")}
        className="yd-clinical-cta-secondary yd-public-site-cta-secondary"
      >
        {PUBLIC_SITE_HERO.secondaryCta}
      </Link>
      {showSignIn ? (
        <p className="yd-clinical-cta-signin yd-public-site-cta-signin">
          {PUBLIC_SITE_HERO.signInPrefix}{" "}
          <Link prefetch href="/login">
            {PUBLIC_SITE_HERO.signInLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
