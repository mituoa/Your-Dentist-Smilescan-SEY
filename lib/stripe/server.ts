import "server-only";

import Stripe from "stripe";

export function isStripeCheckoutConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_PRICE_HALFYEARLY &&
      process.env.STRIPE_PRICE_YEARLY
  );
}

export function getStripeServer() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
}

export function getStripePriceIdForInterval(interval: "monthly" | "halfyearly" | "yearly") {
  const map: Record<typeof interval, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    halfyearly: process.env.STRIPE_PRICE_HALFYEARLY,
    yearly: process.env.STRIPE_PRICE_YEARLY,
  };
  const priceId = map[interval];
  if (!priceId) {
    throw new Error(`Missing Stripe price id for ${interval}`);
  }
  return priceId;
}

