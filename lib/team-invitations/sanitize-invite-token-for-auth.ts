/**
 * Team-Einladungs-Token wie in `app/(protected)/settings/actions.ts`
 * (`crypto.randomBytes(32).toString("hex")` → 64 Hex-Zeichen).
 * Verhindert beliebige Strings in Auth-URLs / `redirectTo`.
 */
export function sanitizeTeamInvitationTokenForAuth(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (t.length !== 64 || !/^[a-f0-9]{64}$/i.test(t)) return "";
  return t.toLowerCase();
}
