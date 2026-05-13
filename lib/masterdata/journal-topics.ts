export interface JournalTopic {
  id: string;
  label: string;
  description: string;
}

export const JOURNAL_TOPICS: JournalTopic[] = [
  {
    id: "diagnostics",
    label: "Diagnostik & Symptome",
    description: "Symptome, Untersuchungen, Diagnosestellung",
  },
  {
    id: "microbiome",
    label: "Mundflora & Systemische Gesundheit",
    description: "Mundflora, systemische Zusammenhänge",
  },
  {
    id: "prevention",
    label: "Vorsorge & Alltag",
    description: "Vorbeugung, Alltag, Zahnpflege",
  },
  {
    id: "treatment",
    label: "Behandlung & Therapie",
    description: "Behandlungsmethoden, klinische Pfade",
  },
  {
    id: "culture",
    label: "Patientenerleben & Verhalten",
    description: "Patientenerleben, Kultur, Verhalten",
  },
  {
    id: "science",
    label: "Medizinisches Wissen",
    description: "Wissenschaftliche Hintergründe",
  },
];

export function getTopicLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  const match = JOURNAL_TOPICS.find((t) => t.id === id);
  return match?.label || null;
}
