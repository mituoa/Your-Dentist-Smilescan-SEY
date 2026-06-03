/** Relay / voice task intent — rule-based, swappable for LLM. */

export type ParsedTaskIntent = {
  assigneeHint: string | null;
  patientHint: string | null;
  dueHint: "today" | "tomorrow" | "this_week" | null;
  taskTitle: string;
  rawSummary: string;
  isReminder: boolean;
};

function extractDelegationAssignee(text: string): string | null {
  const trimmed = text.trim();
  const soll = trimmed.match(/^([A-Za-zÄÖÜ][\wäöüßÄÖÜ-]*)\s+soll\s+/i);
  if (soll?.[1]) return soll[1].toLowerCase();
  const bitte = trimmed.match(/^([A-Za-zÄÖÜ][\wäöüßÄÖÜ-]*)\s+bitte\s+/i);
  if (bitte?.[1]) return bitte[1].toLowerCase();
  return null;
}

/** Erkennung delegations-/aufgabenorientierter Befehle (ohne Patientennachricht). */
export function isCommandTaskCommand(rawText: string): boolean {
  const t = rawText.trim().toLowerCase();
  if (!t) return false;
  if (/(aufgabe|to-do|to do)\s*(erstellen|:)/.test(t)) return true;
  if (/\b[a-zäöüß]{2,}\s+soll\s+/.test(t) && !/(nachricht|mail|schreib|send).*(an|für|fur)\s+/.test(t)) {
    return true;
  }
  if (
    /\b[a-zäöüß]{2,}\s+bitte\s+/.test(t) &&
    /(zurückruf|rückruf|rueckruf|prüfen|versend|einbestellen|dvt|foto)/.test(t)
  ) {
    return true;
  }
  if (/(empfang|rezeption|assistenz|implant|team)\s+(soll|bitte)/.test(t)) return true;
  if (/(morgen|freitag|nächste woche).*(erinnern|prüfen|kontroll)/.test(t)) return true;
  if (/(erinnerung|reminder|memo)\b/.test(t) && /(morgen|freitag|woche|prüfen)/.test(t)) {
    return true;
  }
  return false;
}

export function parseTaskFromVoice(rawText: string): ParsedTaskIntent {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  let dueHint: ParsedTaskIntent["dueHint"] = null;
  if (/morgen/.test(lower)) dueHint = "tomorrow";
  else if (/heute/.test(lower)) dueHint = "today";
  else if (/diese woche/.test(lower)) dueHint = "this_week";
  else if (/nächste woche|nachste woche/.test(lower)) dueHint = "this_week";

  const delegationAssignee = extractDelegationAssignee(text);
  const assigneeMatch = lower.match(
    /\b(lisa|sarah|anna|team|empfang|rezeption|assistentin|assistent|zfa|dh)\b/i
  );
  let assigneeHint = delegationAssignee ?? assigneeMatch?.[1]?.toLowerCase() ?? null;
  if (/rezeption|empfang/.test(lower) && !assigneeHint) assigneeHint = "rezeption";

  const patientFromHints = text.match(
    /\b(?:patient|fall|implantat(?:planung)?|herr|frau)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i
  );
  const patientHint = patientFromHints?.[1]?.trim() ?? null;

  const isReminder =
    /(reminder|erinnerung|memo)/.test(lower) ||
    /(morgen|freitag|woche).*(erinnern|prüfen|kontroll)/.test(lower);

  let taskTitle = "Aufgabe vorbereiten";
  if (/\bdvt\b/.test(lower) && /(versend|schick|send|weiter)/.test(lower)) {
    taskTitle = "DVT versenden";
  } else if (/implantat|impla\b/.test(lower)) {
    taskTitle = /versend|schick|send|weiterleit/.test(lower)
      ? "Implantat-DV weiterleiten"
      : "Implantatfall prüfen";
  } else if (isReminder) taskTitle = "Erinnerung";
  else if (/erinnern|recall|kontrolle/.test(lower)) taskTitle = "Erinnerung vorbereiten";
  else if (/(einbestellen|termin)/.test(lower)) taskTitle = "Termin abstimmen";
  else if (/rückruf|anruf|telefon|zurückruf/.test(lower)) taskTitle = "Rückruf vorbereiten";
  else if (/(foto|bild).*(prüf|sicht)/.test(lower)) taskTitle = "Foto prüfen";
  else if (/rezeption|empfang/.test(lower) && /(inform|durchgeb|weiterleit|schick|einbestell)/.test(lower)) {
    taskTitle = "Hinweis an Empfang";
  }

  return {
    assigneeHint,
    patientHint,
    dueHint,
    taskTitle,
    rawSummary: text,
    isReminder,
  };
}

export function formatDueLabel(due: ParsedTaskIntent["dueHint"]): string {
  switch (due) {
    case "today":
      return "Heute";
    case "tomorrow":
      return "Morgen";
    case "this_week":
      return "Diese Woche";
    default:
      return "Offen";
  }
}
