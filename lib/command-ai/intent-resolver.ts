import { findPatientInCommandText } from "./patient-match";
import { parseMessageSignals } from "./message-signals";
import { parseTaskFromVoice } from "./task-intent";
import type { CommandIntent, CommandIntentKind, CommandWorkspaceHints } from "./types";

type ActiveCaseHint = {
  patientName: string | null;
  submissionId: string;
  concernLine?: string | null;
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function detectKind(text: string): CommandIntentKind {
  const t = normalize(text);
  if (!t) return "unknown";

  const hasPatientComms =
    /(schreib|send|schick|schicken|nachricht|mail|rückmeld).*(an|für|fur)/.test(t) ||
    /bitte\s+[a-zäöüß]{2,}\s+(schreib|schick|send)/.test(t);

  if (hasPatientComms) {
    return "patient_message";
  }

  if (/(erstell|anleg|mach|mache|memo|notier).*(aufgabe|task|reminder|erinnerung)/.test(t)) {
    return "create_task";
  }
  if (/(reminder|erinnerung).*(aufgabe|task|morgen|heute)/.test(t)) {
    return "create_task";
  }
  if (/(aufgabe|task).*(morgen|heute|rezeption|empfang|team)/.test(t)) {
    return "create_task";
  }
  if (/(rezeption|empfang).*(inform|durchgeb|weiterleit|schick|geben)/.test(t)) {
    return "create_task";
  }
  if (/(durchgeb|weiterleit).*(team|rezeption|empfang|zfa)/.test(t)) {
    return "create_task";
  }

  if (/(zusammenfass|überblick|übersicht).*(neue|eingang|patient)/.test(t)) {
    return "summarize_inbox";
  }
  if (/was ist heute wichtig|heute wichtig|tagesüberblick|praxistag/.test(t)) {
    return "summarize_day";
  }
  if (/(recall|erinner|pzr|kontrolle).*(patient|nachricht|vorbereit)/.test(t)) {
    return "recall_patients";
  }

  const taskParsed = parseTaskFromVoice(text);
  const looksLikeTaskOnly =
    /(aufgabe|task|reminder|erinnerung|memo|notiz|anruf|telefon|rückruf|diktat)/.test(t) &&
    !/(schreib|send|nachricht|mail|patienten).*(an|für|fur)/.test(t);
  if (looksLikeTaskOnly || (taskParsed.assigneeHint && /(aufgabe|task|reminder)/.test(t))) {
    return "create_task";
  }

  if (/(schreib|send|schick|schicken|termin|link|nachricht|mail|rückmeld|bitte).*(an|für|fur)/.test(t)) {
    return "patient_message";
  }
  if (/(schreib|send|schick|schicken|termin|link|nachricht|mail|rückmeld)/.test(t)) {
    return "patient_message";
  }
  if (/fasse|zusammenfass/.test(t)) return "patient_message";
  if (/(inbox|tracker|relay|dashboard|einstellung)/.test(t)) return "navigate";
  return "unknown";
}

/** Rule-based intent layer — swappable for LLM later, same output contract. */
export function resolveCommandIntent(
  rawText: string,
  hints: CommandWorkspaceHints | null,
  activeCase?: ActiveCaseHint | null
): CommandIntent {
  const text = rawText.trim();
  const kind = detectKind(text);
  const patient = findPatientInCommandText(text, hints, activeCase ?? null);
  const signals = parseMessageSignals(text);

  let confidence: CommandIntent["confidence"] = "low";
  if (kind === "summarize_day" || kind === "summarize_inbox") confidence = "high";
  else if (patient && kind === "patient_message") confidence = "high";
  else if (patient && kind === "create_task") confidence = "medium";
  else if (patient) confidence = "medium";
  else if (kind !== "unknown") confidence = "medium";

  return {
    kind,
    rawText: text,
    patientName: patient?.name ?? null,
    submissionId: patient?.submissionId ?? null,
    confidence,
    messageSignals: signals,
  };
}
