import { JOURNAL_MEDICAL_CATEGORIES } from "@/lib/journal/journal-medical-categories";
import type { JournalMedicalCategoryId } from "@/lib/journal/journal-medical-categories";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  buildCareCenterArticles,
  buildCareCenterStats,
  type CareCenterArticleRow,
} from "@/lib/care-center/care-center-model";

export const CARE_CENTER_TITLE = "Care Center";

export type CareLibraryScope =
  | "all"
  | "drafts"
  | "published"
  | "ki"
  | "review"
  | "templates"
  | { category: JournalMedicalCategoryId };

export type CareLibraryNavItem = {
  id: string;
  scope: CareLibraryScope;
  label: string;
  count?: number;
};

export type CareLibraryCounts = {
  all: number;
  drafts: number;
  published: number;
  ki: number;
  review: number;
  templates: number;
  byCategory: Record<JournalMedicalCategoryId, number>;
};

export function buildCareLibraryCounts(
  entries: JournalEntry[],
  rows: CareCenterArticleRow[]
): CareLibraryCounts {
  const stats = buildCareCenterStats(entries);
  const byCategory = JOURNAL_MEDICAL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] = rows.filter((r) => r.categoryId === cat.id && !r.isInspiration).length;
      return acc;
    },
    {} as Record<JournalMedicalCategoryId, number>
  );

  return {
    all: rows.filter((r) => !r.isInspiration).length + rows.filter((r) => r.isInspiration).length,
    drafts: stats.drafts,
    published: stats.published,
    ki: stats.kiConnected,
    review: stats.reviewRequired,
    templates: rows.filter((r) => r.isInspiration).length,
    byCategory,
  };
}

export function scopeLabel(scope: CareLibraryScope): string {
  if (scope === "all") return "Alle Inhalte";
  if (scope === "drafts") return "Entwürfe";
  if (scope === "published") return "Veröffentlicht";
  if (scope === "ki") return "Mit Patienten-KI";
  if (scope === "review") return "Zur Prüfung";
  if (scope === "templates") return "Vorlagen";
  return (
    JOURNAL_MEDICAL_CATEGORIES.find((c) => c.id === scope.category)?.label ?? "Kategorie"
  );
}

function matchesScope(row: CareCenterArticleRow, scope: CareLibraryScope): boolean {
  if (scope === "all") return true;
  if (scope === "templates") return row.isInspiration;
  if (typeof scope === "object") return row.categoryId === scope.category;
  if (scope === "drafts") {
    return row.badges.some((b) => b.label === "Entwurf") || row.isInspiration;
  }
  if (scope === "published") {
    return row.badges.some((b) => b.label === "Veröffentlicht");
  }
  if (scope === "ki") return row.kiConnected;
  if (scope === "review") return row.needsReview;
  return true;
}

export function filterCareLibraryRows(
  rows: CareCenterArticleRow[],
  scope: CareLibraryScope,
  searchQuery: string
): CareCenterArticleRow[] {
  const q = searchQuery.trim().toLowerCase();
  let pool = rows.filter((row) => matchesScope(row, scope));

  if (q) {
    pool = pool.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.categoryLabel.toLowerCase().includes(q) ||
        row.authorLabel.toLowerCase().includes(q)
    );
  }

  return pool;
}

export function buildCareLibraryRows(
  entries: JournalEntry[],
  authorLabel: string,
  publicSlug: string | null
): CareCenterArticleRow[] {
  return buildCareCenterArticles(entries, authorLabel, publicSlug, {
    includeInspiration: true,
  });
}

export function careLibraryNav(
  counts: CareLibraryCounts
): { primary: CareLibraryNavItem[]; categories: CareLibraryNavItem[] } {
  const primary: CareLibraryNavItem[] = [
    { id: "all", scope: "all", label: "Alle Inhalte", count: counts.all },
    { id: "drafts", scope: "drafts", label: "Entwürfe", count: counts.drafts },
    { id: "published", scope: "published", label: "Veröffentlicht", count: counts.published },
    { id: "ki", scope: "ki", label: "Mit Patienten-KI", count: counts.ki },
    { id: "review", scope: "review", label: "Zur Prüfung", count: counts.review },
    { id: "templates", scope: "templates", label: "Vorlagen", count: counts.templates },
  ];

  const categories: CareLibraryNavItem[] = JOURNAL_MEDICAL_CATEGORIES.filter(
    (cat) => counts.byCategory[cat.id] > 0
  ).map((cat) => ({
    id: `cat-${cat.id}`,
    scope: { category: cat.id },
    label: cat.label,
    count: counts.byCategory[cat.id],
  }));

  return { primary, categories };
}

export function careRowStatusLabel(row: CareCenterArticleRow): string {
  if (row.isInspiration) return "Vorlage";
  if (row.needsReview) return "Review";
  if (row.badges.some((b) => b.label === "Veröffentlicht")) return "Live";
  return "Entwurf";
}

export function careRowStatusTone(
  row: CareCenterArticleRow
): "live" | "draft" | "template" | "review" {
  if (row.isInspiration) return "template";
  if (row.needsReview) return "review";
  if (row.badges.some((b) => b.label === "Veröffentlicht")) return "live";
  return "draft";
}
