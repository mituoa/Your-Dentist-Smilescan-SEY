import type { RelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayHeaderSummary = {
  lead: string;
  breakdown: string;
};

/** Arbeitsübersicht für den integrierten Relay-Header (wie Tracker). */
export function buildRelayHeaderSummary(
  snapshot: Pick<
    RelayPracticeSnapshot,
    | "attention"
    | "teamwork"
    | "patientWaiting"
    | "routines"
    | "practiceTasks"
    | "hasAnyWork"
  >
): RelayHeaderSummary {
  const attentionCount = snapshot.attention.length;
  const teamworkCount = snapshot.teamwork.length;
  const patientCount = snapshot.patientWaiting.length;
  const routineCount = snapshot.routines.length;
  const todoCount = snapshot.practiceTasks.length;

  if (!snapshot.hasAnyWork) {
    return {
      lead: "Alles erledigt — keine offene Praxisarbeit.",
      breakdown: "Entscheidungen, Patienten und Teamaufgaben erscheinen hier automatisch.",
    };
  }

  const leadParts: string[] = [];

  if (attentionCount > 0) {
    leadParts.push(
      attentionCount === 1
        ? "1 Vorgang wartet auf Ihre Entscheidung"
        : `${attentionCount} Vorgänge warten auf Ihre Entscheidung`
    );
  } else if (patientCount > 0) {
    leadParts.push(
      patientCount === 1 ? "1 Patient wartet" : `${patientCount} Patienten warten`
    );
  } else if (teamworkCount > 0) {
    leadParts.push(
      teamworkCount === 1 ? "1 Blockade im Team" : `${teamworkCount} Blockaden im Team`
    );
  } else if (todoCount > 0) {
    leadParts.push(
      todoCount === 1 ? "1 Aufgabe zu erledigen" : `${todoCount} Aufgaben zu erledigen`
    );
  } else if (routineCount > 0) {
    leadParts.push(
      routineCount === 1 ? "1 Routine offen" : `${routineCount} Routinen offen`
    );
  }

  const lead = leadParts[0] ? `${leadParts[0]}.` : "Offene Praxisarbeit.";

  const breakdownParts: string[] = [];

  if (attentionCount > 0 && patientCount > 0) {
    breakdownParts.push(
      patientCount === 1 ? "1 Patient wartet" : `${patientCount} Patienten warten`
    );
  }
  if (teamworkCount > 0 && attentionCount > 0) {
    breakdownParts.push(
      teamworkCount === 1 ? "1 Blockade im Team" : `${teamworkCount} Blockaden im Team`
    );
  }
  if (todoCount > 0 && attentionCount > 0) {
    breakdownParts.push(
      todoCount === 1 ? "1 Aufgabe zu erledigen" : `${todoCount} Aufgaben zu erledigen`
    );
  }

  return {
    lead,
    breakdown:
      breakdownParts.length > 0
        ? breakdownParts.map((p) => (p.endsWith(".") ? p : `${p}.`)).join(" ")
        : "",
  };
}
