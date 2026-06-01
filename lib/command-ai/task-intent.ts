/** Relay / voice task intent — rule-based, swappable for LLM. */

export type ParsedTaskIntent = {
  assigneeHint: string | null;
  patientHint: string | null;
  dueHint: "today" | "tomorrow" | "this_week" | null;
  taskTitle: string;
  rawSummary: string;
  isReminder: boolean;
};

export function parseTaskFromVoice(rawText: string): ParsedTaskIntent {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  let dueHint: ParsedTaskIntent["dueHint"] = null;
  if (/morgen/.test(lower)) dueHint = "tomorrow";
  else if (/heute/.test(lower)) dueHint = "today";
  else if (/diese woche|woche/.test(lower)) dueHint = "this_week";

  const assigneeMatch = lower.match(
    /\b(lisa|team|empfang|rezeption|assistentin|assistent|zfa|dh)\b/i
  );
  let assigneeHint = assigneeMatch?.[1]?.toLowerCase() ?? null;
  if (/rezeption|empfang/.test(lower) && !assigneeHint) assigneeHint = "rezeption";

  const patientFromHints = text.match(
    /\b(?:patient|fall|implantat(?:planung)?|herr|frau)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i
  );
  const patientHint = patientFromHints?.[1]?.trim() ?? null;

  const isReminder = /(reminder|erinnerung|memo)/.test(lower);

  let taskTitle = "Aufgabe vorbereiten";
  if (/implantat|impla\b|\bdv\b/.test(lower)) {
    taskTitle = /versend|schick|send|weiterleit/.test(lower)
      ? "Implantat-DV an Rezeption weiterleiten"
      : "Implantatplanung vorbereiten";
  } else if (isReminder) taskTitle = "Erinnerung";
  else if (/erinnern|recall|kontrolle/.test(lower)) taskTitle = "Erinnerung vorbereiten";
  else if (/termin/.test(lower)) taskTitle = "Termin koordinieren";
  else if (/rückruf|anruf|telefon/.test(lower)) taskTitle = "Rückruf dokumentieren";
  else if (/rezeption|empfang/.test(lower) && /(inform|durchgeb|weiterleit|schick)/.test(lower)) {
    taskTitle = "Hinweis an Rezeption";
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
