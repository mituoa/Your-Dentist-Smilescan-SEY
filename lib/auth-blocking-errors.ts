/**
 * Blockiert Auto-Redirect von Auth-Routen (/login, /register), wenn gesetzt — muss mit
 * `app/(auth)/login/page.tsx` und `proxy.ts` übereinstimmen.
 */
export const BLOCKING_AUTH_ERROR_CODES = [
  "workspace_missing",
  "account_pending_approval",
  "email_not_confirmed",
] as const;

const BLOCKING_SET = new Set<string>(BLOCKING_AUTH_ERROR_CODES);

/** Längster Code in {@link BLOCKING_AUTH_ERROR_CODES} — schützt Middleware vor extrem langen `error`-Parametern. */
const MAX_BLOCKING_ERROR_KEY_LEN = 64;

export function isBlockingAuthError(error: string | null | undefined): boolean {
  if (!error) return false;
  const t = error.trim();
  if (!t) return false;
  const key =
    t.length > MAX_BLOCKING_ERROR_KEY_LEN
      ? t.slice(0, MAX_BLOCKING_ERROR_KEY_LEN).toLowerCase()
      : t.toLowerCase();
  return BLOCKING_SET.has(key);
}
