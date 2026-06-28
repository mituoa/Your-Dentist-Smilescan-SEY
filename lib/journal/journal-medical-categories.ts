import { inferClinicalArea } from "@/lib/journal/clinical-areas";
import type { JournalEntry } from "@/lib/types/journal-entry";

/** Feste medizinische Kategorien — nicht frei wählbar. */
export type JournalMedicalCategoryId =
  | "implantologie"
  | "aligner"
  | "bleaching"
  | "prophylaxe"
  | "kinderzahnheilkunde"
  | "parodontologie"
  | "endodontie"
  | "chirurgie"
  | "nachsorge"
  | "praxisorganisation";

export const JOURNAL_MEDICAL_CATEGORIES: {
  id: JournalMedicalCategoryId;
  label: string;
}[] = [
  { id: "implantologie", label: "Implantologie" },
  { id: "aligner", label: "Aligner" },
  { id: "bleaching", label: "Bleaching" },
  { id: "prophylaxe", label: "Prophylaxe" },
  { id: "kinderzahnheilkunde", label: "Kinderzahnheilkunde" },
  { id: "parodontologie", label: "Parodontologie" },
  { id: "endodontie", label: "Endodontie" },
  { id: "chirurgie", label: "Chirurgie" },
  { id: "nachsorge", label: "Nachsorge" },
  { id: "praxisorganisation", label: "Praxisorganisation" },
];

const TITLE_RULES: { category: JournalMedicalCategoryId; keywords: string[] }[] = [
  { category: "implantologie", keywords: ["implant", "krone", "brücke"] },
  { category: "aligner", keywords: ["invisalign", "aligner", "schiene"] },
  { category: "bleaching", keywords: ["bleaching", "aufhell", "weiß"] },
  { category: "prophylaxe", keywords: ["prophylaxe", "pzr", "reinigung", "vorsorge"] },
  { category: "kinderzahnheilkunde", keywords: ["kind", "kinder"] },
  { category: "parodontologie", keywords: ["parodont", "zahnfleisch"] },
  { category: "endodontie", keywords: ["wurzel", "endodont", "wurzelkanal"] },
  { category: "chirurgie", keywords: ["extrakt", "chirurg", "weisheits", "eingriff"] },
  { category: "nachsorge", keywords: ["nachsorge", "nach ", "verhalten nach", "nach dem"] },
  { category: "praxisorganisation", keywords: ["termin", "recall", "notfall", "kontakt", "öffnungs"] },
];

const CLINICAL_TO_MEDICAL: Partial<Record<string, JournalMedicalCategoryId>> = {
  implantologie: "implantologie",
  prothetik: "implantologie",
  aesthetik: "bleaching",
  vorsorge: "prophylaxe",
  parodontologie: "parodontologie",
  kinderzahnheilkunde: "kinderzahnheilkunde",
  oralchirurgie: "chirurgie",
  cmd: "praxisorganisation",
};

export function inferMedicalCategory(entry: JournalEntry): JournalMedicalCategoryId {
  const clinical = inferClinicalArea(entry);
  if (clinical && CLINICAL_TO_MEDICAL[clinical]) {
    return CLINICAL_TO_MEDICAL[clinical]!;
  }

  const title = (entry.title ?? "").toLowerCase();
  for (const rule of TITLE_RULES) {
    if (rule.keywords.some((kw) => title.includes(kw))) return rule.category;
  }

  return "nachsorge";
}

export function getMedicalCategoryLabel(entry: JournalEntry): string {
  const id = inferMedicalCategory(entry);
  return JOURNAL_MEDICAL_CATEGORIES.find((c) => c.id === id)?.label ?? "Nachsorge";
}

export const JOURNAL_EDITORIAL_SEGMENTS: {
  id: JournalMedicalCategoryId;
  label: string;
  searchTerm: string;
}[] = [
  { id: "implantologie", label: "Implantologie", searchTerm: "Implantologie" },
  { id: "aligner", label: "Invisalign", searchTerm: "Invisalign" },
  { id: "bleaching", label: "Bleaching", searchTerm: "Bleaching" },
  { id: "nachsorge", label: "Nachsorge", searchTerm: "Nachsorge" },
  { id: "kinderzahnheilkunde", label: "Kinder", searchTerm: "Kinder" },
  { id: "parodontologie", label: "Parodontologie", searchTerm: "Parodontologie" },
];

/** @deprecated Use JOURNAL_EDITORIAL_SEGMENTS */
export const JOURNAL_SEARCH_SUGGESTIONS = JOURNAL_EDITORIAL_SEGMENTS.map((s) => s.label);
