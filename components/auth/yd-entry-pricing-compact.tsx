"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { REGISTER_PLANS, type RegisterPlanId } from "@/lib/auth/register-plans";
import { cn } from "@/lib/utils";

const PLAN_ORDER: RegisterPlanId[] = ["monthly", "halfyearly", "yearly"];

type YdEntryPricingCompactProps = {
  initialPlan: RegisterPlanId;
  inviteToken?: string;
  prefilledEmail?: string;
};

function buildRegisterHref(
  plan: RegisterPlanId,
  inviteToken: string,
  prefilledEmail: string
) {
  const p = new URLSearchParams();
  p.set("plan", plan);
  p.set("step", "1");
  if (inviteToken) p.set("invite", inviteToken);
  if (prefilledEmail) p.set("email", prefilledEmail);
  return `/register?${p.toString()}`;
}

/** Mobile / entry — calm Apple-like plan picker, minimal height. */
export function YdEntryPricingCompact({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdEntryPricingCompactProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<RegisterPlanId>(initialPlan);
  const active = REGISTER_PLANS[plan];

  return (
    <section className="yd-entry-pricing-compact" aria-labelledby="yd-entry-pricing-title">
      <p id="yd-entry-pricing-title" className="yd-entry-pricing-label">
        Praxislizenz
      </p>

      <div className="yd-entry-pricing-segments" role="tablist" aria-label="Abrechnungsrhythmus">
        {PLAN_ORDER.map((id) => {
          const p = REGISTER_PLANS[id];
          const selected = plan === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn("yd-entry-pricing-segment", selected && "yd-entry-pricing-segment--on")}
              onClick={() => setPlan(id)}
            >
              <span className="yd-entry-pricing-segment-label">{p.label}</span>
              {p.save ? (
                <span className="yd-entry-pricing-segment-save">−{p.save}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="yd-entry-pricing-summary">
        <p className="yd-entry-pricing-price">
          <span className="yd-entry-pricing-price-value">€{active.price}</span>
          <span className="yd-entry-pricing-price-unit"> / Monat</span>
        </p>
        <p className="yd-entry-pricing-hint">
          {plan !== "monthly" ? `€${active.total} pro Periode · ` : null}
          Einsendungen, Relay, Team — nach Prüfung freigeschaltet
        </p>
      </div>

      <button
        type="button"
        className="yd-clinical-cta-primary yd-entry-pricing-cta"
        onClick={() => router.push(buildRegisterHref(plan, inviteToken, prefilledEmail))}
      >
        Weiter zur Registrierung
      </button>

      <p className="yd-entry-pricing-foot">
        Relay: interne Kommunikation &amp; Routinen · Command AI leise im Hintergrund
      </p>
    </section>
  );
}
