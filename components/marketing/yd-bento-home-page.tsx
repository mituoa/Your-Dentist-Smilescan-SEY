"use client";

import { useEffect } from "react";

import { BentoHeader } from "@/components/marketing/bento/bento-header";
import {
  BentoAutomationSection,
  BentoCommandSection,
  BentoCtaSection,
  BentoFaqSection,
  BentoFooter,
  BentoHealingSection,
  BentoHeroSection,
  BentoJourneySection,
  BentoPlatformSection,
  BentoServicesSection,
  BentoWarumSection,
} from "@/components/marketing/bento/bento-sections";
import { BentoPage } from "@/components/marketing/bento/bento-primitives";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { scrollToPublicSectionFromHash } from "@/lib/marketing/public-site-scroll";

type Props = {
  dashboardHref?: string | null;
};

export function YdBentoHomePage({ dashboardHref = null }: Props) {
  useEffect(() => {
    if (!window.location.hash) return;
    const run = () => {
      if (scrollToPublicSectionFromHash()) return;
      window.setTimeout(() => scrollToPublicSectionFromHash(), 120);
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
    const onHash = () => scrollToPublicSectionFromHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <YdPublicOsEnvironment scroll mode="editorial">
      <BentoPage>
        <BentoHeader dashboardHref={dashboardHref} />
        <BentoHeroSection />
        <BentoPlatformSection />
        <BentoJourneySection />
        <BentoHealingSection />
        <BentoCommandSection />
        <BentoAutomationSection />
        <BentoServicesSection />
        <BentoWarumSection />
        <BentoFaqSection />
        <BentoCtaSection />
        <BentoFooter />
      </BentoPage>
    </YdPublicOsEnvironment>
  );
}
