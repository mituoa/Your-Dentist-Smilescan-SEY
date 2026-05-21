"use client";

import Link from "next/link";

import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import { PUBLIC_SITE_HERO, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import { YdPublicSiteDemo, YdPublicSiteHero, YdPublicSiteNutzen } from "@/components/marketing/yd-public-site-sections";

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/** Mobile: kompakt — Hero, CTAs, Zugang, Nutzen, Demo, Footer. */
export function YdHomeMobile({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeMobileProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <div className="yd-entry-mobile yd-entry-mobile--native yd-public-site-mobile-page yd-clinical-mobile-only">
      <YdPublicSiteHeader />

      <main className="yd-entry-mobile-main">
        <YdPublicSiteHero showSignIn={false} />

        <div className="yd-entry-mobile-actions yd-clinical-hero-cta-stack px-4">
          <Link href="/register" className="yd-clinical-cta-primary">
            {PUBLIC_SITE_HERO.primaryCta}
          </Link>
          <a href={`/#${PUBLIC_SITE_SECTIONS.demo}`} className="yd-clinical-cta-secondary">
            {PUBLIC_SITE_HERO.secondaryCta}
          </a>
          <p className="yd-clinical-cta-signin">
            {PUBLIC_SITE_HERO.signInPrefix}{" "}
            <Link prefetch href="/login">
              {PUBLIC_SITE_HERO.signInLabel}
            </Link>
          </p>
        </div>

        <div className="px-3">
          <YdEntryPricingCompact
            initialPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
          />
        </div>

        <YdPublicSiteNutzen />

        <YdPublicSiteDemo />
      </main>

      <YdPublicSiteFooter />
    </div>
  );
}
