import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayTaskCategory } from "@/lib/relay/relay-task-category";
import { resolveRelayTaskCategory } from "@/lib/relay/relay-task-category";

/** Praxisrollen für Relay — gleiche Struktur, rollenspezifische Inhalte. */
export type RelayPracticePersona =
  | "zahnarzt"
  | "rezeption"
  | "zfa"
  | "zmp"
  | "praxismanager";

export const RELAY_PERSONA_LABELS: Record<RelayPracticePersona, string> = {
  zahnarzt: "Zahnarzt",
  rezeption: "Rezeption",
  zfa: "ZFA",
  zmp: "ZMP",
  praxismanager: "Praxismanager",
};

/** Kategorien, die pro Persona in „Benötigt Ihre Aufmerksamkeit“ priorisiert werden. */
export const RELAY_PERSONA_FOCUS_CATEGORIES: Record<RelayPracticePersona, RelayTaskCategory[]> = {
  zahnarzt: ["clinical_decision", "aftercare", "recall", "patient_contact"],
  rezeption: ["patient_contact", "appointment"],
  zfa: ["aftercare", "patient_contact", "material", "appointment"],
  zmp: ["recall", "aftercare", "patient_contact"],
  praxismanager: ["practice_org", "admin", "clinical_decision", "recall"],
};

/**
 * Laufzeit: Workspace kennt nur doctor | team.
 * Team wird als ZFA modelliert, bis Profil-Rollen angebunden sind.
 */
export function resolveRelayPracticePersona(isDoctor: boolean): RelayPracticePersona {
  return isDoctor ? "zahnarzt" : "zfa";
}

export function relayPersonaLeadCopy(persona: RelayPracticePersona): string {
  switch (persona) {
    case "zahnarzt":
      return "Hier sehen Sie alles, worauf die Praxis gerade wartet — Freigaben, Entscheidungen und klinische Rückfragen.";
    case "rezeption":
      return "Hier sehen Sie alles, worauf die Praxis gerade wartet — Rückrufe, Termine und Patientenkommunikation.";
    case "zfa":
      return "Hier sehen Sie alles, worauf die Praxis gerade wartet — Nachsorge, Dokumentation und Fotoanforderungen.";
    case "zmp":
      return "Hier sehen Sie alles, worauf die Praxis gerade wartet — Recall, Prävention und Nachbetreuung.";
    case "praxismanager":
      return "Hier sehen Sie alles, worauf die Praxis gerade wartet — Organisation, Teamaufgaben und Freigaben.";
  }
}

export function taskCategoryMatchesPersonaFocus(
  task: MyTask,
  persona: RelayPracticePersona
): boolean {
  const category = resolveRelayTaskCategory(task);
  return RELAY_PERSONA_FOCUS_CATEGORIES[persona].includes(category);
}
