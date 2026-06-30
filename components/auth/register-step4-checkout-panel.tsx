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
  skipPaymentAtSignup = false,
  disabled = false,
}: RegisterStep4CheckoutPanelProps) {
  const activePlan = REGISTER_PLANS[selectedPlan];

  return (
    <div className="yd-reg-checkout">
      <section className="yd-reg-checkout__section" aria-labelledby="reg-checkout-plan-heading">
        <div className="yd-reg-checkout__section-head">
          <h4 id="reg-checkout-plan-heading" className="yd-reg-checkout__kicker">
            Abrechnungsintervall
          </h4>
          <p className="yd-reg-checkout__lead">
            Wählen Sie den Rhythmus für Ihren geschützten Praxiszugang — jederzeit nach Freischaltung
            anpassbar.
          </p>
        </div>

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
                <span className="yd-reg-checkout__plan-desc">{plan.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="yd-reg-checkout__summary" aria-label="Auswahl">
        <div className="yd-reg-checkout__summary-row">
          <div>
            <p className="yd-reg-checkout__summary-title">Praxiszugang</p>
            <p className="yd-reg-checkout__summary-meta">{activePlan.label}</p>
          </div>
          <div className="yd-reg-checkout__summary-price">
            <span className="yd-reg-checkout__summary-amount">{activePlan.price} €</span>
            <span className="yd-reg-checkout__summary-unit">/ Monat</span>
          </div>
        </div>
        {selectedPlan !== "monthly" ? (
          <p className="yd-reg-checkout__summary-total">{formatTotalLabel(selectedPlan)}</p>
        ) : null}
        <ul className="yd-reg-checkout__trust" role="list">
          <li>Keine Abbuchung vor Freischaltung</li>
          <li>Prüfung Ihrer Unterlagen innerhalb von 24 Stunden</li>
          {!skipPaymentAtSignup ? (
            <li>
              {paymentMethod === "invoice"
                ? "Rechnung nach Freischaltung — kein Online-Checkout"
                : "Zahlung wird nach Freischaltung im sicheren Checkout abgeschlossen"}
            </li>
          ) : null}
        </ul>
      </section>

      <section className="yd-reg-checkout__section" aria-labelledby="reg-checkout-pay-heading">
        <div className="yd-reg-checkout__section-head">
          <h4 id="reg-checkout-pay-heading" className="yd-reg-checkout__kicker">
            Zahlungsweise
          </h4>
          <p className="yd-reg-checkout__lead">
            {skipPaymentAtSignup
              ? "Ihre Zahlungsdaten werden nach Freischaltung ergänzt."
              : "Wählen Sie, wie Ihr Praxiszugang abgerechnet werden soll."}
          </p>
        </div>
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
