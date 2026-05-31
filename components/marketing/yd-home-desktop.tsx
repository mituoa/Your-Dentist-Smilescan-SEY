"use client";

import { YdEcosystemRelayCommand } from "@/components/marketing/yd-ecosystem-relay-command";
import { YdPracticeDemo } from "@/components/marketing/yd-practice-demo";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdPublicSiteHeader } from "@/components/marketing/yd-public-site-header";
import { YdPublicSiteCommandShowcase } from "@/components/marketing/yd-public-site-command-showcase";
import {
  YdPublicSiteDemo,
  YdPublicSiteEinfuehrung,
  YdPublicSiteFuerWen,
  YdPublicSiteHero,
  YdPublicSiteNutzen,
  YdPublicSiteProblem,
} from "@/components/marketing/yd-public-site-sections";

type YdHomeDesktopProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  dashboardHref?: string | null;
};

/** Öffentliche Landing — editorial, überzeugend, vollständige Produktstory. */
export function YdHomeDesktop({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  dashboardHref = null,
}: YdHomeDesktopProps) {
  return (
    <article className="yd-clinical-page yd-public-site-page yd-clinical-desktop-only">
      <YdPublicSiteHeader dashboardHref={dashboardHref} />

      <YdPublicSiteHero />

      <YdPublicSiteProblem />

      <YdPracticeDemo />

      <YdPublicSiteNutzen />

      <YdPublicSiteCommandShowcase />

      <YdEcosystemRelayCommand />

      <YdPublicSiteFuerWen />

      <YdPublicSiteEinfuehrung />

      <YdPublicPricingStage
        fieldIndex={7}
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />

      <YdPublicSiteDemo />

      <YdPublicSiteFooter />
    </article>
  );
}
