"use client";

import Link from "next/link";
import { useEffect } from "react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { coerceRegisterPlan } from "@/lib/auth/register-plans";

const ONBOARDING_STEPS = [
  {
    title: "Plan wählen",
    body: "Abrechnungsrhythmus festlegen — alle Pläne nutzen denselben geschützten Praxisbereich.",
  },
  {
    title: "Praxis registrieren",
    body: "Praxisdaten, Verifizierung und ggf. Unterlagen — strukturiert und datenschutzbewusst.",
  },
  {
    title: "Freischaltung",
    body: "Nach Prüfung erhalten Sie Zugang per E-Mail. Bis dahin bleibt der Bereich geschützt.",
  },
] as const;

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
  const selectedPlan = coerceRegisterPlan(initialPlan);

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
    <div className="yd-register-page yd-pricing-page">
      <header className="yd-register-page-header yd-auth-awaken-field">
        <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" centered />
        <p className="yd-pricing-page-eyebrow">Lizenz & Onboarding</p>
        <h1 className="yd-register-page-title">Praxisbereich einrichten</h1>
        <p className="yd-register-page-lead">
          Ruhige, professionelle Infrastruktur für Einsendungen, Aufgaben und Teamarbeit —
          ohne Startup-Funnel, mit klarer Freischaltung nach Prüfung.
        </p>

        <div className="yd-pricing-page-actions">
          <Link href={`/register?plan=${selectedPlan}&step=1`} className="yd-auth-btn-primary yd-pricing-page-cta-primary">
            Registrierung starten
          </Link>
          <Link prefetch href={loginHref} className="yd-auth-btn-secondary yd-pricing-page-cta-secondary">
            Zum Login
          </Link>
        </div>
      </header>

      <section className="yd-pricing-onboarding-steps yd-auth-awaken-field" aria-label="Ablauf">
        <h2 className="yd-pricing-onboarding-steps-title">So gelangen Sie in den Praxisbereich</h2>
        <ol className="yd-pricing-onboarding-steps-list">
          {ONBOARDING_STEPS.map((step, i) => (
            <li key={step.title} className="yd-pricing-onboarding-step">
              <span className="yd-pricing-onboarding-step-num" aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className="yd-pricing-onboarding-step-title">{step.title}</p>
                <p className="yd-pricing-onboarding-step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <YdRegisterPricing
        selectedPlan={selectedPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
        sectionId="plans"
      />

      <footer className="yd-pricing-page-footer yd-auth-awaken-field">
        <p>
          Bereits freigeschaltet?{" "}
          <Link prefetch href={loginHref} className="yd-auth-link">
            Anmelden
          </Link>
        </p>
        <p className="yd-pricing-page-footer-note">
          Registrierung umfasst Praxisdaten, E-Mail-Bestätigung und ggf. Nachweisupload — Details im
          Assistenten nach Planwahl.
        </p>
      </footer>
    </div>
  );
}
