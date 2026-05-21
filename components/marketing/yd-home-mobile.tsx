"use client";

import Link from "next/link";

import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";

const VALUE_LINES = [
  "Patient:innen senden Fotos strukturiert ein",
  "Ihr Team koordiniert intern — ohne WhatsApp-Chaos",
  "Relay: Aufgaben, Nachrichten, Erinnerungen",
] as const;

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Mobile entry — calm, focused, app-like. No long marketing scroll.
 */
export function YdHomeMobile({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeMobileProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  return (
    <div className="yd-entry-mobile yd-clinical-mobile-only">
      <header className="yd-entry-mobile-header">
        <Link href="/" className="yd-auth-brand-link" aria-label="Startseite">
          <YourDentistBrandLockup size="sm" tagline={null} />
        </Link>
      </header>

      <main className="yd-entry-mobile-main">
        <div className="yd-entry-mobile-hero">
          <p className="yd-clinical-eyebrow">Ruhiger Praxisalltag</p>
          <h1 className="yd-clinical-display yd-entry-mobile-title">
            Weniger Stress. <em>Mehr</em> Klarheit im Team.
          </h1>
          <p className="yd-entry-mobile-value">
            Ein geschützter Praxisbereich für Eingang, interne Kommunikation und
            strukturierte Übergaben.
          </p>
          <ul className="yd-entry-mobile-lines" aria-label="Was sich ändert">
            {VALUE_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="yd-entry-mobile-actions">
          <Link href="/register" className="yd-clinical-cta-primary">
            Praxis einrichten
          </Link>
          <Link prefetch href="/login" className="yd-clinical-cta-secondary">
            Anmelden
          </Link>
        </div>

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
