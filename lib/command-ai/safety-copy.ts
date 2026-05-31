/**
 * Medical-trust phrasing for Command AI surfaces.
 * Never implies confirmed diagnosis — supports workflow only.
 */

export const COMMAND_AI_DISCLAIMER =
  "Vorschläge basieren auf verfügbaren Angaben — klinische Bestätigung durch Sie erforderlich.";

export const COMMAND_AI_NO_AUTO_SEND =
  "Nichts wird automatisch versendet. Sie prüfen und geben frei.";

export function frameSuggestion(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "Basierend auf verfügbaren Informationen ist ein nächster Schritt vorbereitet.";
  if (/^basierend auf|^vorgeschlagener|^empfohlener/i.test(trimmed)) return trimmed;
  return `Basierend auf verfügbaren Informationen: ${trimmed}`;
}

export function frameNextStep(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "Nächster Schritt zur klinischen Bestätigung vorbereitet.";
  if (/^empfohlener|^vorgeschlagener/i.test(trimmed)) return trimmed;
  return `Empfohlener nächster Schritt: ${trimmed}`;
}

export function frameSituation(notes: string | null, patientName: string): string {
  const name = patientName.trim() || "Patient";
  if (!notes?.trim()) {
    return `${name} hat eine Einsendung übermittelt. Details sind in der Fallakte hinterlegt.`;
  }
  const excerpt = notes.trim().slice(0, 220);
  return `Patient ${name} beschreibt: „${excerpt}${notes.length > 220 ? "…" : ""}"`;
}
