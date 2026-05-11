/**
 * Reine Hilfsfunktionen für Inbox-`q` (ohne Server-Imports — nutzbar in Client und Server).
 */

/** Erster Wert aus `searchParams.q` (Next kann `string | string[]` liefern). */
function firstQValue(q: string | string[] | undefined): string | undefined {
  if (q === undefined) return undefined;
  return Array.isArray(q) ? q[0] : q;
}

/** Getrimmter Suchtext oder leerer String. */
export function inboxSearchQueryFromParam(q: string | string[] | undefined): string {
  const raw = firstQValue(q);
  if (raw === undefined) return "";
  return String(raw).trim();
}

/**
 * `true`, wenn `q` in der URL vorkommt, aber nach Trim keine echte Suche bleibt
 * (leer, nur Whitespace, leeres erstes Array-Element).
 */
export function shouldStripInboxSearchParamFromUrl(q: string | string[] | undefined): boolean {
  if (q === undefined) return false;
  return inboxSearchQueryFromParam(q).length === 0;
}
