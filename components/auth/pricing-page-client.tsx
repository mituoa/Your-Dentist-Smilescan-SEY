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
    <div className="yd-public-page">
      <header
        className="yd-public-top yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "0" }}
      >
        <Link href="/" className="yd-auth-brand-link" aria-label="Zur Startseite">
          <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" />
        </Link>
        <nav className="yd-public-top-nav" aria-label="Navigation">
          <Link prefetch href="/" className="yd-os-link">
            Übersicht
          </Link>
          <Link prefetch href={loginHref} className="yd-os-btn yd-os-btn--ghost">
            Anmelden
          </Link>
        </nav>
      </header>

      <section
        className="yd-public-pricing-hero yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-pricing-title"
      >
        <div className="yd-public-pricing-hero-inner">
          <div>
            <p className="yd-public-kicker">Lizenz & Onboarding</p>
            <h1 id="yd-pricing-title" className="yd-public-display" style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)" }}>
              Praxisbereich <em>einrichten</em>
            </h1>
            <p className="yd-public-lead">
              Ruhiges Onboarding mit menschlicher Klarheit — Plan wählen, Praxis registrieren,
              Freischaltung nach Prüfung. Kein Startup-Druck, volle Transparenz.
            </p>
            <div className="yd-public-hero-actions">
              <Link
                href={`/register?plan=${selectedPlan}&step=1`}
                className="yd-os-btn yd-os-btn--primary"
              >
                Registrierung starten
              </Link>
              <Link prefetch href={loginHref} className="yd-os-btn yd-os-btn--ghost">
                Zum Login
              </Link>
            </div>
          </div>

          <div>
            <p className="yd-public-section-kicker">Ablauf</p>
            <ol className="yd-public-pricing-steps" aria-label="Onboarding-Schritte">
              {ONBOARDING_STEPS.map((step, i) => (
                <li key={step.title} className="yd-public-pricing-step">
                  <span className="yd-public-pricing-step-num" aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <p className="yd-public-pricing-step-title">{step.title}</p>
                    <p className="yd-public-pricing-step-body">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div
        className="yd-public-field yd-public-pricing-plans-wrap yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "2" }}
      >
        <div className="yd-public-field-inner">
          <YdRegisterPricing
            selectedPlan={selectedPlan}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            sectionId="plans"
          />
        </div>
      </div>

      <footer
        className="yd-public-pricing-footer yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
      >
        <p>
          <Link prefetch href="/" className="yd-os-link">
            Startseite
          </Link>
          <span aria-hidden> · </span>
          Bereits freigeschaltet?{" "}
          <Link prefetch href={loginHref} className="yd-os-link">
            Anmelden
          </Link>
        </p>
        <p className="yd-public-pricing-footer-note">
          Registrierung umfasst Praxisdaten, E-Mail-Bestätigung und ggf. Nachweisupload — Details im
          Assistenten nach Planwahl.
        </p>
      </footer>
    </div>
  );
}
