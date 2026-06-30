"use client";

import { Check } from "lucide-react";

import {
  RegisterStep4PaymentSetup,
  type RegisterStep4PaymentFields,
  type RegisterStep4PaymentMethod,
} from "@/components/auth/register-step4-payment-setup";
import { REGISTER_PLANS, type RegisterPlanId } from "@/lib/auth/register-plans";
import { cn } from "@/lib/utils";

type RegisterStep4CheckoutPanelProps = {
  selectedPlan: RegisterPlanId;
  onPlanChange: (plan: RegisterPlanId) => void;
  paymentMethod: RegisterStep4PaymentMethod;
  onPaymentMethodChange: (method: RegisterStep4PaymentMethod) => void;
  paymentFields: RegisterStep4PaymentFields;
  onPaymentFieldChange: (field: keyof RegisterStep4PaymentFields, value: string) => void;
  skipPaymentAtSignup?: boolean;
  disabled?: boolean;
};

const PLAN_ORDER: RegisterPlanId[] = ["monthly", "halfyearly", "yearly"];

function formatTotalLabel(planId: RegisterPlanId): string {
  const plan = REGISTER_PLANS[planId];
  if (planId === "monthly") return `${plan.total} € pro Monat`;
  if (planId === "halfyearly") return `${plan.total} € alle 6 Monate`;
  return `${plan.total} € pro Jahr`;
}

export function RegisterStep4CheckoutPanel({
  selectedPlan,
  onPlanChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentFields,
  onPaymentFieldChange,
  disabled = false,
}: RegisterStep4CheckoutPanelProps) {
  return (
    <div className="yd-reg-checkout">
      <section className="yd-reg-checkout__section" aria-labelledby="reg-checkout-plan-heading">
        <h4 id="reg-checkout-plan-heading" className="yd-reg-checkout__kicker">
          Abrechnungsintervall
        </h4>

        <div className="yd-reg-checkout__plans" role="radiogroup" aria-label="Abrechnungsintervall">
          {PLAN_ORDER.map((key) => {
            const plan = REGISTER_PLANS[key];
            const active = selectedPlan === key;
            const recommended = key === "yearly";

            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => onPlanChange(key)}
                className={cn(
                  "yd-reg-checkout__plan",
                  active && "yd-reg-checkout__plan--active",
                  recommended && "yd-reg-checkout__plan--recommended"
                )}
              >
                <span className="yd-reg-checkout__plan-top">
                  <span className="yd-reg-checkout__plan-labels">
                    <span className="yd-reg-checkout__plan-name">{plan.label}</span>
                    {recommended ? (
                      <span className="yd-reg-checkout__plan-badge">Empfohlen</span>
                    ) : plan.save ? (
                      <span className="yd-reg-checkout__plan-badge yd-reg-checkout__plan-badge--save">
                        −{plan.save}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "yd-reg-checkout__plan-check",
                      active && "yd-reg-checkout__plan-check--active"
                    )}
                    aria-hidden
                  >
                    {active ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : null}
                  </span>
                </span>
                <span className="yd-reg-checkout__plan-price">
                  {plan.price} €
                  <span className="yd-reg-checkout__plan-price-unit">/ Monat</span>
                </span>
                <span className="yd-reg-checkout__plan-billing">{plan.billing}</span>
                {key !== "monthly" ? (
                  <span className="yd-reg-checkout__plan-total">{formatTotalLabel(key)}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="yd-reg-checkout__note">Abbuchung erst nach Freischaltung Ihrer Praxis.</p>
      </section>

      <section className="yd-reg-checkout__section" aria-labelledby="reg-checkout-pay-heading">
        <h4 id="reg-checkout-pay-heading" className="yd-reg-checkout__kicker">
          Zahlungsweise
        </h4>
        <RegisterStep4PaymentSetup
          method={paymentMethod}
          onMethodChange={onPaymentMethodChange}
          selectedPlan={selectedPlan}
          fields={paymentFields}
          onFieldChange={onPaymentFieldChange}
          disabled={disabled}
          variant="checkout"
        />
      </section>
    </div>
  );
}
