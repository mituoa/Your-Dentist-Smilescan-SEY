"use client";

import Link from "next/link";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";

const MOBILE_TRUST = [
  "Weniger Telefonstress — Anfragen strukturiert am Fall",
  "Interne Teamkommunikation ohne E-Mail-Chaos",
  "Geschützter Bereich · Freischaltung nach Prüfung",
] as const;

type YdHomeMobileProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/** Mobile conversion surface — immediate trust + action, no scroll fatigue. */
export function YdHomeMobile({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeMobileProps) {
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;
  const loginHref = "/login";

  return (
    <div className="yd-clinical-mobile yd-clinical-mobile-only yd-clinical-page">
      <header className="yd-clinical-chrome yd-clinical-chrome--minimal">
        <Link href="/" className="yd-auth-brand-link" aria-label="Startseite">
          <YourDentistBrandLockup size="sm" tagline="Neutral Practice Platform" />
        </Link>
      </header>

      <main className="yd-clinical-mobile-main">
        <div>
          <p className="yd-clinical-eyebrow">Kommunikation & Organisation</p>
          <h1 className="yd-clinical-display">
            Weniger Chaos. <em>Klarere</em> Übergaben.
          </h1>
          <p className="yd-clinical-lead">
            Strukturierte Patientenanfragen und interne Teamarbeit — ein geschützter Praxisbereich
            statt Telefon, E-Mail und Messenger.
          </p>
        </div>

        <div className="yd-clinical-mobile-actions">
          <Link href="/#pricing" className="yd-clinical-cta-primary">
            Praxis einrichten
          </Link>
          <Link prefetch href={loginHref} className="yd-clinical-cta-secondary">
            Anmelden
          </Link>
        </div>

        <section id="pricing" className="yd-clinical-mobile-pricing" aria-labelledby="yd-mobile-pricing-title">
          <p id="yd-mobile-pricing-title" className="yd-clinical-eyebrow" style={{ marginTop: 0 }}>
            Praxislizenz
          </p>
          <p className="yd-clinical-body" style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
            Wählen Sie den Rhythmus — nach Prüfung erhalten Sie Zugang zum geschützten Bereich.
          </p>
          <YdRegisterPricing
            selectedPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            sectionId="plans-mobile"
          />
        </section>

        <section className="yd-clinical-mobile-trust" aria-label="Vertrauen">
          <ul>
            {MOBILE_TRUST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <details className="yd-clinical-mobile-more">
          <summary>Mehr über Your Dentist</summary>
          <p className="yd-clinical-mobile-more-content">
            Your Dentist verbindet Patientenwege und interne Koordination: Eingang, Sichtung,
            Übergaben und Antworten an einem Ort — für mehr Ruhe im vollen Praxisalltag.
          </p>
        </details>
      </main>

      <footer className="yd-clinical-footer">
        <div className="yd-clinical-footer-links">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </div>
        <p>Your Dentist</p>
      </footer>
    </div>
  );
}
