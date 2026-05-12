/**
 * Ruhige Nutzer-Copy, wenn eine Server Action im Client **wirft** (Netzwerk, Abbruch, unerwarteter Fehler).
 * Rohe `Error.message` / Next-Digests gehören **nicht** in die Task-Detail-UI (Punkt 8).
 */
export function taskMutationClientFailureMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "";
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return "Die Verbindung wurde unterbrochen. Bitte prüfen Sie die Netzwerkverbindung und versuchen Sie es erneut.";
  }
  return "Die Aktion konnte gerade nicht ausgeführt werden. Bitte versuchen Sie es erneut.";
}
