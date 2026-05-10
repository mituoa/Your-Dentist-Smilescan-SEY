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

export function isBlockingAuthError(error: string | null | undefined): boolean {
  if (!error) return false;
  return BLOCKING_SET.has(error);
}
