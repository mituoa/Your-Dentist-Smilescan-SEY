"use client";

import Link from "next/link";
import { useEffect } from "react";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { coerceRegisterPlan } from "@/lib/auth/register-plans";

type PricingPageClientProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
  loginHref: string;
};

/** Dedicated pricing route — continuation of home narrative, not a second landing page. */
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
    <article className="yd-public-page">
      <YdProductChrome setupHref="/#pricing" setupLabel="Pakete" loginHref={loginHref} />

      <header className="yd-public-story yd-public-pricing-route-intro yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "1" }}>
        <div className="yd-public-story-inner">
          <p className="yd-public-section-kicker">Praxislizenz</p>
          <h1 className="yd-public-section-title yd-public-section-title--editorial">
            Praxis einrichten und nach <em>Prüfung</em> freischalten
          </h1>
          <p className="yd-public-prose">
            <Link href="/" className="yd-os-link">
              Zur Produktübersicht
            </Link>
            {" "}— wählen Sie den Abrechnungsrhythmus und starten Sie den Assistenten mit Praxisdaten,
            ärztlicher Identität und Nachweis.
          </p>
        </div>
      </header>

      <div className="yd-public-island yd-public-pricing-island yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "2" }}>
        <YdRegisterPricing
          selectedPlan={selectedPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          sectionId="plans"
        />
      </div>

      <footer className="yd-public-footer yd-public-os-awaken-field" style={{ ["--yd-public-field-i" as string]: "3" }}>
        <p>
          Bereits freigeschaltet?{" "}
          <Link prefetch href={loginHref} className="yd-os-link">
            Anmelden
          </Link>
          <span aria-hidden> · </span>
          <Link href="/" className="yd-os-link">
            Startseite
          </Link>
        </p>
      </footer>
    </article>
  );
}
