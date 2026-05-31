"use client";

import Link from "next/link";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import { PUBLIC_SITE_PRICING, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";

type YdPublicPricingStageProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  fieldIndex?: number;
  showHomeLink?: boolean;
};

/** Praxiszugang — geschützter Bereich, kein SaaS-Pricing-Table. */
export function YdPublicPricingStage({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  fieldIndex = 6,
  showHomeLink = false,
}: YdPublicPricingStageProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <section
      id={PUBLIC_SITE_SECTIONS.pricing}
      className="yd-clinical-pricing-act yd-clinical-access-act yd-public-site-section yd-public-site-scroll-anchor yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: String(fieldIndex) }}
      aria-labelledby="yd-clinical-access-title"
    >
      <header className="yd-public-site-section-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_PRICING.eyebrow}</p>
        <h2 id="yd-clinical-access-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {PUBLIC_SITE_PRICING.title}
        </h2>
        <p className="yd-public-site-section-lead">{PUBLIC_SITE_PRICING.lead}</p>
      </header>
      {showHomeLink ? (
        <p className="yd-clinical-whisper">
          <Link href="/" className="yd-clinical-cta-ghost">
            Zur Startseite
          </Link>
        </p>
      ) : null}
      <div className="yd-clinical-pricing-stage yd-clinical-pricing-stage--access yd-public-site-pricing-anchor">
        <YdRegisterPricing
          selectedPlan={selectedPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          variant="access"
          embedded
        />
      </div>
    </section>
  );
}
