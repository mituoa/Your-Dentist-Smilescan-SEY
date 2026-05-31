import type { CommandIntent, CommandIntentKind, CommandWorkspaceHints } from "./types";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function findPatientInText(
  text: string,
  hints: CommandWorkspaceHints | null
): { name: string; submissionId: string } | null {
  if (!hints?.patients.length) return null;
  const t = normalize(text);
  for (const p of hints.patients) {
    const name = p.name.trim();
    if (!name) continue;
    const parts = name.toLowerCase().split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts.every((part) => t.includes(part))) {
      return { name, submissionId: p.submissionId };
    }
    if (t.includes(name.toLowerCase())) {
      return { name, submissionId: p.submissionId };
    }
  }
  return null;
}

function detectKind(text: string): CommandIntentKind {
  const t = normalize(text);
  if (!t) return "unknown";
  if (/(zusammenfass|überblick|übersicht).*(neue|eingang|patient)/.test(t)) return "summarize_inbox";
  if (/was ist heute wichtig|heute wichtig|tagesüberblick|praxistag/.test(t)) return "summarize_day";
  if (/(recall|erinner|implantat)/.test(t)) return "recall_patients";
  if (/(aufgabe|task|team).*(erstell|anlegen|neu)/.test(t)) return "create_task";
  if (/(schreib|send|termin|link|nachricht|mail|rückmeld)/.test(t)) return "patient_message";
  if (/(inbox|tracker|relay|dashboard|einstellung)/.test(t)) return "navigate";
  return "unknown";
}

/** Rule-based intent layer — swappable for LLM later, same output contract. */
export function resolveCommandIntent(
  rawText: string,
  hints: CommandWorkspaceHints | null
): CommandIntent {
  const text = rawText.trim();
  const kind = detectKind(text);
  const patient = findPatientInText(text, hints);

  let confidence: CommandIntent["confidence"] = "low";
  if (kind === "summarize_day" || kind === "summarize_inbox") confidence = "high";
  else if (patient && kind === "patient_message") confidence = "high";
  else if (patient) confidence = "medium";
  else if (kind !== "unknown") confidence = "medium";

  return {
    kind,
    rawText: text,
    patientName: patient?.name ?? null,
    submissionId: patient?.submissionId ?? null,
    confidence,
  };
}
