/**
 * Produktarchitektur — Praxis-Betriebssystem (nicht Dashboard).
 *
 * Patient → Struktur → Command AI → Freigabe → Team → Antwort → Protokoll
 */

export const PRODUCT_WORKFLOW_STEPS = [
  "Eingang",
  "Struktur",
  "Command AI",
  "Freigabe",
  "Team",
  "Antwort",
  "Protokoll",
] as const;

/** Command AI — feste Vorschläge (Tracker + Atlas). */
export const COMMAND_AI_EXAMPLES = [
  "Patient Müller Terminvorschlag senden",
  "Lisa an Rückruf erinnern",
  "Neue Eingänge zusammenfassen",
  "Antwort vorbereiten",
  "Aufgabe für ZFA erstellen",
] as const;

/** Vorbereitet durch Command — sichtbar als Ergebniszeilen. */
export const COMMAND_AI_PREPARED = [
  "Antwort vorbereitet",
  "Aufgabe erstellt",
  "Team informiert",
] as const;

export const COCKPIT_SECTIONS = {
  todayImportant: "Heute wichtig",
  patientCases: "Patientenfälle",
  relay: "Relay",
  tasks: "Aufgaben",
  activity: "Aktivität",
  tracker: "Tracker",
} as const;

/** Journal — Praxisgedächtnis (Ziel-Events für automatisches Log). */
export const JOURNAL_EVENT_TYPES = [
  "patient_received",
  "response_prepared",
  "task_assigned",
  "team_informed",
  "case_closed",
] as const;

export function formatUrgencyLabel(urgency: string | null | undefined): string {
  if (!urgency?.trim()) return "Normal";
  const u = urgency.trim().toLowerCase();
  if (u === "high" || u === "dringend" || u === "urgent") return "Dringend";
  if (u === "low" || u === "niedrig") return "Niedrig";
  return "Normal";
}
