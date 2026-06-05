export type CareerTimelineEntry = {
  period: string | null;
  title: string;
};

const PERIOD_PREFIX =
  /^(\d{4}\s*[–-]\s*(?:\d{4}|heute|n\.?\s*U\.?)?|\d{4}\s*[–-])\s*[:\.]?\s*(.+)$/i;

/** Parst eine Werdegangs-Zeile in optionale Periode + Titel (für Timeline-Darstellung). */
export function parseCareerTimelineLine(line: string): CareerTimelineEntry {
  const trimmed = line.trim();
  if (!trimmed) return { period: null, title: "" };

  const match = trimmed.match(PERIOD_PREFIX);
  if (match) {
    const period = match[1]!.replace(/\s+/g, " ").trim();
    const title = match[2]!.trim();
    if (title) return { period, title };
  }

  return { period: null, title: trimmed };
}
