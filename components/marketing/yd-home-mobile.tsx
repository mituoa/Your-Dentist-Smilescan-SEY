"use client";

import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import { YdPublicSiteMobileCtas } from "@/components/marketing/yd-public-site-mobile-ctas";
import {
  YdPublicSiteDemo,
  YdPublicSiteEinfuehrung,
  YdPublicSiteFuerWen,
  YdPublicSiteHeroMobile,
  YdPublicSiteNutzen,
} from "@/components/marketing/yd-public-site-sections";

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Mobile Landing — eigene IA (kompakt, keine Desktop-Sektionen).
 * Desktop bleibt editorial in YdHomeDesktop.
 */
export function YdHomeMobile({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeMobileProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <div className="yd-public-site-page yd-public-site-mobile-page yd-clinical-mobile-only">
      <YdPublicSiteHeader />

      <main className="yd-public-site-mobile-main" id="yd-public-mobile-main">
        <YdPublicSiteHeroMobile />

        <YdPublicSiteMobileCtas />

        <section
          id="pricing"
          className="yd-public-site-mobile-pricing scroll-mt-[5.5rem]"
          aria-label="Praxiszugang und Preise"
        >
          <YdEntryPricingCompact
            initialPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
          />
        </section>

        <YdPublicSiteNutzen />

        <YdPublicSiteFuerWen />

        <YdPublicSiteEinfuehrung />

        <YdPublicSiteDemo />
      </main>

      <YdPublicSiteFooter />
    </div>
  );
}
