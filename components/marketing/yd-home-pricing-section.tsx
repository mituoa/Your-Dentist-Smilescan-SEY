"use client";

import Link from "next/link";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";

type YdHomePricingSectionProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  loginHref?: string;
};

/** Pricing band — lower on the page, after trust & onboarding narrative. */
export function YdHomePricingSection({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  loginHref = "/login",
}: YdHomePricingSectionProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <section
      id="pricing"
      className="yd-public-pricing-band yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: "6" }}
      aria-labelledby="yd-home-pricing-title"
    >
      <div className="yd-public-pricing-band-head">
        <p className="yd-public-section-kicker yd-public-kicker--warm">Wenn Sie bereit sind</p>
        <h2 id="yd-home-pricing-title" className="yd-public-section-title yd-public-section-title--editorial">
          Praxis einrichten — und nach Prüfung <em>freischalten</em> lassen
        </h2>
        <p className="yd-public-prose yd-public-prose--narrow">
          Kein Druck: Wählen Sie den Abrechnungsrhythmus, füllen Sie Praxisdaten und Nachweis in Ruhe
          aus. Nach Freigabe öffnet sich Ihr geschützter Bereich — derselbe ruhige Raum wie in der
          Vorschau oben.
        </p>
        <p className="yd-public-pricing-band-meta">
          Bereits freigeschaltet?{" "}
          <Link prefetch href={loginHref} className="yd-os-link">
            Anmelden
          </Link>
        </p>
      </div>
      <div className="yd-public-island yd-public-pricing-island">
        <YdRegisterPricing
          selectedPlan={selectedPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          sectionId="plans"
        />
      </div>
    </section>
  );
}
