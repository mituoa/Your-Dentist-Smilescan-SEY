/** Erwartetes Format für `team_invitations.token` (kryptografisch, 32 Byte hex). */
export const INVITE_TOKEN_HEX64_RE = /^[a-f0-9]{64}$/i;

/** Max. Länge eines rohen `token`-Query-Werts (DoS-/Log-Schutz, Validierung erfolgt danach). */
export const INVITE_TOKEN_QUERY_MAX_LEN = 96;

export function clipInviteTokenQuery(raw: string | undefined | null): string {
  if (raw == null) return "";
  const t = String(raw).trim();
  if (!t) return "";
  return t.length > INVITE_TOKEN_QUERY_MAX_LEN ? t.slice(0, INVITE_TOKEN_QUERY_MAX_LEN) : t;
}

export function isInviteTokenFormat(token: string | null | undefined): boolean {
  return Boolean(token && INVITE_TOKEN_HEX64_RE.test(String(token).trim()));
}
