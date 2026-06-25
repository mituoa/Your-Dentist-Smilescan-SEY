"use client";

import { useCallback, useEffect, useState } from "react";

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
import { YdHomePricingSheet } from "@/components/marketing/yd-home-pricing-sheet";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { scrollToPublicSectionFromHash } from "@/lib/marketing/public-site-scroll";

const PRICING_HASHES = new Set(["preise", "pricing", "pakete"]);

function isPricingHash(hash: string): boolean {
  return PRICING_HASHES.has(hash.replace(/^#/, "").trim().toLowerCase());
}

type Props = {
  dashboardHref?: string | null;
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

export function YdBentoHomePage({
  dashboardHref = null,
  initialPlan = null,
  inviteToken = "",
  prefilledEmail = "",
}: Props) {
  const [pricingOpen, setPricingOpen] = useState(false);

  const openPricingSheet = useCallback(() => {
    setPricingOpen(true);
    if (typeof window === "undefined") return;
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", `${base}#preise`);
  }, []);

  const closePricingSheet = useCallback(() => {
    setPricingOpen(false);
    if (typeof window === "undefined") return;
    if (isPricingHash(window.location.hash)) {
      const base = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", base);
    }
  }, []);

  const syncPricingFromHash = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!isPricingHash(window.location.hash)) return false;
    setPricingOpen(true);
    return true;
  }, []);

  useEffect(() => {
    if (syncPricingFromHash()) return;
    if (!window.location.hash) return;
    const run = () => {
      if (syncPricingFromHash()) return;
      if (scrollToPublicSectionFromHash()) return;
      window.setTimeout(() => {
        if (!syncPricingFromHash()) scrollToPublicSectionFromHash();
      }, 120);
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
    const onHash = () => {
      if (syncPricingFromHash()) return;
      scrollToPublicSectionFromHash();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [syncPricingFromHash]);

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
        <BentoFooter onPricingClick={openPricingSheet} />
      </BentoPage>
      <YdHomePricingSheet
        open={pricingOpen}
        onClose={closePricingSheet}
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />
    </YdPublicOsEnvironment>
  );
}
