export interface JournalTopic {
  id: string;
  label: string;
  description: string;
}

export const JOURNAL_TOPICS: JournalTopic[] = [
  {
    id: "diagnostics",
    label: "Diagnostics & Symptoms",
    description: "Symptome, Untersuchungen, Diagnosestellung",
  },
  {
    id: "microbiome",
    label: "Microbiome & Systemic Health",
    description: "Mundflora, systemische Zusammenhänge",
  },
  {
    id: "prevention",
    label: "Prevention & Everyday Behavior",
    description: "Vorbeugung, Alltag, Zahnpflege",
  },
  {
    id: "treatment",
    label: "Treatment & Clinical Pathways",
    description: "Behandlungsmethoden, klinische Pfade",
  },
  {
    id: "culture",
    label: "Culture, Behavior & Patient Reality",
    description: "Patientenerleben, Kultur, Verhalten",
  },
  {
    id: "science",
    label: "Science & Medical Knowledge",
    description: "Wissenschaftliche Hintergründe",
  },
];

export function getTopicLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  const match = JOURNAL_TOPICS.find((t) => t.id === id);
  return match?.label || null;
}
