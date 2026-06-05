import { GUIDED_QUESTIONS } from "@/lib/journal/guided-drafts";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type JournalContentType = "erklaerung" | "nachsorge" | "faq" | "praxiswissen";

export const CONTENT_TYPE_LABELS: Record<JournalContentType, string> = {
  erklaerung: "Erklärung",
  nachsorge: "Nachsorge",
  faq: "FAQ",
  praxiswissen: "Praxiswissen",
};

const GUIDED_SET = new Set<string>(GUIDED_QUESTIONS);

const LEGACY_TOPIC_TO_TYPE: Record<string, JournalContentType> = {
  treatment: "erklaerung",
  diagnostics: "faq",
  prevention: "nachsorge",
  microbiome: "praxiswissen",
  culture: "praxiswissen",
  science: "praxiswissen",
};

const TITLE_NACHSORGE = ["nach ", "verhalten nach", "nachsorge", "nach dem eingriff", "nach implantation"];

export function isContentType(value: string | null | undefined): value is JournalContentType {
  return value === "erklaerung" || value === "nachsorge" || value === "faq" || value === "praxiswissen";
}

export function inferContentType(entry: JournalEntry): JournalContentType {
  if (isContentType(entry.content_type)) return entry.content_type;

  const title = (entry.title ?? "").trim().toLowerCase();
  if (title && GUIDED_SET.has(entry.title!.trim())) return "faq";
  if (TITLE_NACHSORGE.some((kw) => title.includes(kw))) return "nachsorge";

  if (entry.topic && LEGACY_TOPIC_TO_TYPE[entry.topic]) {
    return LEGACY_TOPIC_TO_TYPE[entry.topic];
  }

  return "erklaerung";
}

export function getContentTypeLabel(type: JournalContentType): string {
  return CONTENT_TYPE_LABELS[type];
}

/** @deprecated V6 — CMS-Regale; nur noch für Migration/Legacy */
export type JournalContentCategory = JournalContentType;
export type JournalLibraryFilter = "all" | JournalContentType | "entwuerfe";

export const JOURNAL_CATEGORY_LABELS = CONTENT_TYPE_LABELS;
export const JOURNAL_CATEGORY_PLURAL = CONTENT_TYPE_LABELS;

export function getEntryCategory(entry: JournalEntry): JournalContentType {
  return inferContentType(entry);
}

export function getCategoryLabel(category: JournalContentType): string {
  return getContentTypeLabel(category);
}
