import "server-only";

import { isStripeCheckoutConfigured } from "@/lib/stripe/server";

/** Wenn true: zweiter Button „Ohne Zahlung (Demo)“ auf /register erlaubt, Stripe-Checkout wird übersprungen. */
export function isRegistrationDemoMode(): boolean {
  const v = process.env.REGISTRATION_DEMO_MODE?.trim().toLowerCase();
  return v === "true" || v === "1";
}

/**
 * Nach Registrierung: Stripe Checkout nur wenn `ENABLE_STRIPE_CHECKOUT_AT_SIGNUP=true` **und**
 * `STRIPE_SECRET_KEY` + alle `STRIPE_PRICE_*` gesetzt sind (`lib/stripe/server.ts`).
 */
export function shouldEnforceStripeCheckoutAtSignup(): boolean {
  const v = process.env.ENABLE_STRIPE_CHECKOUT_AT_SIGNUP?.trim().toLowerCase();
  if (v !== "true" && v !== "1") return false;
  return isStripeCheckoutConfigured();
}

/** When false, signup completes without Stripe redirect (default until explicitly enabled). */
export function skipPaymentAtSignup(): boolean {
  return !shouldEnforceStripeCheckoutAtSignup();
}
