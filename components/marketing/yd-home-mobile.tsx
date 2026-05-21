"use client";

import Link from "next/link";

import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { YdPracticeDemo } from "@/components/marketing/yd-practice-demo";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import { PUBLIC_ENTRY_COPY } from "@/lib/marketing/public-entry-copy";

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Mobile entry — login, register, pricing. No long marketing scroll.
 */
export function YdHomeMobile({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeMobileProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <div className="yd-entry-mobile yd-entry-mobile--native yd-clinical-mobile-only">
      <header className="yd-entry-mobile-header">
        <Link href="/" className="yd-auth-brand-link" aria-label="Startseite">
          <YourDentistBrandLockup size="sm" tagline={null} />
        </Link>
        <Link prefetch href="/login" className="yd-entry-mobile-login">
          Anmelden
        </Link>
      </header>

      <main className="yd-entry-mobile-main">
        <div className="yd-entry-mobile-hero">
          <p className="yd-clinical-eyebrow">{PUBLIC_ENTRY_COPY.eyebrow}</p>
          <h1 className="yd-clinical-display yd-clinical-display--direct yd-entry-mobile-title">
            {PUBLIC_ENTRY_COPY.title}
          </h1>
          <p className="yd-entry-mobile-value">{PUBLIC_ENTRY_COPY.mobileValue}</p>
        </div>

        <div className="yd-entry-mobile-actions yd-clinical-hero-cta-stack">
          <Link href="/register" className="yd-clinical-cta-primary">
            Praxisbereich starten
          </Link>
          <a href="#einblick-mobile" className="yd-clinical-cta-secondary">
            Praxisablauf ansehen
          </a>
          <p className="yd-clinical-cta-signin">
            Bereits registriert?{" "}
            <Link prefetch href="/login">
              Anmelden
            </Link>
          </p>
        </div>

        <YdPracticeDemo compact />

        <YdEntryPricingCompact
          initialPlan={selectedPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
        />
      </main>

      <footer className="yd-entry-mobile-footer">
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <Link href="/agb">AGB</Link>
      </footer>
    </div>
  );
}
