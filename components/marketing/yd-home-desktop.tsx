"use client";

import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import {
  YdPublicSiteDemo,
  YdPublicSiteEinfuehrung,
  YdPublicSiteFuerWen,
  YdPublicSiteHero,
  YdPublicSiteNutzen,
} from "@/components/marketing/yd-public-site-sections";

type YdHomeDesktopProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

export function YdHomeDesktop({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeDesktopProps) {
  return (
    <article className="yd-clinical-page yd-public-site-page yd-clinical-desktop-only">
      <YdPublicSiteHeader />

      <YdPublicSiteHero />

      <YdPublicSiteNutzen />

      <YdPublicSiteFuerWen />

      <YdPublicSiteEinfuehrung />

      <YdPublicPricingStage
        fieldIndex={5}
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />

      <YdPublicSiteDemo />

      <YdPublicSiteFooter />
    </article>
  );
}
