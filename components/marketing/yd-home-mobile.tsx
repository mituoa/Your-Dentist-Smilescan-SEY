"use client";

import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import { YdPublicSiteMobileCtas } from "@/components/marketing/yd-public-site-mobile-ctas";
import {
  YdPublicSiteDemo,
  YdPublicSiteHeroMobile,
  YdPublicSiteNutzen,
} from "@/components/marketing/yd-public-site-sections";

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Mobile Startseite — eigene IA, ein Dokument-Scroll:
 * Header → Hero → CTAs → Zugang → Nutzen → Demo → Footer
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

        <YdPublicSiteMobileCtas selectedPlan={selectedPlan} />

        <section className="yd-public-site-mobile-pricing" aria-label="Praxiszugang und Preise">
          <YdEntryPricingCompact
            initialPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
          />
        </section>

        <YdPublicSiteNutzen compact />

        <YdPublicSiteDemo />
      </main>

      <YdPublicSiteFooter />
    </div>
  );
}
