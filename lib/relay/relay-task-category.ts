import type { MyTask } from "@/lib/queries/my-tasks";

/** Organisatorische Kategorien — UI-Mapping aus vorhandenen Feldern (kein DB-Enum). */
export type RelayTaskCategory =
  | "patient_contact"
  | "appointment"
  | "clinical_decision"
  | "aftercare"
  | "recall"
  | "lab"
  | "admin"
  | "material"
  | "practice_org"
  | "qm_routine";

export const RELAY_CATEGORY_LABELS: Record<RelayTaskCategory, string> = {
  patient_contact: "Patientenkontakt",
  appointment: "Terminorganisation",
  clinical_decision: "Ärztliche Entscheidung",
  aftercare: "Nachsorge",
  recall: "Recall",
  lab: "Labor",
  admin: "Verwaltung",
  material: "Material / Befund",
  practice_org: "Praxisorganisation",
  qm_routine: "QM / Routine",
};

const CONTEXT_MAP: Record<string, RelayTaskCategory> = {
  Patientenfall: "patient_contact",
  Praxisorganisation: "practice_org",
  "Material / Befund": "material",
  Sonstiges: "practice_org",
};

function parseBereichLine(description: string | null): RelayTaskCategory | null {
  if (!description?.trim()) return null;
  const match = description.match(/^Bereich:\s*(.+?)(?:\n|$)/m);
  if (!match?.[1]) return null;
  const label = match[1].trim();
  const entry = Object.entries(RELAY_CATEGORY_LABELS).find(([, l]) => l === label);
  return entry ? (entry[0] as RelayTaskCategory) : null;
}

function parseContextLine(description: string | null): RelayTaskCategory | null {
  if (!description?.trim()) return null;
  const bereich = parseBereichLine(description);
  if (bereich) return bereich;
  const match = description.match(/^Kontext:\s*(.+?)(?:\n|$)/m);
  if (!match?.[1]) return null;
  return CONTEXT_MAP[match[1].trim()] ?? null;
}

function categoryFromTitle(title: string): RelayTaskCategory | null {
  const t = title.toLowerCase();
  if (/rückruf|zurückruf|patient.*kontakt|nachfassen|foto.*nach|fotoanforderung/i.test(t)) {
    return "patient_contact";
  }
  if (/termin|abstimmung|verfügbarkeit/i.test(t)) return "appointment";
  if (/freigabe|prüfen|entscheid|arzt.*freigabe|freigeben/i.test(t)) return "clinical_decision";
  if (/nachsorge|verlauf|kontrolle|wiedervorlage/i.test(t)) return "aftercare";
  if (/recall|prophylaxe|erinnerung.*patient/i.test(t)) return "recall";
  if (/labor|befund.*labor|hkp/i.test(t)) return "lab";
  if (/rechnung|verwaltung|hkp|kosten|abrechnung/i.test(t)) return "admin";
  if (/material|befund|röntgen|bild/i.test(t)) return "material";
  if (/qm|hygiene|desinfektion|routine.*praxis/i.test(t)) return "qm_routine";
  return null;
}

export function resolveRelayTaskCategory(task: MyTask): RelayTaskCategory {
  if (task.recurrence_type !== "once") return "qm_routine";

  const fromContext = parseContextLine(task.description);
  if (fromContext) return fromContext;

  const fromTitle = categoryFromTitle(task.title);
  if (fromTitle) return fromTitle;

  if (task.recipient_type === "doctor_only" || task.status === "pending_review") {
    return "clinical_decision";
  }

  if (task.submission_id) return "patient_contact";

  return "practice_org";
}

export function relayCategoryLabel(task: MyTask): string {
  return RELAY_CATEGORY_LABELS[resolveRelayTaskCategory(task)];
}
