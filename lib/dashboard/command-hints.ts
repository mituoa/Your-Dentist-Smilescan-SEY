import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

type BuildCommandHintsInput = {
  unseenCount: number | null;
  openTaskCount: number;
  relayUnread: number;
  reminderCount: number;
  routineCount: number;
};

/** Ruhige Command-AI-Hinweise aus dem operativen Lagebild — max. drei Zeilen. */
export function buildDashboardCommandHints(input: BuildCommandHintsInput): string[] {
  const hints: string[] = [];

  if (input.unseenCount !== null && input.unseenCount > 0) {
    hints.push(
      input.unseenCount === 1
        ? "Eine Einsendung wartet auf Sichtung im Eingang."
        : `${input.unseenCount} Einsendungen warten auf Sichtung im Eingang.`
    );
  }

  if (input.openTaskCount > 0) {
    hints.push(
      input.openTaskCount === 1
        ? "Eine offene Aufgabe — nächster Schritt in Aufgaben prüfen."
        : `${input.openTaskCount} offene Aufgaben — Reihenfolge in Aufgaben festlegen.`
    );
  }

  if (input.relayUnread > 0) {
    hints.push(
      input.relayUnread === 1
        ? "Eine ungelesene Nachricht in Relay am Fall."
        : `${input.relayUnread} ungelesene Relay-Nachrichten — Rückfragen zuerst klären.`
    );
  }

  if (input.reminderCount > 0) {
    hints.push(
      input.reminderCount === 1
        ? "Eine Erinnerung steht in den nächsten Tagen an."
        : `${input.reminderCount} Erinnerungen in den nächsten Tagen.`
    );
  }

  if (input.routineCount > 0 && hints.length < 3) {
    hints.push(
      input.routineCount === 1
        ? "Eine aktive Routine hält den Ablauf im Blick."
        : `${input.routineCount} aktive Routinen im Praxisrhythmus.`
    );
  }

  if (hints.length === 0) {
    return [COMMAND_AI_PUBLIC.whisper, COMMAND_AI_PUBLIC.benefitAssist];
  }

  return hints.slice(0, 3);
}
