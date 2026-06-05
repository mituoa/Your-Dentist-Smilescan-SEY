"use client";

import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import { YdPublicSiteMobileCtas } from "@/components/marketing/yd-public-site-mobile-ctas";
import { PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";
import {
  YdPublicSiteDemo,
  YdPublicSiteHeroMobile,
  YdPublicSiteLoesung,
  YdPublicSitePatienten,
  YdPublicSitePlattform,
  YdPublicSitePraxisalltag,
  YdPublicSiteTeam,
} from "@/components/marketing/yd-public-site-sections";

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  dashboardHref?: string | null;
};

/** Mobile Landing — dieselbe Story, kompakter Rhythmus. */
export function YdHomeMobile({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  dashboardHref = null,
}: YdHomeMobileProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <div className="yd-public-site-page yd-public-site-page--editorial yd-public-site-mobile-page yd-clinical-mobile-only">
      <YdPublicSiteHeader dashboardHref={dashboardHref} />

      <main className="yd-public-site-mobile-main" id="yd-public-mobile-main">
        <YdPublicSiteHeroMobile />

        <YdPublicSiteMobileCtas dashboardHref={dashboardHref} />

        <YdPublicSitePraxisalltag />

        <YdPublicSitePatienten />

        <YdPublicSiteTeam />

        <YdPublicSiteLoesung />

        <YdPublicSitePlattform />

        <section
          id={PUBLIC_SITE_SECTIONS.pricing}
          className="yd-public-site-mobile-pricing yd-public-site-scroll-anchor"
          aria-label="Praxiszugang und Preise"
        >
          <YdEntryPricingCompact
            initialPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
          />
        </section>

        <YdPublicSiteDemo />
      </main>

      <YdPublicSiteFooter />
    </div>
  );
}
