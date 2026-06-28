"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  Ellipsis,
  Filter,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createDraftArticle, saveArticle } from "@/app/(protected)/journal/actions";
import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { CareCenterStatsRow } from "@/components/care-center/care-center-stats-row";
import type { CareCenterArticleRow } from "@/lib/care-center/care-center-model";
import {
  buildCareCenterArticles,
  buildCareCenterStats,
} from "@/lib/care-center/care-center-model";
import {
  CARE_CENTER_MODULE,
  type CareCenterCategoryFilter,
  type CareCenterStatusFilter,
} from "@/lib/care-center/care-center-product";
import {
  JOURNAL_INSPIRATION_ARTICLES,
  inspirationDraftMarkdown,
} from "@/lib/journal/journal-inspiration";
import { JOURNAL_EDITORIAL_SEGMENTS } from "@/lib/journal/journal-medical-categories";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { cn } from "@/lib/utils";

export type CareCenterProps = {
  initialEntries: JournalEntry[];
  authorLabel: string;
  publicSlug: string | null;
};

const CATEGORY_PILLS: { id: CareCenterCategoryFilter | "all"; label: string }[] = [
  { id: "all", label: "Alle" },
  ...JOURNAL_EDITORIAL_SEGMENTS.map((s) => ({ id: s.id, label: s.label })),
  { id: "prophylaxe", label: "Prophylaxe" },
  { id: "chirurgie", label: "Chirurgie" },
  { id: "faq", label: "FAQ" },
];

const THUMB_GRADIENT: Record<string, string> = {
  implantologie: "linear-gradient(135deg, #5b8def 0%, #3d6fc9 100%)",
  aligner: "linear-gradient(135deg, #4aa88a 0%, #2d8a6e 100%)",
  bleaching: "linear-gradient(135deg, #e8c547 0%, #c9a227 100%)",
  prophylaxe: "linear-gradient(135deg, #6b8cae 0%, #4a6d8a 100%)",
  kinderzahnheilkunde: "linear-gradient(135deg, #e8a088 0%, #d4846a 100%)",
  parodontologie: "linear-gradient(135deg, #5a9e8f 0%, #3d7a6d 100%)",
  endodontie: "linear-gradient(135deg, #8b7ec8 0%, #6a5daa 100%)",
  chirurgie: "linear-gradient(135deg, #a08078 0%, #7d635c 100%)",
  nachsorge: "linear-gradient(135deg, #6889b8 0%, #4a6a94 100%)",
  praxisorganisation: "linear-gradient(135deg, #8a939e 0%, #6b7380 100%)",
};

function authorInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function CareArticleCard({
  row,
  onOpen,
}: {
  row: CareCenterArticleRow;
  onOpen: (row: CareCenterArticleRow) => void;
}) {
  const published = row.badges.some((b) => b.label === "Veröffentlicht");
  const isDraft = row.badges.some((b) => b.label === "Entwurf");
  const thumbStyle = row.coverUrl
    ? { backgroundImage: `url(${row.coverUrl})` }
    : { background: THUMB_GRADIENT[row.categoryId] ?? THUMB_GRADIENT.nachsorge };

  return (
    <article className="cc-card">
      <button type="button" className="cc-card__hit" onClick={() => onOpen(row)}>
        <div className="cc-card__main">
          <div className="cc-card__top">
            <span className="cc-card__category">{row.categoryLabel}</span>
            <span className="cc-card__menu" aria-hidden>
              <Ellipsis className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </div>
          <div className="cc-card__body-row">
            <div className="cc-card__copy">
              <h3 className="cc-card__title">{row.title}</h3>
              <p className="cc-card__excerpt">{row.excerpt}</p>
            </div>
            <div
              className={cn("cc-card__thumb", row.coverUrl && "cc-card__thumb--photo")}
              style={thumbStyle}
              aria-hidden
            />
          </div>
          <div className="cc-card__foot">
            <div className="cc-card__badges">
              {published ? (
                <span className="cc-card__badge cc-card__badge--live">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  Veröffentlicht
                </span>
              ) : isDraft ? (
                <span className="cc-card__badge cc-card__badge--draft">Entwurf</span>
              ) : row.isInspiration ? (
                <span className="cc-card__badge cc-card__badge--template">Vorlage</span>
              ) : null}
              {row.kiConnected ? (
                <span className="cc-card__badge cc-card__badge--ki">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  In KI genutzt
                </span>
              ) : null}
            </div>
            <div className="cc-card__author">
              <span className="cc-card__avatar" aria-hidden>
                {authorInitials(row.authorLabel)}
              </span>
              <span className="cc-card__author-name">{row.authorLabel}</span>
              <span className="cc-card__date">{row.updatedLabel}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

function entriesThisMonth(entries: JournalEntry[]): number {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return entries.filter((e) => new Date(e.created_at) >= start).length;
}

export function CareCenter({ initialEntries, authorLabel, publicSlug }: CareCenterProps) {
  const router = useRouter();
  const assist = useAssistDispatchOptional();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryPill, setCategoryPill] = useState<CareCenterCategoryFilter | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CareCenterStatusFilter | "all">("all");
  const [kiFilter, setKiFilter] = useState<"all" | "ki" | "no-ki">("all");
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => buildCareCenterStats(initialEntries), [initialEntries]);
  const newThisMonth = useMemo(() => entriesThisMonth(initialEntries), [initialEntries]);

  const allRows = useMemo(
    () =>
      buildCareCenterArticles(initialEntries, authorLabel, publicSlug, {
        includeInspiration: true,
      }),
    [authorLabel, initialEntries, publicSlug]
  );

  const visibleRows = useMemo(() => {
    let rows = allRows;

    if (categoryPill !== "all") {
      rows = buildCareCenterArticles(initialEntries, authorLabel, publicSlug, {
        includeInspiration: categoryPill !== "faq",
        categoryFilters: [categoryPill],
      });
    }

    if (statusFilter !== "all") {
      rows = rows.filter((row) => {
        if (statusFilter === "drafts") {
          return row.badges.some((b) => b.label === "Entwurf" || b.label === "Vorlage");
        }
        if (statusFilter === "published") {
          return row.badges.some((b) => b.label === "Veröffentlicht");
        }
        if (statusFilter === "review") return row.needsReview;
        if (statusFilter === "ki") return row.kiConnected;
        return true;
      });
    }

    if (kiFilter === "ki") rows = rows.filter((r) => r.kiConnected);
    if (kiFilter === "no-ki") rows = rows.filter((r) => !r.kiConnected);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (row) =>
          row.title.toLowerCase().includes(q) ||
          row.excerpt.toLowerCase().includes(q) ||
          row.categoryLabel.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [
    allRows,
    authorLabel,
    categoryPill,
    initialEntries,
    kiFilter,
    publicSlug,
    searchQuery,
    statusFilter,
  ]);

  const openKi = useCallback(() => {
    if (assist?.openCommand) {
      assist.openCommand();
      return;
    }
    router.push("/settings");
  }, [assist, router]);

  const openRow = useCallback(
    (row: CareCenterArticleRow) => {
      if (!row.isInspiration) {
        router.push(row.editHref);
        return;
      }

      const item = JOURNAL_INSPIRATION_ARTICLES.find((a) => a.slug === row.inspirationSlug);
      if (!item) return;

      startTransition(async () => {
        const draft = await createDraftArticle();
        if (draft.error || !draft.id) return;

        await saveArticle({
          id: draft.id,
          title: item.title,
          excerpt: item.excerpt,
          content_markdown: inspirationDraftMarkdown(item),
          topic: null,
          clinical_area: null,
          content_type: "nachsorge",
          cover_photo_url: null,
        });

        router.push(`/journal/${draft.id}/edit`);
      });
    },
    [router]
  );

  return (
    <div className="care-center yd-praxiswissen yd-journal-v6 yd-clinical-brand flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="yd-pw__shell cc-shell">
        <header className="cc-head">
          <div className="cc-head__copy">
            <h1 className="yd-pw__hero-title">{CARE_CENTER_MODULE.name}</h1>
            <p className="yd-pw__hero-sub">Wissen, das Ihre Patienten weiterbringt.</p>
          </div>
          <div className="cc-head__actions">
            <button
              type="button"
              className="yd-pw__btn yd-pw__btn--primary"
              onClick={() => router.push("/journal/new")}
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Neuer Artikel
            </button>
            <button
              type="button"
              className="yd-pw__btn yd-pw__btn--secondary"
              onClick={openKi}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Mit KI erstellen
            </button>
            <button type="button" className="cc-head__more" aria-label="Weitere Aktionen">
              <Ellipsis className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <CareCenterStatsRow
          stats={stats}
          newThisMonth={newThisMonth}
          onConfigureKi={openKi}
        />

        <div className="cc-toolbar">
          <label className="cc-toolbar__search" htmlFor="care-center-search">
            <Search className="cc-toolbar__search-icon" strokeWidth={1.75} aria-hidden />
            <input
              id="care-center-search"
              type="search"
              className="cc-toolbar__search-input"
              placeholder="Suche nach Thema, Behandlung oder Symptom…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </label>

          <div className="cc-toolbar__filters">
            <label className="cc-filter">
              <span className="cc-filter__label">Kategorie</span>
              <select
                className="cc-filter__select"
                value={categoryPill}
                onChange={(e) =>
                  setCategoryPill(e.target.value as CareCenterCategoryFilter | "all")
                }
              >
                {CATEGORY_PILLS.map((pill) => (
                  <option key={pill.id} value={pill.id}>
                    {pill.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="cc-filter__chev" strokeWidth={1.75} aria-hidden />
            </label>

            <label className="cc-filter">
              <span className="cc-filter__label">Status</span>
              <select
                className="cc-filter__select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as CareCenterStatusFilter | "all")
                }
              >
                <option value="all">Alle</option>
                <option value="published">Veröffentlicht</option>
                <option value="drafts">Entwürfe</option>
                <option value="review">Zur Prüfung</option>
              </select>
              <ChevronDown className="cc-filter__chev" strokeWidth={1.75} aria-hidden />
            </label>

            <label className="cc-filter">
              <span className="cc-filter__label">KI-Nutzung</span>
              <select
                className="cc-filter__select"
                value={kiFilter}
                onChange={(e) => setKiFilter(e.target.value as "all" | "ki" | "no-ki")}
              >
                <option value="all">Alle</option>
                <option value="ki">In KI genutzt</option>
                <option value="no-ki">Nicht verbunden</option>
              </select>
              <ChevronDown className="cc-filter__chev" strokeWidth={1.75} aria-hidden />
            </label>

            <button type="button" className="cc-filter cc-filter--icon" aria-label="Filter">
              <Filter className="h-4 w-4" strokeWidth={1.75} />
              <span className="cc-filter__dot" aria-hidden />
            </button>
          </div>
        </div>

        <nav className="cc-pills" aria-label="Kategorien">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={cn("cc-pill", categoryPill === pill.id && "cc-pill--active")}
              onClick={() => setCategoryPill(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </nav>

        <section className="cc-grid-wrap" aria-label="Inhalte" aria-busy={isPending}>
          {visibleRows.length === 0 ? (
            <div className="yd-pw__empty">
              <p className="yd-pw__empty-title">Keine Inhalte</p>
              <p className="yd-pw__empty-text">
                {searchQuery.trim()
                  ? "Kein Treffer für diese Suche."
                  : "Legen Sie Patientenwissen an oder wählen Sie eine Vorlage."}
              </p>
              <button
                type="button"
                className="yd-pw__featured-cta"
                onClick={() => router.push("/journal/new")}
              >
                Inhalt erstellen
              </button>
            </div>
          ) : (
            <div className="cc-grid">
              {visibleRows.map((row) => (
                <CareArticleCard key={row.id} row={row} onOpen={openRow} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
