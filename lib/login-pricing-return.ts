/** Session flag: after /register?from=pricing, return user to #pricing on /login (only explicit pricing CTAs set this). */
export const RETURN_PRICING_STORAGE_KEY = "smilescan-return-pricing-v1";

export function markReturnToPricingFlag(): void {
  try {
    sessionStorage.setItem(RETURN_PRICING_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearReturnToPricingFlag(): void {
  try {
    sessionStorage.removeItem(RETURN_PRICING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
