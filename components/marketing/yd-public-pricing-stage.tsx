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

/** Praxiszugang — geschützter Bereich, kein SaaS-Pricing-Table. */
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
      className="yd-clinical-pricing-act yd-clinical-access-act yd-public-os-awaken-field"
      style={{ ["--yd-public-field-i" as string]: String(fieldIndex) }}
      aria-labelledby="yd-clinical-access-title"
    >
      <p className="yd-clinical-eyebrow">Praxiszugang</p>
      <h2 id="yd-clinical-access-title" className="yd-clinical-act-title">
        Zugang &amp; Freischaltung
      </h2>
      <p className="yd-clinical-body">
        Ein geschützter Praxisbereich für Eingang, Relay und leise Assistenz — nach Prüfung
        freigeschaltet. Sie wählen nur den Abrechnungsrhythmus, nicht ein „Software-Paket“.
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
      <div className="yd-clinical-pricing-stage yd-clinical-pricing-stage--access">
        <YdRegisterPricing
          selectedPlan={selectedPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          sectionId="plans"
          variant="access"
        />
      </div>
    </section>
  );
}
