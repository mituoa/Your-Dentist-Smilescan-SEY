import type { MessageSignals } from "./message-signals";

/** Antwort-Intent für persistente Patientenentwürfe (Command AI). */
export type CommandReplyIntent =
  | "offer_appointment"
  | "request_ruckfrage"
  | "watch_and_observe"
  | "request_photo"
  | "prepare_callback"
  | "general_reply";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Leitet aus Freitext + Signalen den Antwortentwurf-Typ ab.
 * Keine Diagnose — nur Organisations- und Kommunikationshilfe.
 */
export function resolveCommandReplyIntent(
  rawText: string,
  signals: MessageSignals
): CommandReplyIntent {
  const t = normalize(rawText);

  if (signals.wantsCallback) {
    return "prepare_callback";
  }

  if (
    signals.wantsWatch ||
    /(beobachten|beobachtung|abwarten|verlauf).*(lassen|empfehl|weiter)/.test(t) ||
    /(verschlechterung|schlechter).*(termin|melden|praxis)/.test(t)
  ) {
    return "watch_and_observe";
  }

  if (
    signals.wantsRuckfrage ||
    /(nach|wegen|bezüglich|zu).*(fieber|temperatur|schmerz|schwellung|medikament)/.test(t) ||
    /(fragen|nachfragen|rückfrage).*(fieber|temperatur|schmerz|schwellung)/.test(t) ||
    /bitte.*(fragen|nachfragen)/.test(t)
  ) {
    return "request_ruckfrage";
  }

  if (signals.wantsPhoto && !signals.wantsAppointment) {
    return "request_photo";
  }

  if (
    signals.wantsAppointment ||
    signals.wantsThisWeek ||
    /(termin|einbestellen|terminlink).*(anbieten|schicken|senden|geben)/.test(t) ||
    /(diese woche|noch diese woche).*(termin|kommen|einladen|einbestellen)/.test(t) ||
    /(patient|bitte).*(diese woche|kommen|einbestellen)/.test(t)
  ) {
    return "offer_appointment";
  }

  if (/(antwort|patientenantwort|rückmeldung).*(vorbereit|erstell|schreib)/.test(t)) {
    return "general_reply";
  }

  if (signals.wantsPhoto) {
    return "request_photo";
  }

  return "general_reply";
}

export function isSummarizeOnlyCommand(rawText: string): boolean {
  const t = normalize(rawText);
  return /fasse|zusammenfass/.test(t) && !/(schreib|send|schick|entwurf|termin|foto|rückruf)/.test(t);
}
