"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const SALES_EMAIL =
  process.env.NEXT_PUBLIC_SALES_EMAIL || "vertrieb@smilescan.app";

type BillingPeriod = "monthly" | "annual";

type Plan = {
  id: string;
  name: string;
  /** Hauptpreis-Anzeige je Periode */
  priceMonthly: string;
  priceAnnual: string;
  /** Kurzer Hinweis zur jeweils anderen Option */
  subtextMonthly: string;
  subtextAnnual: string;
  bestFor: string;
  featuresLabel: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "0 €",
    priceAnnual: "0 €",
    subtextMonthly: "Keine Kreditkarte nötig.",
    subtextAnnual: "Dauerhaft kostenlos.",
    bestFor: "Zum Ausprobieren und kleinstem Volumen.",
    featuresLabel: "Kostenlos enthalten",
    features: [
      "1 Workspace (eine Praxis)",
      "1 Arzt-Platz + 1 Team-Platz",
      "Inbox mit begrenzten Einsendungen pro Monat",
      "Begrenzter Speicher für Fotos",
      "Aufgaben (Basis-Workflow)",
      "Öffentliche Praxis-Seite mit Basis-Upload",
      "E-Mail stark limitiert (Terminlink / Benachrichtigungen)",
      "Community-Support / Dokumentation",
    ],
    highlighted: false,
    ctaLabel: "Loslegen",
    ctaHref: "/register?plan=free",
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: "49 €",
    priceAnnual: "490 €",
    subtextMonthly: "490 € pro Jahr bei Jahreszahlung (ca. 41 €/Monat).",
    subtextAnnual: "Ca. 41 € pro Monat bei Jahreszahlung.",
    bestFor: "Einzelpraxis mit regelmäßigem Patientenfluss.",
    featuresLabel: "Enthalten",
    features: [
      "1 Workspace",
      "Bis 3–5 Team-Nutzer",
      "Unbegrenzte Einsendungen oder großzügiges Fair-Use",
      "Inbox inkl. ZIP-Download (sinnvolles Größenlimit)",
      "Aufgaben inkl. interne Aufgaben & Zuweisungen",
      "Terminlink + Task-E-Mails (bei SMTP-Einrichtung)",
      "Journal, Profil & öffentliche Praxis-Seite",
      "Einstellungen (Branding, Slug, Team …)",
      "E-Mail-Support (z. B. innerhalb von 48 h)",
    ],
    highlighted: false,
    ctaLabel: "Loslegen",
    ctaHref: "/register?plan=growth",
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: "129 €",
    priceAnnual: "1.290 €",
    subtextMonthly: "1.290 € pro Jahr bei Jahreszahlung (ca. 108 €/Monat).",
    subtextAnnual: "Ca. 108 € pro Monat bei Jahreszahlung.",
    bestFor: "Mehr Team, mehr Fälle, mehr Speicher.",
    featuresLabel: "Enthalten",
    features: [
      "Alles aus Growth",
      "Mehr Teamnutzer (z. B. 15–25)",
      "Höhere Limits für Speicher & Fotos pro Fall",
      "Priorisierter Support (z. B. 24 h werktags)",
      "Optional: Onboarding-Session (1×)",
      "Roadmap: Audit-Log & erweiterte Rollen",
    ],
    highlighted: false,
    ctaLabel: "Loslegen",
    ctaHref: "/register?plan=scale",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: "ab 399 €",
    priceAnnual: "ab 3.990 €",
    subtextMonthly: "Individuelle Konditionen — auch Jahrespakete.",
    subtextAnnual: "Preis auf Anfrage möglich.",
    bestFor: "Kliniken, Gruppenpraxen, besondere Compliance-Anforderungen.",
    featuresLabel: "Enthalten",
    features: [
      "Mehrere Workspaces / Standorte oder zentrale Verwaltung",
      "Unbegrenzte Nutzer nach Vereinbarung",
      "SLA & dedizierter Ansprechpartner",
      "AVV & EU-Hosting-Zusagen (nach Vereinbarung)",
      "SSO (Azure AD / Google) — nach Implementierung",
      "Custom Domain & erweiterte Sicherheit / Backups",
      "Schulungen & Migrationshilfe",
    ],
    highlighted: true,
    ctaLabel: "Vertrieb kontaktieren",
    ctaHref: `mailto:${SALES_EMAIL}?subject=SmileScan%20Enterprise`,
    ctaExternal: true,
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");

  return (
    <section
      className="w-full bg-[#0B0B0C] px-6 py-24 text-white"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-12 text-center">
          <h2
            id="pricing-heading"
            className="mb-8 text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-[3.5rem]"
          >
            Pakete für Ihre Praxis
          </h2>

          <div
            role="tablist"
            aria-label="Abrechnungszeitraum"
            className="inline-flex items-center gap-0 rounded-full bg-[#1A1A1B] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === "monthly"}
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "rounded-full px-6 py-2 text-[0.9375rem] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                billingPeriod === "monthly"
                  ? "bg-white text-black shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                  : "bg-transparent text-[#6B6B6B]"
              )}
            >
              Monatlich
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billingPeriod === "annual"}
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "rounded-full px-6 py-2 text-[0.9375rem] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                billingPeriod === "annual"
                  ? "bg-white text-black shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                  : "bg-transparent text-[#6B6B6B]"
              )}
            >
              Jährlich
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-4 xl:gap-8">
          {PLANS.map((plan) => {
            const isAnnual = billingPeriod === "annual";
            const mainPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const periodLabel = isAnnual ? "/ Jahr" : "/ Monat";
            const subtext = isAnnual
              ? plan.subtextAnnual
              : plan.subtextMonthly;

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-3xl p-8 transition-all duration-300",
                  plan.highlighted
                    ? "scale-[1.02] bg-[linear-gradient(135deg,#AFCBFF_0%,#E7CBA4_100%)] shadow-[0_8px_32px_rgba(175,203,255,0.2),0_0_64px_rgba(231,203,164,0.15)] xl:scale-105"
                    : "border border-white/[0.05] bg-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)]"
                )}
              >
                <div className="mb-6">
                  <div
                    className={cn(
                      "mb-3 text-[0.875rem] font-medium tracking-[0.02em]",
                      plan.highlighted
                        ? "text-black/60"
                        : "text-white/50"
                    )}
                  >
                    {plan.name}
                  </div>
                  <div className="mb-2 flex flex-wrap items-baseline gap-2">
                    <span
                      className={cn(
                        "text-[3.5rem] font-bold leading-none",
                        plan.highlighted ? "text-black" : "text-white"
                      )}
                    >
                      {mainPrice}
                    </span>
                    {plan.id !== "free" && (
                      <span
                        className={cn(
                          "text-[0.875rem] font-medium",
                          plan.highlighted
                            ? "text-black/50"
                            : "text-white/40"
                        )}
                      >
                        {periodLabel}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mb-1 text-[0.8125rem] leading-snug",
                      plan.highlighted
                        ? "text-black/50"
                        : "text-white/40"
                    )}
                  >
                    {subtext}
                  </p>
                  <p
                    className={cn(
                      "text-[0.8125rem] leading-snug",
                      plan.highlighted
                        ? "text-black/50"
                        : "text-white/40"
                    )}
                  >
                    {plan.bestFor}
                  </p>
                </div>

                <div
                  className={cn(
                    "mb-6 h-px",
                    plan.highlighted ? "bg-black/10" : "bg-white/[0.06]"
                  )}
                />

                <div className="mb-8">
                  <div
                    className={cn(
                      "mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.05em]",
                      plan.highlighted
                        ? "text-black/50"
                        : "text-white/50"
                    )}
                  >
                    {plan.featuresLabel}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            plan.highlighted
                              ? "text-black"
                              : "text-white"
                          )}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "text-[0.9375rem] leading-relaxed",
                            plan.highlighted
                              ? "text-black/80"
                              : "text-white/85"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.ctaExternal ? (
                  <a
                    href={plan.ctaHref}
                    className={cn(
                      "flex w-full items-center justify-center rounded-full px-6 py-3 text-[0.9375rem] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                      plan.highlighted
                        ? "bg-black text-white"
                        : "border border-white/10 bg-white/[0.08] text-white/90 hover:bg-white/12"
                    )}
                  >
                    {plan.ctaLabel}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      "flex w-full items-center justify-center rounded-full px-6 py-3 text-[0.9375rem] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                      plan.highlighted
                        ? "bg-black text-white hover:bg-black/90"
                        : "border border-white/10 bg-white/[0.08] text-white/90 hover:bg-white/12"
                    )}
                  >
                    {plan.ctaLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-white/45">
          Preise Beispiel / geschlossene Beta — unverbindlich. Leistungsumfang
          kann sich bis zum Launch ändern.
        </p>
      </div>
    </section>
  );
}
