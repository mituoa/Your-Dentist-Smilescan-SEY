import { JOURNAL_INSPIRATION_ARTICLES } from "@/lib/journal/journal-inspiration";
import type { JournalEntry } from "@/lib/types/journal-entry";
import type { KnowledgeSuggestion } from "@/lib/knowledge-hub/knowledge-hub-product";

const PATIENT_QUESTION_SUGGESTIONS: KnowledgeSuggestion[] = [
  {
    id: "coffee-implant",
    question: "Kaffee nach Implantation",
    categoryLabel: "Implantologie",
    inspirationSlug: "verhalten-nach-implantation",
  },
  {
    id: "bleeding-surgery",
    question: "Blutungen nach Eingriff",
    categoryLabel: "Chirurgie",
  },
  {
    id: "sports-implant",
    question: "Sport nach Implantat",
    categoryLabel: "Nachsorge",
    inspirationSlug: "sport-nach-implantat",
  },
];

function entryCoversTopic(entries: JournalEntry[], needle: string): boolean {
  const key = needle.toLowerCase();
  return entries.some((e) => {
    const title = (e.title ?? "").toLowerCase();
    const excerpt = (e.excerpt ?? "").toLowerCase();
    return title.includes(key) || excerpt.includes(key) || key.includes(title);
  });
}

function inspirationStillVisible(slug: string, entries: JournalEntry[]): boolean {
  const item = JOURNAL_INSPIRATION_ARTICLES.find((a) => a.slug === slug);
  if (!item) return false;
  const key = item.title.toLowerCase();
  return !entries.some((e) => {
    const t = (e.title ?? "").toLowerCase().trim();
    return t && (t === key || t.includes(key) || key.includes(t));
  });
}

export function buildKnowledgeSuggestions(entries: JournalEntry[]): KnowledgeSuggestion[] {
  const pool = [...PATIENT_QUESTION_SUGGESTIONS];

  for (const item of JOURNAL_INSPIRATION_ARTICLES) {
    if (inspirationStillVisible(item.slug, entries)) {
      pool.push({
        id: `insp-${item.slug}`,
        question: item.title,
        categoryLabel: item.categoryLabel,
        inspirationSlug: item.slug,
      });
    }
  }

  const seen = new Set<string>();
  return pool.filter((s) => {
    if (entryCoversTopic(entries, s.question)) return false;
    if (seen.has(s.question)) return false;
    seen.add(s.question);
    return true;
  });
}
