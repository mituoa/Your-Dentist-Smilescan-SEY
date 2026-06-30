import type { DashboardEditorialHeader } from "@/lib/dashboard/dashboard-header-summary";
import type { RelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayHeaderSummary = {
  lead: string;
  breakdown: string;
  editorial: DashboardEditorialHeader;
};

function toRelayEditorial(lead: string, breakdown: string): DashboardEditorialHeader {
  const statusPrimary = lead.replace(/^Heute /, "");
  return {
    statusTitle: "",
    statusPrimary,
    statusSecondary: breakdown || undefined,
    metricsLine: "",
  };
}

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
    const lead = "Heute ist alles erledigt.";
    return {
      lead,
      breakdown: "",
      editorial: toRelayEditorial(lead, ""),
    };
  }

  if (attentionCount > 0) {
    const lead =
      attentionCount === 1
        ? "Heute wartet 1 Freigabe auf Ihre Entscheidung."
        : `Heute warten ${attentionCount} Freigaben auf Ihre Entscheidung.`;
    return {
      lead,
      breakdown: "",
      editorial: toRelayEditorial(lead, ""),
    };
  }

  if (patientCount > 0) {
    const lead =
      patientCount === 1
        ? "Heute wartet 1 Patientenanfrage."
        : `Heute warten ${patientCount} Patientenanfragen.`;
    return {
      lead,
      breakdown: "",
      editorial: toRelayEditorial(lead, ""),
    };
  }

  if (teamworkCount > 0) {
    const lead =
      teamworkCount === 1
        ? "Heute gibt es 1 offenen Team-Punkt."
        : `Heute gibt es ${teamworkCount} offene Team-Punkte.`;
    return {
      lead,
      breakdown: "",
      editorial: toRelayEditorial(lead, ""),
    };
  }

  if (todoCount > 0) {
    const lead =
      todoCount === 1
        ? "Heute steht 1 Praxisaufgabe an."
        : `Heute stehen ${todoCount} Praxisaufgaben an.`;
    return {
      lead,
      breakdown: "",
      editorial: toRelayEditorial(lead, ""),
    };
  }

  const lead = "Heute ist alles erledigt.";
  return {
    lead,
    breakdown: "",
    editorial: toRelayEditorial(lead, ""),
  };
}
