"use client";

import { useEffect, useState } from "react";

import { YdHomeDesktop } from "@/components/marketing/yd-home-desktop";
import { YdHomeMobile } from "@/components/marketing/yd-home-mobile";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { scrollToPublicSectionFromHash } from "@/lib/marketing/public-site-scroll";

type YdHomePageProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Öffentliche Landing — Desktop (editorial) und Mobile (eigene IA), getrennte Layouts.
 */
export function YdHomePage({ initialPlan, inviteToken, prefilledEmail }: YdHomePageProps) {
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const apply = () => setScroll(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    const run = () => scrollToPublicSectionFromHash();
    requestAnimationFrame(() => requestAnimationFrame(run));
    const onHash = () => scrollToPublicSectionFromHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [scroll]);

  return (
    <YdPublicOsEnvironment scroll={scroll}>
      <YdHomeMobile
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />
      <YdHomeDesktop
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />
    </YdPublicOsEnvironment>
  );
}
