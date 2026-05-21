"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { REGISTER_PLANS, type RegisterPlanId } from "@/lib/auth/register-plans";
import { cn } from "@/lib/utils";

const PLAN_ORDER: RegisterPlanId[] = ["monthly", "halfyearly", "yearly"];

const INCLUDED = [
  "Geschützter Praxis-Workspace",
  "Einsendungen & Inbox",
  "Aufgaben (Relay)",
  "Öffentliches Praxisprofil",
  "Team-Zugänge nach Vereinbarung",
  "Verschlüsselte Datenübertragung",
] as const;

type YdRegisterPricingProps = {
  selectedPlan: RegisterPlanId;
  inviteToken?: string;
  prefilledEmail?: string;
  /** Anchor id for scroll targets (pricing page vs register). */
  sectionId?: string;
};

function buildRegisterHref(plan: RegisterPlanId, inviteToken: string, prefilledEmail: string, step?: string) {
  const p = new URLSearchParams();
  p.set("plan", plan);
  if (step) p.set("step", step);
  if (inviteToken) p.set("invite", inviteToken);
  if (prefilledEmail) p.set("email", prefilledEmail);
  const qs = p.toString();
  return `/register?${qs}`;
}

export function YdRegisterPricing({
  selectedPlan,
  inviteToken = "",
  prefilledEmail = "",
  sectionId = "pricing",
}: YdRegisterPricingProps) {
  const router = useRouter();

  return (
    <section
      id={sectionId}
      className="yd-register-pricing yd-auth-awaken-field scroll-mt-6"
      aria-labelledby="yd-register-pricing-title"
    >
      <div className="yd-register-pricing-intro">
        <p className="yd-register-pricing-eyebrow">Lizenz & Praxiszugang</p>
        <h2 id="yd-register-pricing-title" className="yd-register-pricing-title">
          Professionelle Infrastruktur für Ihre Praxis
        </h2>
        <p className="yd-register-pricing-subtitle">
          Wählen Sie den Abrechnungsrhythmus. Alle Optionen umfassen denselben geschützten
          Praxisbereich — transparent und ohne Marketing-Tricks.
        </p>
      </div>

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
                  {plan.save ? (
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
                  className={active ? "yd-auth-btn-primary w-full" : "yd-auth-btn-secondary w-full"}
                  onClick={() => router.push(buildRegisterHref(id, inviteToken, prefilledEmail, "1"))}
                >
                  {active ? "Mit diesem Plan registrieren" : "Plan wählen"}
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
    </section>
  );
}
