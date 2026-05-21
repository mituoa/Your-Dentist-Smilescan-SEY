"use client";

import { useEffect } from "react";

import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

type PricingPageClientProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  loginHref: string;
};

export function PricingPageClient({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  loginHref,
}: PricingPageClientProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    const id = hash === "pricing" ? "plans" : hash;
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <article className="yd-clinical-page">
      <div className="yd-clinical-desktop-only">
        <YdProductChrome setupHref="/#pricing" setupLabel="Pakete" loginHref={loginHref} />
        <YdPublicPricingStage
          initialPlan={initialPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          loginHref={loginHref}
          showHomeLink
          fieldIndex={1}
        />
      </div>
      <div className="yd-clinical-mobile-only">
        <YdProductChrome variant="entry" />
        <YdPublicPricingStage
          initialPlan={initialPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          loginHref={loginHref}
          showHomeLink
          fieldIndex={1}
        />
      </div>
    </article>
  );
}
