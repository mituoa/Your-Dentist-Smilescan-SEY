import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";

type BuildCommandHintsInput = {
  unseenCount: number | null;
  openTaskCount: number;
  relayUnread: number;
  reminderCount: number;
  routineCount: number;
};

/** Desktop Command — max. drei kurze Zeilen. */
export function buildDashboardCommandHints(input: BuildCommandHintsInput): string[] {
  const hints: string[] = [];

  if (input.unseenCount !== null && input.unseenCount > 0) {
    hints.push(
      input.unseenCount === 1
        ? "1 Eingang wartet"
        : `${input.unseenCount} Eingänge warten`
    );
  }

  if (input.openTaskCount > 0) {
    hints.push(
      input.openTaskCount === 1 ? "1 Aufgabe offen" : `${input.openTaskCount} Aufgaben offen`
    );
  }

  if (input.relayUnread > 0) {
    hints.push(
      input.relayUnread === 1
        ? "1 Nachricht offen"
        : `${input.relayUnread} Nachrichten offen`
    );
  }

  if (input.reminderCount > 0) {
    hints.push(
      input.reminderCount === 1 ? "1 Erinnerung" : `${input.reminderCount} Erinnerungen`
    );
  }

  if (input.routineCount > 0 && hints.length < 3) {
    hints.push(
      input.routineCount === 1 ? "1 Routine aktiv" : `${input.routineCount} Routinen aktiv`
    );
  }

  if (hints.length === 0) {
    return [WORKSPACE_COPY.allCurrent];
  }

  return hints.slice(0, 3);
}
