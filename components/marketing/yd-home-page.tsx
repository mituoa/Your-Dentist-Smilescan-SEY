"use client";

import { useEffect, useState } from "react";

import { YdHomeDesktop } from "@/components/marketing/yd-home-desktop";
import { YdHomeMobile } from "@/components/marketing/yd-home-mobile";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";

type YdHomePageProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Desktop: editorial narrative (scroll). Mobile: app-like entry (no marketing scroll).
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
