"use client";

import Link from "next/link";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";

type YdPublicPricingStageProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  loginHref?: string;
  fieldIndex?: number;
  showHomeLink?: boolean;
};

/** Single dashboard-island pricing — professional licensing tone. */
export function YdPublicPricingStage({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
  loginHref = "/login",
  fieldIndex = 6,
  showHomeLink = false,
}: YdPublicPricingStageProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <section
      id="pricing"
      className="yd-clinical-pricing-act yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: String(fieldIndex) }}
      aria-labelledby="yd-clinical-pricing-title"
    >
      <p className="yd-clinical-eyebrow">Wenn Sie bereit sind</p>
      <h2 id="yd-clinical-pricing-title" className="yd-clinical-act-title">
        Praxis einrichten — nach Prüfung <em>freischalten</em>
      </h2>
      <p className="yd-clinical-body">
        Kein Druck: Abrechnungsrhythmus wählen, Assistenten in Ruhe durchlaufen. Nach Freigabe öffnet
        sich Ihr geschützter Bereich.
      </p>
      {showHomeLink ? (
        <p className="yd-clinical-whisper">
          <Link href="/" className="yd-clinical-cta-ghost">
            Zur Startseite
          </Link>
        </p>
      ) : null}
      <p className="yd-clinical-whisper">
        Bereits freigeschaltet?{" "}
        <Link prefetch href={loginHref} className="yd-clinical-cta-ghost">
          Anmelden
        </Link>
      </p>
      <div className="yd-clinical-pricing-stage">
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
