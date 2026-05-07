/**
 * Emergency demo bypass — Edge-safe (no "server-only").
 * Set AUTH_RELAX_MODE=true on Netlify only while testing; remove for production.
 */
export function isAuthRelaxMode(): boolean {
  const v = process.env.AUTH_RELAX_MODE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}
