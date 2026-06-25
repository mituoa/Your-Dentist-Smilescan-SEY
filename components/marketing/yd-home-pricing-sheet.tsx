"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import {
  getPublicPricingPlanCta,
  PUBLIC_SITE_PRICING,
} from "@/lib/marketing/public-site-ia";

type YdHomePricingSheetProps = {
  open: boolean;
  onClose: () => void;
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

export function YdHomePricingSheet({
  open,
  onClose,
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomePricingSheetProps) {
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const selectedPlan = coerceRegisterPlan(initialPlan) as RegisterPlanId;

  React.useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div
      className="yd-home-pricing-sheet-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yd-home-pricing-sheet-title"
    >
      <button
        type="button"
        className="yd-login-pricing-sheet-backdrop"
        aria-label="Schließen"
        onClick={onClose}
      />
      <div className="yd-login-pricing-sheet yd-home-pricing-sheet">
        <div className="yd-login-pricing-sheet-handle" aria-hidden />
        <header className="yd-home-pricing-sheet-head">
          <p className="yd-home-pricing-sheet-eyebrow">{PUBLIC_SITE_PRICING.eyebrow}</p>
          <h2 id="yd-home-pricing-sheet-title" className="yd-home-pricing-sheet-title">
            {PUBLIC_SITE_PRICING.title}
          </h2>
        </header>
        <YdRegisterPricing
          selectedPlan={selectedPlan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          variant="access"
          embedded
          planCta={getPublicPricingPlanCta}
        />
        <button type="button" className="yd-login-pricing-sheet-dismiss" onClick={onClose}>
          Schließen
        </button>
      </div>
    </div>,
    portalTarget
  );
}
