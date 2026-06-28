import {
  getMedicalCategoryLabel,
  inferMedicalCategory,
  JOURNAL_EDITORIAL_SEGMENTS,
  type JournalMedicalCategoryId,
} from "@/lib/journal/journal-medical-categories";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import {
  getFeaturedInspiration,
  inspirationToEditorialCard,
  JOURNAL_INSPIRATION_ARTICLES,
  type JournalInspirationArticle,
} from "@/lib/journal/journal-inspiration";
import { journalEntryTitle } from "@/lib/journal/workspace-display";
import type { JournalEntry } from "@/lib/types/journal-entry";

export { JOURNAL_EDITORIAL_SEGMENTS };

export type JournalEditorialCard = {
  id: string;
  categoryId: JournalMedicalCategoryId;
  categoryLabel: string;
  title: string;
  excerpt: string;
  statusLabel: string;
  updatedLabel: string;
  authorLabel: string;
  coverUrl: string | null;
  editHref: string;
  previewHref: string | null;
  isDraft: boolean;
  isInspiration?: boolean;
  inspirationSlug?: string;
};

export function matchesJournalQuery(entry: JournalEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = (entry.title ?? "").toLowerCase();
  const excerpt = (entry.excerpt ?? "").toLowerCase();
  const category = getMedicalCategoryLabel(entry).toLowerCase();
  return title.includes(q) || excerpt.includes(q) || category.includes(q);
}

export function sortByUpdated(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function formatJournalUpdatedEditorial(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "heute";
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;

  return date.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
}

function entryExcerpt(entry: JournalEntry): string {
  const fromExcerpt = entry.excerpt?.trim();
  if (fromExcerpt) return fromExcerpt;
  if (entry.content_markdown?.trim()) {
    return excerptFromMarkdown(entry.content_markdown);
  }
  return "Patienteninformation zu einem häufigen Anliegen Ihrer Praxis.";
}

export function toEditorialCard(
  entry: JournalEntry,
  authorLabel: string,
  publicSlug: string | null
): JournalEditorialCard {
  const published = entry.status === "published";
  const previewHref =
    published && entry.slug && publicSlug
      ? `/doc/${publicSlug}/journal/${entry.slug}`
      : null;

  return {
    id: entry.id,
    categoryId: inferMedicalCategory(entry),
    categoryLabel: getMedicalCategoryLabel(entry),
    title: journalEntryTitle(entry),
    excerpt: entryExcerpt(entry),
    statusLabel: published ? "Veröffentlicht" : "Entwurf",
    updatedLabel: formatJournalUpdatedEditorial(entry.updated_at),
    authorLabel,
    coverUrl: entry.cover_photo_url,
    editHref: `/journal/${entry.id}/edit`,
    previewHref,
    isDraft: !published,
  };
}

export function filterEntriesByCategory(
  entries: JournalEntry[],
  categoryId: JournalMedicalCategoryId
): JournalEntry[] {
  return sortByUpdated(entries.filter((e) => inferMedicalCategory(e) === categoryId));
}

export function filterEntriesForSegment(
  entries: JournalEntry[],
  searchTerm: string
): JournalEntry[] {
  return sortByUpdated(entries.filter((e) => matchesJournalQuery(e, searchTerm)));
}

export function buildEditorialLibrary(
  entries: JournalEntry[],
  options: {
    searchQuery?: string;
    categoryId?: JournalMedicalCategoryId | null;
    segmentTerm?: string | null;
  }
): JournalEntry[] {
  let pool = [...entries];

  if (options.categoryId) {
    pool = filterEntriesByCategory(pool, options.categoryId);
  } else if (options.segmentTerm) {
    pool = filterEntriesForSegment(pool, options.segmentTerm);
  }

  const q = options.searchQuery?.trim() ?? "";
  if (q) {
    pool = pool.filter((e) => matchesJournalQuery(e, q));
  }

  return sortByUpdated(pool);
}

export function matchesInspirationArticle(
  item: JournalInspirationArticle,
  query: string,
  categoryId?: JournalMedicalCategoryId | null
): boolean {
  if (categoryId && item.categoryId !== categoryId) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.title.toLowerCase().includes(q) ||
    item.excerpt.toLowerCase().includes(q) ||
    item.categoryLabel.toLowerCase().includes(q)
  );
}

function inspirationCoveredByEntry(
  item: JournalInspirationArticle,
  entries: JournalEntry[]
): boolean {
  const key = item.title.toLowerCase();
  return entries.some((e) => {
    const t = (e.title ?? "").toLowerCase().trim();
    if (!t) return false;
    return t === key || t.includes(key) || key.includes(t);
  });
}

export function buildPraxiswissenDisplay(
  entries: JournalEntry[],
  authorLabel: string,
  publicSlug: string | null,
  options: { searchQuery?: string; categoryId?: JournalMedicalCategoryId | null }
): { featured: JournalEditorialCard | null; grid: JournalEditorialCard[] } {
  const q = options.searchQuery?.trim() ?? "";
  const categoryId = options.categoryId ?? null;
  const hasFilter = Boolean(q || categoryId);

  const realPool = buildEditorialLibrary(entries, { searchQuery: q, categoryId });
  const realCards = realPool.map((e) => toEditorialCard(e, authorLabel, publicSlug));

  const inspirationCards = JOURNAL_INSPIRATION_ARTICLES.filter(
    (item) =>
      !inspirationCoveredByEntry(item, entries) &&
      matchesInspirationArticle(item, q, categoryId)
  ).map((item) => inspirationToEditorialCard(item, authorLabel));

  if (hasFilter) {
    return {
      featured: null,
      grid: [...realCards, ...inspirationCards],
    };
  }

  const published = sortByUpdated(entries.filter((e) => e.status === "published"));
  let featured: JournalEditorialCard;

  if (published.length > 0) {
    featured = toEditorialCard(published[0]!, authorLabel, publicSlug);
  } else {
    featured = inspirationToEditorialCard(getFeaturedInspiration(), authorLabel);
  }

  const gridReal = realCards.filter((c) => c.id !== featured.id);
  const gridInspiration = inspirationCards.filter((c) => c.id !== featured.id);

  return {
    featured,
    grid: [...gridReal, ...gridInspiration],
  };
}

export function praxiswissenStatusLabel(card: JournalEditorialCard): string {
  if (card.isInspiration) return "Vorlage";
  return card.isDraft ? "Entwurf" : "Veröffentlicht";
}
