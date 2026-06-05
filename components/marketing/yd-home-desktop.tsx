"use client";

import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import {
  YdPublicSiteDemo,
  YdPublicSiteHero,
  YdPublicSiteLoesung,
  YdPublicSitePatienten,
  YdPublicSitePlattform,
  YdPublicSitePraxisalltag,
  YdPublicSiteTeam,
} from "@/components/marketing/yd-public-site-sections";

type YdHomeDesktopProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  dashboardHref?: string | null;
};

/** Öffentliche Landing — editorial, Premium Medical Infrastruktur. */
export function YdHomeDesktop({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  dashboardHref = null,
}: YdHomeDesktopProps) {
  return (
    <article className="yd-clinical-page yd-public-site-page yd-public-site-page--editorial yd-clinical-desktop-only">
      <YdPublicSiteHeader dashboardHref={dashboardHref} />

      <YdPublicSiteHero />

      <YdPublicSitePraxisalltag />

      <YdPublicSitePatienten />

      <YdPublicSiteTeam />

      <YdPublicSiteLoesung />

      <YdPublicSitePlattform />

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
