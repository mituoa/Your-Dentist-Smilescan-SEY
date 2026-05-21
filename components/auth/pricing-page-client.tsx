"use client";

import { useEffect } from "react";

import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";

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
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

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
      <div className="yd-entry-pricing-mobile-page yd-clinical-mobile-only">
        <YdProductChrome variant="entry" />
        <div className="yd-entry-pricing-mobile-inner">
          <h1 className="yd-public-entry-title">Praxis einrichten</h1>
          <p className="yd-public-entry-lead">
            Rhythmus wählen und Registrierung starten — nach Prüfung öffnet sich Ihr geschützter
            Bereich.
          </p>
          <YdEntryPricingCompact
            initialPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
          />
          <p className="yd-entry-pricing-mobile-login">
            Bereits freigeschaltet?{" "}
            <a href={loginHref} className="yd-clinical-cta-ghost">
              Anmelden
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
