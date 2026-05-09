import "server-only";

/** Wenn true: zweiter Button „Ohne Zahlung (Demo)“ auf /register erlaubt, Stripe-Checkout wird übersprungen. */
export function isRegistrationDemoMode(): boolean {
  const v = process.env.REGISTRATION_DEMO_MODE?.trim().toLowerCase();
  return v === "true" || v === "1";
}
