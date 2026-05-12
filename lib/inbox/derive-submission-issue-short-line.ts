/**
 * Erste sinnvolle Zeile aus Patienten-Notizen für Listen- und Kopfzeilen-Kurztext.
 * Überspringt gängige Anrede-/Briefkopf-Zeilen, damit kein Grußformular als „Anliegen“ erscheint.
 */
export function deriveSubmissionIssueShortLine(
  patientNotes: string | null,
  patientName: string | null,
  opts: { maxLen: number; emptyLabel: string }
): string {
  const { maxLen, emptyLabel } = opts;
  const raw = (patientNotes || "").trim();
  if (raw) {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const skipLine = (line: string) => {
      const head = line.replace(/[,;:]+$/, "").trim();
      return /^(sehr geehrte(\s+(damen und herren|damen|herren))?|liebe\s+damen und herren|guten tag|hallo)\b/i.test(
        head
      );
    };
    const meaningful = lines.filter((line) => !skipLine(line));
    const pick = meaningful[0] ?? lines[0] ?? "";
    const firstSentence = pick.split(".")[0]?.trim();
    if (firstSentence) {
      return firstSentence.length > maxLen
        ? `${firstSentence.slice(0, maxLen).trim()}…`
        : firstSentence;
    }
  }
  const n = (patientName || "").trim();
  if (n) return n.length > maxLen ? `${n.slice(0, maxLen).trim()}…` : n;
  return emptyLabel;
}
