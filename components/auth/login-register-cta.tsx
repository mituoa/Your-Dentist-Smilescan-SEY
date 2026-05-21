"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { YdEntryPricingCompact } from "@/components/auth/yd-entry-pricing-compact";
import { coerceRegisterPlan, type RegisterPlanId } from "@/lib/auth/register-plans";
import {
  AUTH_ACCESS_COPY,
  buildPricingEntryHref,
} from "@/lib/marketing/auth-access-copy";

type LoginRegisterCtaProps = {
  inviteToken?: string;
  prefilledEmail?: string;
};

/**
 * Login → Zugang: Desktop /pricing; Mobile ruhiges Sheet mit Rhythmuswahl.
 */
export function LoginRegisterCta({
  inviteToken = "",
  prefilledEmail = "",
}: LoginRegisterCtaProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const pricingHref = useMemo(
    () => buildPricingEntryHref(inviteToken, prefilledEmail),
    [inviteToken, prefilledEmail]
  );

  const initialPlan = coerceRegisterPlan("yearly") as RegisterPlanId;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sheetOpen || !isMobile) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [sheetOpen, isMobile]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen, closeSheet]);

  if (!isMobile) {
    return (
      <p
        className="yd-auth-register yd-auth-register--subtle yd-auth-awaken-field"
        style={{ ["--yd-auth-field-i" as string]: "5" }}
      >
        {AUTH_ACCESS_COPY.loginRegisterLead}{" "}
        <Link prefetch href={pricingHref} className="yd-auth-access-link">
          {AUTH_ACCESS_COPY.loginRegisterLink}
        </Link>
      </p>
    );
  }

  return (
    <>
      <p
        className="yd-auth-register yd-auth-register--subtle yd-auth-awaken-field"
        style={{ ["--yd-auth-field-i" as string]: "5" }}
      >
        {AUTH_ACCESS_COPY.loginRegisterLead}{" "}
        <button
          type="button"
          className="yd-auth-access-link yd-login-register-trigger"
          onClick={() => setSheetOpen(true)}
        >
          {AUTH_ACCESS_COPY.loginRegisterLink}
        </button>
      </p>

      {sheetOpen ? (
        <div className="yd-login-pricing-sheet-root" role="presentation">
          <button
            type="button"
            className="yd-login-pricing-sheet-backdrop"
            aria-label="Schließen"
            onClick={closeSheet}
          />
          <div
            className="yd-login-pricing-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="yd-login-pricing-sheet-title"
          >
            <div className="yd-login-pricing-sheet-handle" aria-hidden />
            <div className="yd-login-pricing-sheet-head">
              <h2 id="yd-login-pricing-sheet-title" className="yd-public-entry-title text-[1.125rem]">
                {AUTH_ACCESS_COPY.pricingPageTitle}
              </h2>
              <p className="yd-public-entry-lead mt-1 text-[0.875rem]">
                {AUTH_ACCESS_COPY.pricingPageLead}
              </p>
            </div>
            <YdEntryPricingCompact
              initialPlan={initialPlan}
              inviteToken={inviteToken}
              prefilledEmail={prefilledEmail}
            />
            <button type="button" className="yd-login-pricing-sheet-dismiss" onClick={closeSheet}>
              Schließen
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
