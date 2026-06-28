import {
  getFeaturedInspiration,
  inspirationToEditorialCard,
  JOURNAL_INSPIRATION_ARTICLES,
  type JournalInspirationArticle,
} from "@/lib/journal/journal-inspiration";
import {
  buildEditorialLibrary,
  formatJournalUpdatedEditorial,
  type JournalEditorialCard,
} from "@/lib/journal/journal-v2-model";
import {
  getMedicalCategoryLabel,
  inferMedicalCategory,
  type JournalMedicalCategoryId,
} from "@/lib/journal/journal-medical-categories";
import type { JournalEntry } from "@/lib/types/journal-entry";
import type { CareCenterCategoryFilter, CareCenterStatusFilter } from "@/lib/care-center/care-center-product";

export type CareCenterBadgeTone = "slate" | "green" | "amber" | "blue";

export type CareCenterBadge = {
  label: string;
  tone: CareCenterBadgeTone;
};

export type CareCenterChannels = {
  landing: boolean;
  portal: boolean;
  ki: boolean;
  journal: boolean;
};

export type CareCenterArticleRow = {
  id: string;
  title: string;
  excerpt: string;
  categoryLabel: string;
  categoryId: JournalMedicalCategoryId;
  badges: CareCenterBadge[];
  kiConnected: boolean;
  kiLabel: string;
  updatedLabel: string;
  authorLabel: string;
  readingLabel: string;
  channels: CareCenterChannels;
  coverUrl: string | null;
  editHref: string;
  previewHref: string | null;
  isInspiration: boolean;
  inspirationSlug?: string;
  needsReview: boolean;
};

export type CareCenterStats = {
  total: number;
  published: number;
  drafts: number;
  kiConnected: number;
  reviewRequired: number;
  kiActive: boolean;
};

function inspirationCovered(item: JournalInspirationArticle, entries: JournalEntry[]): boolean {
  const key = item.title.toLowerCase();
  return entries.some((e) => {
    const t = (e.title ?? "").toLowerCase().trim();
    return t && (t === key || t.includes(key) || key.includes(t));
  });
}

function needsReview(entry: JournalEntry): boolean {
  if (entry.status !== "draft") return false;
  const hasTitle = Boolean(entry.title?.trim());
  const hasBody = (entry.word_count ?? 0) > 0 || Boolean(entry.content_markdown?.trim());
  return hasTitle && hasBody;
}

function readingLabel(entry: JournalEntry): string {
  const minutes = entry.reading_time_minutes;
  if (minutes && minutes > 0) return `${minutes} Min.`;
  if (entry.word_count > 0) return `${Math.max(1, Math.round(entry.word_count / 200))} Min.`;
  return "—";
}

function buildChannels(
  entry: JournalEntry,
  publicSlug: string | null
): CareCenterChannels {
  const published = entry.status === "published";
  const hasPublic = published && Boolean(entry.slug && publicSlug);
  return {
    landing: published,
    portal: hasPublic,
    ki: published,
    journal: published,
  };
}

function buildBadges(
  card: JournalEditorialCard,
  entry: JournalEntry | null,
  channels: CareCenterChannels
): CareCenterBadge[] {
  const badges: CareCenterBadge[] = [];

  if (card.isInspiration) {
    badges.push({ label: "Vorlage", tone: "slate" });
    return badges;
  }

  if (entry?.status === "draft") {
    badges.push({ label: "Entwurf", tone: "amber" });
    if (needsReview(entry)) {
      badges.push({ label: "Review", tone: "amber" });
    }
  } else {
    badges.push({ label: "Veröffentlicht", tone: "green" });
  }

  if (channels.ki) {
    badges.push({ label: "KI", tone: "blue" });
  }

  if (channels.portal) {
    badges.push({ label: "Portal", tone: "slate" });
  }

  if (channels.landing) {
    badges.push({ label: "Landing", tone: "slate" });
  }

  return badges;
}

function entryToRow(
  entry: JournalEntry,
  authorLabel: string,
  publicSlug: string | null
): CareCenterArticleRow {
  const categoryId = inferMedicalCategory(entry);
  const channels = buildChannels(entry, publicSlug);
  const published = entry.status === "published";
  const card: JournalEditorialCard = {
    id: entry.id,
    categoryId,
    categoryLabel:
      entry.content_type === "faq" ? "FAQ" : getMedicalCategoryLabel(entry),
    title: entry.title?.trim() || "Ohne Titel",
    excerpt: entry.excerpt ?? "",
    statusLabel: published ? "Veröffentlicht" : "Entwurf",
    updatedLabel: formatJournalUpdatedEditorial(entry.updated_at),
    authorLabel,
    coverUrl: entry.cover_photo_url,
    editHref: `/journal/${entry.id}/edit`,
    previewHref:
      published && entry.slug && publicSlug
        ? `/doc/${publicSlug}/journal/${entry.slug}`
        : null,
    isDraft: !published,
  };

  return {
    id: card.id,
    title: card.title,
    excerpt: card.excerpt,
    categoryLabel: card.categoryLabel,
    categoryId,
    badges: buildBadges(card, entry, channels),
    kiConnected: channels.ki,
    kiLabel: channels.ki ? "Verbunden" : "Nicht verbunden",
    updatedLabel: card.updatedLabel,
    authorLabel,
    readingLabel: readingLabel(entry),
    channels,
    coverUrl: card.coverUrl,
    editHref: card.editHref,
    previewHref: card.previewHref,
    isInspiration: false,
    needsReview: needsReview(entry),
  };
}

function inspirationToRow(
  item: JournalInspirationArticle,
  authorLabel: string
): CareCenterArticleRow {
  const card = inspirationToEditorialCard(item, authorLabel);
  return {
    id: card.id,
    title: card.title,
    excerpt: card.excerpt,
    categoryLabel: card.categoryLabel,
    categoryId: card.categoryId,
    badges: buildBadges(card, null, {
      landing: false,
      portal: false,
      ki: false,
      journal: false,
    }),
    kiConnected: false,
    kiLabel: "Nicht verbunden",
    updatedLabel: card.updatedLabel,
    authorLabel,
    readingLabel: "—",
    channels: { landing: false, portal: false, ki: false, journal: false },
    coverUrl: null,
    editHref: card.editHref,
    previewHref: null,
    isInspiration: true,
    inspirationSlug: item.slug,
    needsReview: false,
  };
}

export function buildCareCenterStats(entries: JournalEntry[]): CareCenterStats {
  const published = entries.filter((e) => e.status === "published").length;
  const drafts = entries.filter((e) => e.status === "draft").length;
  const reviewRequired = entries.filter(needsReview).length;

  return {
    total: entries.length,
    published,
    drafts,
    kiConnected: published,
    reviewRequired,
    kiActive: true,
  };
}

function matchesCategoryFilter(
  row: CareCenterArticleRow,
  filter: CareCenterCategoryFilter
): boolean {
  if (filter === "faq") {
    return row.categoryId === "praxisorganisation" || row.badges.some((b) => b.label === "FAQ");
  }
  return row.categoryId === filter;
}

function matchesStatusFilter(row: CareCenterArticleRow, filter: CareCenterStatusFilter): boolean {
  if (filter === "drafts") {
    return row.badges.some((b) => b.label === "Entwurf" || b.label === "Vorlage");
  }
  if (filter === "published") {
    return row.badges.some((b) => b.label === "Veröffentlicht");
  }
  if (filter === "ki") {
    return row.kiConnected;
  }
  if (filter === "review") {
    return row.needsReview;
  }
  return true;
}

export function buildCareCenterArticles(
  entries: JournalEntry[],
  authorLabel: string,
  publicSlug: string | null,
  options: {
    searchQuery?: string;
    categoryFilters?: CareCenterCategoryFilter[];
    statusFilters?: CareCenterStatusFilter[];
    includeInspiration?: boolean;
  }
): CareCenterArticleRow[] {
  const q = options.searchQuery?.trim() ?? "";
  const categoryFilters = options.categoryFilters ?? [];
  const statusFilters = options.statusFilters ?? [];

  let pool = buildEditorialLibrary(entries, { searchQuery: q });
  let rows = pool.map((e) => entryToRow(e, authorLabel, publicSlug));

  if (options.includeInspiration !== false && !q && categoryFilters.length === 0) {
    const inspirations = JOURNAL_INSPIRATION_ARTICLES.filter(
      (item) => !inspirationCovered(item, entries)
    ).map((item) => inspirationToRow(item, authorLabel));
    rows = [...rows, ...inspirations];
  }

  if (categoryFilters.length > 0) {
    rows = rows.filter((row) =>
      categoryFilters.some((f) => matchesCategoryFilter(row, f))
    );
  }

  if (statusFilters.length > 0) {
    rows = rows.filter((row) =>
      statusFilters.some((f) => matchesStatusFilter(row, f))
    );
  }

  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.title.toLowerCase().includes(lower) ||
        row.categoryLabel.toLowerCase().includes(lower)
    );
  }

  return rows.sort((a, b) => {
    if (a.isInspiration !== b.isInspiration) return a.isInspiration ? 1 : -1;
    return 0;
  });
}

/** @deprecated inspiration anchor for legacy flows */
export function getCareCenterFeaturedSlug(): string {
  return getFeaturedInspiration().slug;
}
