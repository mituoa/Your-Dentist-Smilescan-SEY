import { inferContentType } from "@/lib/journal/content-categories";
import {
  getMedicalCategoryLabel,
  inferMedicalCategory,
  type JournalMedicalCategoryId,
} from "@/lib/journal/journal-medical-categories";
import { journalEntryTitle } from "@/lib/journal/workspace-display";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type SubmissionCareRecommendation = {
  entryId: string;
  title: string;
  slug: string;
  publicUrl: string | null;
  categoryLabel: string;
};

const NOTE_TO_CATEGORIES: { pattern: RegExp; categories: JournalMedicalCategoryId[] }[] = [
  { pattern: /\bimplant/i, categories: ["implantologie", "nachsorge"] },
  { pattern: /\b(invisalign|aligner|schiene)\b/i, categories: ["aligner", "nachsorge"] },
  { pattern: /\b(bleaching|aufhell|verfärb)/i, categories: ["bleaching"] },
  { pattern: /\b(parodont|zahnfleisch|blutet)\b/i, categories: ["parodontologie"] },
  { pattern: /\b(wurzel|endodont|wurzelkanal)\b/i, categories: ["endodontie"] },
  { pattern: /\b(extrakt|weisheits|eingriff|nach (dem )?op)\b/i, categories: ["chirurgie", "nachsorge"] },
  { pattern: /\b(schwellung|schwell)\b/i, categories: ["nachsorge", "chirurgie"] },
  { pattern: /\b(schmerz|weh|zahnschmerz)\b/i, categories: ["endodontie", "prophylaxe", "nachsorge"] },
  { pattern: /\b(kind|kinder)\b/i, categories: ["kinderzahnheilkunde"] },
  { pattern: /\b(pzr|prophylaxe|reinigung|vorsorge)\b/i, categories: ["prophylaxe"] },
];

const MIN_MATCH_SCORE = 6;

function inferCategoriesFromNotes(notes: string): Set<JournalMedicalCategoryId> {
  const categories = new Set<JournalMedicalCategoryId>();
  for (const rule of NOTE_TO_CATEGORIES) {
    if (rule.pattern.test(notes)) {
      for (const category of rule.categories) {
        categories.add(category);
      }
    }
  }
  return categories;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zäöüß0-9]+/i)
    .filter((token) => token.length >= 4);
}

function scoreEntry(
  entry: JournalEntry,
  notes: string,
  targetCategories: Set<JournalMedicalCategoryId>
): number {
  const title = journalEntryTitle(entry).toLowerCase();
  const excerpt = (entry.excerpt ?? "").toLowerCase();
  const noteLower = notes.toLowerCase();
  let score = 0;

  const category = inferMedicalCategory(entry);
  if (targetCategories.has(category)) score += 12;

  const contentType = inferContentType(entry);
  if (contentType === "faq" || contentType === "nachsorge") score += 2;

  if (title.length >= 6 && noteLower.includes(title.slice(0, Math.min(title.length, 28)))) {
    score += 15;
  }

  for (const token of tokenize(title)) {
    if (noteLower.includes(token)) score += 4;
  }

  for (const token of tokenize(noteLower)) {
    if (title.includes(token) || excerpt.includes(token)) score += 3;
  }

  return score;
}

/** Veröffentlichte Care-Center-Inhalte vorhanden? */
export function hasPublishedCareCenterContent(entries: JournalEntry[]): boolean {
  return entries.some((entry) => entry.status === "published" && Boolean(entry.slug?.trim()));
}

/**
 * Ordnet eine Einsendung einem veröffentlichten Care-Center-Artikel zu.
 * Kein Treffer, wenn Care Center leer ist oder die Zuordnung unsicher bleibt.
 */
export function matchSubmissionCareRecommendation(input: {
  patientNotes: string | null;
  entries: JournalEntry[];
  publicSlug: string | null;
  appBaseUrl: string;
}): SubmissionCareRecommendation | null {
  const published = input.entries.filter(
    (entry) => entry.status === "published" && Boolean(entry.slug?.trim())
  );
  if (published.length === 0) return null;

  const notes = (input.patientNotes ?? "").trim();
  if (!notes) return null;

  const targetCategories = inferCategoriesFromNotes(notes);
  let best: { entry: JournalEntry; score: number } | null = null;

  for (const entry of published) {
    const score = scoreEntry(entry, notes, targetCategories);
    if (!best || score > best.score) {
      best = { entry, score };
    }
  }

  if (!best || best.score < MIN_MATCH_SCORE) return null;

  const slug = best.entry.slug!.trim();
  const base = input.appBaseUrl.replace(/\/$/, "");
  const publicUrl = input.publicSlug ? `${base}/doc/${input.publicSlug}/journal/${slug}` : null;

  return {
    entryId: best.entry.id,
    title: journalEntryTitle(best.entry),
    slug,
    publicUrl,
    categoryLabel: getMedicalCategoryLabel(best.entry),
  };
}
