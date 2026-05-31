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

/** Command AI — Beispielphrasen (Assist + Atlas). */
export const COMMAND_AI_EXAMPLES = [
  "Bereite die Antworten für offene Anfragen vor",
  "Neue Eingänge zusammenfassen",
  "Patient Müller Terminvorschlag senden",
] as const;

/** Schnellaktionen im Atlas-Cockpit. */
export const COMMAND_AI_QUICK_ACTIONS = [
  "Antwort vorbereiten",
  "Aufgabe erstellen",
  "Team informieren",
  "Eingang zusammenfassen",
] as const;

/** Vorbereitet durch Command — Zahnarzt gibt frei. */
export const COMMAND_AI_PREPARED = ["Entwürfe erstellt", "warten auf Freigabe"] as const;

export const COCKPIT_SECTIONS = {
  todayImportant: "Heute wichtig",
  patientCases: "Patientenanfragen",
  relay: "Team",
  tasks: "Aufgaben",
  activity: "Letzte Aktivitäten",
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
