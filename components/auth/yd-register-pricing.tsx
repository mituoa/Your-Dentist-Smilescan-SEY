"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { REGISTER_PLANS, type RegisterPlanId } from "@/lib/auth/register-plans";
import { AUTH_ACCESS_COPY } from "@/lib/marketing/auth-access-copy";
import { cn } from "@/lib/utils";

const PLAN_ORDER: RegisterPlanId[] = ["monthly", "halfyearly", "yearly"];

const INCLUDED = [
  "Geschützter Praxis-Workspace",
  "Tracker: strukturierter Patienteneingang",
  "Relay: Nachrichten, Gruppen, Routinen, Erinnerungen",
  "Command AI: Diktat, Entwürfe & Schritte im Alltag",
  "Öffentliches Praxisprofil & Team",
  "Verschlüsselte Datenübertragung",
] as const;

type YdRegisterPricingProps = {
  selectedPlan: RegisterPlanId;
  inviteToken?: string;
  prefilledEmail?: string;
  /** Anchor id for scroll targets (pricing page vs register). */
  sectionId?: string;
  /** compact = calmer, lower height (entry + desktop pricing stage) */
  /** access = Praxiszugang (no discount badges, infrastructure tone) */
  variant?: "full" | "compact" | "access";
  /** Inside YdPublicPricingStage — no duplicate intro, no outer section id. */
  embedded?: boolean;
  /** Öffentliche Landing — einheitliche CTA-Texte ohne „registrieren“. */
  planCta?: (planId: RegisterPlanId) => string;
};

function buildRegisterHref(plan: RegisterPlanId, inviteToken: string, prefilledEmail: string) {
  const p = new URLSearchParams();
  p.set("plan", plan);
  p.set("step", "1");
  if (inviteToken) p.set("invite", inviteToken);
  if (prefilledEmail) p.set("email", prefilledEmail);
  return `/register?${p.toString()}`;
}

export function YdRegisterPricing({
  selectedPlan,
  inviteToken = "",
  prefilledEmail = "",
  sectionId = "pricing",
  variant = "full",
  embedded = false,
  planCta,
}: YdRegisterPricingProps) {
  const router = useRouter();
  const compact = variant === "compact";
  const access = variant === "access";
  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      {...(!embedded ? { id: sectionId } : {})}
      className={cn(
        "yd-register-pricing yd-auth-awaken-field",
        !embedded && "scroll-mt-6",
        compact && "yd-register-pricing--compact",
        access && "yd-register-pricing--access",
        embedded && "yd-register-pricing--embedded"
      )}
      {...(!embedded ? { "aria-labelledby": "yd-register-pricing-title" } : {})}
    >
      {!embedded ? (
        <div className="yd-register-pricing-intro">
          <p className="yd-register-pricing-eyebrow">
            {access ? "Zugangsmodell" : "Praxislizenz"}
          </p>
          <h2 id="yd-register-pricing-title" className="yd-register-pricing-title">
            {access
              ? "Abrechnungsrhythmus"
              : compact
                ? "Rhythmus wählen"
                : "Abrechnungsrhythmus für Ihren Praxisbereich"}
          </h2>
          <p className="yd-register-pricing-subtitle">
            {access
              ? "Derselbe geschützte Praxisbereich — Monatlich, halbjährlich oder jährlich. Fokus auf planbare Infrastruktur, nicht auf Tarifvergleich."
              : compact
                ? "Derselbe geschützte Praxisbereich — nur der Abrechnungsrhythmus unterscheidet sich."
                : "Alle Optionen öffnen denselben geschützten Praxisbereich — ruhig, vollständig, ohne versteckte Stufen. Nur der Abrechnungsrhythmus unterscheidet sich."}
          </p>
        </div>
      ) : null}

      <div className="yd-register-pricing-grid" role="list">
        {PLAN_ORDER.map((id) => {
          const plan = REGISTER_PLANS[id];
          const active = selectedPlan === id;
          return (
            <article
              key={id}
              role="listitem"
              className={cn("yd-register-plan-card", active && "yd-register-plan-card--selected")}
            >
              <div className="yd-register-plan-card-inner">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="yd-register-plan-name">{plan.label}</h3>
                    <p className="yd-register-plan-billing">{plan.billing}</p>
                  </div>
                  {plan.save && !access ? (
                    <span className="yd-register-plan-save" aria-label={`${plan.save} Ersparnis`}>
                      −{plan.save}
                    </span>
                  ) : null}
                </div>
                <p className="yd-register-plan-price">
                  <span className="yd-register-plan-price-value">€{plan.price}</span>
                  <span className="yd-register-plan-price-unit"> / Monat</span>
                </p>
                {id !== "monthly" ? (
                  <p className="yd-register-plan-total">Gesamt €{plan.total} pro Periode</p>
                ) : (
                  <p className="yd-register-plan-total">Monatliche Abrechnung</p>
                )}
                <p className="yd-register-plan-desc">{plan.description}</p>
                <button
                  type="button"
                  className={cn(
                    "yd-os-btn w-full",
                    active ? "yd-os-btn--primary" : "yd-os-btn--ghost"
                  )}
                  onClick={() => router.push(buildRegisterHref(id, inviteToken, prefilledEmail))}
                >
                  {access && planCta
                    ? planCta(id)
                    : access
                      ? active
                        ? AUTH_ACCESS_COPY.pricingPlanCtaActive
                        : AUTH_ACCESS_COPY.pricingPlanCtaSelect
                      : active
                        ? "Mit diesem Plan registrieren"
                        : "Plan wählen"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="yd-register-pricing-includes">
        <p className="yd-register-pricing-includes-title">Im Praxisbereich enthalten</p>
        <ul className="yd-register-pricing-includes-list">
          {INCLUDED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="yd-register-approval-note" role="note">
        <p className="yd-register-approval-note-title">Freischaltung nach Prüfung</p>
        <p className="yd-register-approval-note-body">
          Nach der Registrierung prüfen wir Ihre Angaben und ggf. hochgeladene Unterlagen. Sie
          erhalten Zugang, sobald Ihr Praxis-Workspace freigeschaltet ist — ruhig und nachvollziehbar
          per E-Mail.
        </p>
      </div>

      <p className="yd-register-pricing-enterprise">
        Größere Einrichtungen oder mehrere Standorte?{" "}
        <Link href="/impressum" className="yd-auth-link">
          Kontakt aufnehmen
        </Link>
      </p>
    </Wrapper>
  );
}
