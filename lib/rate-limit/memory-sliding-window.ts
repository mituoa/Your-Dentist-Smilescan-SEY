/**
 * Einfaches festes Fenster pro Schlüssel (z. B. Client-IP).
 * Bei mehreren Serverless-Instanzen nur best effort pro Instanz — zusätzliche Keys (E-Mail, Route)
 * begrenzen Missbrauch im Code; für globale Deckung Edge/WAF ergänzen.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function allowSlidingWindowRequest(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || now > row.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= max) return false;
  row.count += 1;
  return true;
}
