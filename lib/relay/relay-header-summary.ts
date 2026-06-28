import type { RelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayHeaderSummary = {
  lead: string;
  breakdown: string;
};

/** Eine ruhige Zeile für den Relay-Header — entscheidungsorientiert. */
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
  const patientCount = snapshot.patientWaiting.length;
  const teamworkCount = snapshot.teamwork.length;
  const todoCount = snapshot.practiceTasks.length;

  if (!snapshot.hasAnyWork) {
    return {
      lead: "Heute ist alles erledigt.",
      breakdown: "",
    };
  }

  if (attentionCount > 0) {
    return {
      lead:
        attentionCount === 1
          ? "Heute wartet 1 Freigabe auf Ihre Entscheidung."
          : `Heute warten ${attentionCount} Freigaben auf Ihre Entscheidung.`,
      breakdown: "",
    };
  }

  if (patientCount > 0) {
    return {
      lead:
        patientCount === 1
          ? "Heute wartet 1 Patientenanfrage."
          : `Heute warten ${patientCount} Patientenanfragen.`,
      breakdown: "",
    };
  }

  if (teamworkCount > 0) {
    return {
      lead:
        teamworkCount === 1
          ? "Heute gibt es 1 offenen Team-Punkt."
          : `Heute gibt es ${teamworkCount} offene Team-Punkte.`,
      breakdown: "",
    };
  }

  if (todoCount > 0) {
    return {
      lead:
        todoCount === 1
          ? "Heute steht 1 Praxisaufgabe an."
          : `Heute stehen ${todoCount} Praxisaufgaben an.`,
      breakdown: "",
    };
  }

  return {
    lead: "Heute ist alles erledigt.",
    breakdown: "",
  };
}
