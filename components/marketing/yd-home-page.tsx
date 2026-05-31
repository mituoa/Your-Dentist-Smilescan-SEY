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
  /** Eingeloggt — optionaler Link, kein Auto-Redirect von /. */
  dashboardHref?: string | null;
};

/**
 * Öffentliche Landing — Desktop (editorial) und Mobile (eigene IA), getrennte Layouts.
 */
export function YdHomePage({
  initialPlan,
  inviteToken,
  prefilledEmail,
  dashboardHref = null,
}: YdHomePageProps) {
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
    const run = () => {
      if (scrollToPublicSectionFromHash()) return;
      window.setTimeout(() => scrollToPublicSectionFromHash(), 120);
    };
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
        dashboardHref={dashboardHref}
      />
      <YdHomeDesktop
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
        dashboardHref={dashboardHref}
      />
    </YdPublicOsEnvironment>
  );
}
