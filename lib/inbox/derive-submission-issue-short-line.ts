function extractMeaningfulConcernText(patientNotes: string | null): string | null {
  const raw = (patientNotes || "").trim();
  if (!raw) return null;

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
  const pick = meaningful.length > 0 ? meaningful.join(" ") : (lines[0] ?? "");
  if (!pick) return null;

  const sentences =
    pick.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (sentences.length >= 2) {
    return `${sentences[0]} ${sentences[1]}`.trim();
  }
  return pick.trim();
}

/**
 * Anliegen für Kopfzeile und Inbox — bis zu zwei Sätze, kein hartes Wort-Abschneiden (CSS line-clamp).
 */
export function deriveSubmissionConcernDisplay(
  patientNotes: string | null,
  patientName: string | null,
  emptyLabel: string
): string {
  const fromNotes = extractMeaningfulConcernText(patientNotes);
  if (fromNotes) return fromNotes;
  const n = (patientName || "").trim();
  if (n) return n;
  return emptyLabel;
}

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
  const display = extractMeaningfulConcernText(patientNotes);
  if (display) {
    const firstSentence = display.split(/(?<=[.!?])\s+/)[0]?.trim() ?? display;
    const line = firstSentence || display;
    return line.length > maxLen ? `${line.slice(0, maxLen).trim()}…` : line;
  }
  const n = (patientName || "").trim();
  if (n) return n.length > maxLen ? `${n.slice(0, maxLen).trim()}…` : n;
  return emptyLabel;
}
