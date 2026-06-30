/**
 * Ruhige Nutzer-Copy, wenn eine Server Action im Client **wirft** (Netzwerk, Abbruch, unerwarteter Fehler).
 * Rohe `Error.message` / Next-Digests gehören **nicht** in die UI — u. a. `/create-case` (Punkt 8), Task-Detail.
 */
export function taskMutationClientFailureMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return "Die Verbindung wurde unterbrochen. Bitte prüfen Sie die Netzwerkverbindung und versuchen Sie es erneut.";
  }
  if (
    /failed to find server action|server action|digest/i.test(raw) ||
    /An error occurred in the Server Components render/i.test(raw)
  ) {
    return "Die Speicherung ist momentan nicht möglich. Bitte laden Sie die Seite neu und versuchen Sie es erneut.";
  }
  return "Die Aktion konnte gerade nicht ausgeführt werden. Bitte versuchen Sie es erneut.";
}
