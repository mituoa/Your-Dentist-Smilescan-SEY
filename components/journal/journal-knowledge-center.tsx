"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Baby,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileEdit,
  Layers,
  MoveHorizontal,
  PencilLine,
  Plus,
  Puzzle,
  Scissors,
  Search,
  Shield,
  Sparkles,
  Activity,
  type LucideIcon,
} from "lucide-react";

import { createDraftArticle, saveArticle } from "@/app/(protected)/journal/actions";
import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import {
  type ClinicalAreaId,
  getClinicalAreaStats,
  inferClinicalArea,
} from "@/lib/journal/clinical-areas";
import { getContentTypeLabel, inferContentType, type JournalContentType } from "@/lib/journal/content-categories";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import { getRecommendedTopicsMissing } from "@/lib/journal/recommended-topics";
import { JOURNAL_HUB, JOURNAL_KI, JOURNAL_SECTION_COPY } from "@/lib/journal/journal-hub-product";
import {
  formatDraftCount,
  formatLastUpdatedLabel,
  formatPublishedCount,
  journalEntryTitle,
  journalWorkspaceStats,
} from "@/lib/journal/workspace-display";
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import { cn } from "@/lib/utils";

export type JournalKnowledgeCenterProps = {
  initialEntries: JournalEntry[];
  authorLabel: string;
  publicSlug?: string | null;
};

const LIBRARY_FILTER_OPTIONS: { id: "all" | JournalContentType; label: string }[] = [
  { id: "all", label: "Alle Inhalte" },
  { id: "faq", label: "FAQ" },
  { id: "nachsorge", label: "Nachsorge" },
  { id: "erklaerung", label: "Erklärung" },
  { id: "praxiswissen", label: "Praxiswissen" },
];

const AREA_ICONS: Record<ClinicalAreaId, LucideIcon> = {
  implantologie: Layers,
  parodontologie: Activity,
  prothetik: Puzzle,
  vorsorge: Shield,
  kinderzahnheilkunde: Baby,
  cmd: MoveHorizontal,
  aesthetik: Sparkles,
  oralchirurgie: Scissors,
};

const COVERAGE_TYPES: { key: JournalContentType; label: string }[] = [
  { key: "faq", label: "FAQ" },
  { key: "nachsorge", label: "Nachsorge" },
  { key: "erklaerung", label: "Erklärung" },
];

function formatReadingShort(minutes: number | null | undefined): string {
  if (!minutes || minutes < 1) return "Kurz";
  return `${minutes} Min.`;
}

function getAreaCoverage(areaId: ClinicalAreaId, entries: JournalEntry[]) {
  const published = entries.filter(
    (e) => e.status === "published" && inferClinicalArea(e) === areaId
  );
  const present = COVERAGE_TYPES.filter(({ key }) =>
    published.some((e) => inferContentType(e) === key)
  );
  const missing = COVERAGE_TYPES.filter(
    ({ key }) => !published.some((e) => inferContentType(e) === key)
  );
  const percent =
    published.length === 0 ? 0 : Math.round((present.length / COVERAGE_TYPES.length) * 100);

  return { published, present, missing, percent };
}

function matchesSearch(entry: JournalEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = (entry.title ?? "").toLowerCase();
  const excerpt = (entry.excerpt ?? "").toLowerCase();
  return title.includes(q) || excerpt.includes(q);
}

function authorInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function JournalSearchField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="yd-journal-v6__search" htmlFor={id}>
      <Search className="yd-journal-v6__search-icon" strokeWidth={1.75} aria-hidden />
      <input
        id={id}
        type="search"
        className="yd-journal-v6__search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </label>
  );
}

export function JournalKnowledgeCenter({
  initialEntries,
  authorLabel,
  publicSlug = null,
}: JournalKnowledgeCenterProps) {
  const router = useRouter();
  const assist = useAssistDispatchOptional();
  const [focusArea, setFocusArea] = useState<ClinicalAreaId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState<"all" | JournalContentType>("all");
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = useMemo(() => journalWorkspaceStats(initialEntries), [initialEntries]);
  const areaStats = useMemo(() => getClinicalAreaStats(initialEntries), [initialEntries]);
  const priorityTopics = useMemo(
    () => getRecommendedTopicsMissing(initialEntries, 5),
    [initialEntries]
  );
  const kiReady = stats.publishedCount > 0;

  const publishedEntries = useMemo(() => {
    let entries = initialEntries.filter((e) => e.status === "published");
    if (focusArea) {
      entries = entries.filter((e) => inferClinicalArea(e) === focusArea);
    }
    if (libraryFilter !== "all") {
      entries = entries.filter((e) => inferContentType(e) === libraryFilter);
    }
    if (searchQuery.trim()) {
      entries = entries.filter((e) => matchesSearch(e, searchQuery));
    }
    return entries.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [initialEntries, focusArea, libraryFilter, searchQuery]);

  const drafts = useMemo(
    () =>
      initialEntries
        .filter((e) => e.status === "draft")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [initialEntries]
  );

  const openEditor = useCallback(
    (entryId: string) => {
      router.push(`/journal/${entryId}/edit`);
    },
    [router]
  );

  const startArticle = useCallback(
    async (options: {
      title: string;
      content: string;
      clinicalArea: ClinicalAreaId;
      contentType: string;
    }) => {
      setActionError(null);
      setIsBusy(true);
      try {
        const created = await createDraftArticle();
        if (created.error || !created.id) {
          setActionError(created.error || "Entwurf konnte nicht erstellt werden.");
          return;
        }

        const excerpt = excerptFromMarkdown(options.content);
        const saved = await saveArticle({
          id: created.id,
          title: options.title.slice(0, JOURNAL_LIMITS.title),
          excerpt,
          content_markdown: options.content.slice(0, JOURNAL_LIMITS.content_markdown),
          topic: null,
          clinical_area: options.clinicalArea,
          content_type: options.contentType,
          cover_photo_url: null,
        });

        if (saved.error) {
          setActionError(saved.error);
          return;
        }

        openEditor(created.id);
      } catch {
        setActionError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      } finally {
        setIsBusy(false);
      }
    },
    [openEditor]
  );

  const handleAreaClick = (id: ClinicalAreaId) => {
    setFocusArea((prev) => (prev === id ? null : id));
  };

  const focusLabel = focusArea
    ? areaStats.find((a) => a.id === focusArea)?.label
    : null;

  const resumeDraft = drafts[0] ?? null;

  const searchField = (
    <JournalSearchField
      id="journal-hub-search"
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Antworten suchen…"
    />
  );

  const toolbarMeta = [
    formatPublishedCount(stats.publishedCount),
    `${stats.coveredAreas} Bereiche`,
    stats.draftCount > 0 ? formatDraftCount(stats.draftCount) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const openKiAssist = () => {
    if (assist?.openCommand) {
      assist.openCommand();
      return;
    }
    router.push("/settings");
  };

  return (
    <div className="yd-journal-v6 yd-journal-v6--hub yd-journal-v6--premium yd-journal-v6--clinical yd-clinical-brand yd-clinical-control flex min-h-0 flex-1 flex-col overflow-auto">
      <div className={`yd-journal-v6__frame ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        {actionError ? (
          <div className="yd-journal-v6__error" role="alert">
            {actionError}
          </div>
        ) : null}

        <div className="yd-journal-v6__canvas">
        <header className="yd-journal-v6__mobile-head md:hidden">
          <h1 className="yd-journal-v6__mobile-title">{JOURNAL_HUB.title}</h1>
          <p className="yd-journal-v6__mobile-sub">{JOURNAL_HUB.essence}</p>
        </header>

        <div className="yd-journal-v6__toolbar" role="toolbar" aria-label="Care Center">
          <div className="yd-journal-v6__toolbar-start">
            <button
              type="button"
              className="yd-journal-v6__action yd-journal-v6__action--primary"
              disabled={isBusy}
              onClick={() => router.push("/journal/new")}
            >
              <Plus className="yd-journal-v6__action-icon" strokeWidth={1.5} aria-hidden />
              Neue Antwort
            </button>
            {publicSlug ? (
              <a
                href={`/doc/${publicSlug}/journal`}
                target="_blank"
                rel="noopener noreferrer"
                className="yd-journal-v6__action yd-journal-v6__action--ghost"
              >
                <ExternalLink className="yd-journal-v6__action-icon" strokeWidth={1.5} aria-hidden />
                {JOURNAL_SECTION_COPY.library.patientView}
              </a>
            ) : null}
          </div>
          <p className="yd-journal-v6__toolbar-meta" aria-label="Stand">
            {toolbarMeta}
          </p>
          <div className="yd-journal-v6__toolbar-search hidden md:block">{searchField}</div>
        </div>

        <div className="yd-journal-v6__body">
          <main className="yd-journal-v6__main">
            {resumeDraft ? (
              <section
                className="yd-journal-v6__section yd-journal-v6__section--resume md:hidden"
                aria-label="Entwurf fortsetzen"
              >
                <button
                  type="button"
                  className="yd-journal-v6__resume-card"
                  onClick={() => openEditor(resumeDraft.id)}
                >
                  <span className="yd-journal-v6__resume-icon" aria-hidden>
                    <PencilLine className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.65} />
                  </span>
                  <span className="yd-journal-v6__resume-body">
                    <span className="yd-journal-v6__resume-label">Entwurf fortsetzen</span>
                    <span className="yd-journal-v6__resume-title">
                      {journalEntryTitle(resumeDraft)}
                    </span>
                    <span className="yd-journal-v6__resume-meta">
                      Zuletzt bearbeitet {formatLastUpdatedLabel(resumeDraft.updated_at)}
                    </span>
                  </span>
                  <ChevronRight className="yd-journal-v6__resume-chevron" strokeWidth={1.75} aria-hidden />
                </button>
              </section>
            ) : null}

            <section
              className="yd-journal-v6__section yd-journal-v6__section--search yd-journal-v6__section--search-mobile md:hidden"
              aria-label="Suche"
            >
              {searchField}
            </section>

            <section
              className="yd-journal-v6__section yd-journal-v6__section--faq yd-journal-v6__panel"
              aria-label="Patientenfragen"
            >
              <div className="yd-journal-v6__block-head">
                <h2 className="yd-journal-v6__block-title">{JOURNAL_SECTION_COPY.faq.title}</h2>
                <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.faq.lead}</p>
              </div>
              {priorityTopics.length > 0 ? (
                <ul className="yd-journal-v6__faq-list">
                  {priorityTopics.map((topic) => (
                    <li key={topic.title}>
                      <button
                        type="button"
                        className="yd-journal-v6__faq-row"
                        disabled={isBusy}
                        onClick={() =>
                          void startArticle({
                            title: topic.title,
                            content: topic.content,
                            clinicalArea: topic.clinicalArea,
                            contentType: topic.contentType,
                          })
                        }
                      >
                        <span className="yd-journal-v6__faq-row-body">
                          <span className="yd-journal-v6__faq-row-q">{topic.title}</span>
                          <span className="yd-journal-v6__faq-row-hint">{topic.hint}</span>
                        </span>
                        <span className="yd-journal-v6__faq-row-cta">
                          Antwort erstellen
                          <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="yd-journal-v6__empty-copy">
                  Alle priorisierten Fragen sind beantwortet — Patienten finden die Antworten online.
                </p>
              )}
            </section>

            <section
              className="yd-journal-v6__section yd-journal-v6__section--areas yd-journal-v6__panel"
              aria-label="Themenbereiche"
            >
              <div className="yd-journal-v6__block-head">
                <h2 className="yd-journal-v6__block-title">{JOURNAL_SECTION_COPY.landscape.title}</h2>
                <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.landscape.lead}</p>
              </div>
              <nav className="yd-journal-v6__areas" aria-label="Wissenslandschaft">
                {areaStats.map((area) => {
                  const Icon = AREA_ICONS[area.id];
                  const isActive = focusArea === area.id;
                  const coverage = getAreaCoverage(area.id, initialEntries);
                  return (
                    <button
                      key={area.id}
                      type="button"
                      className={cn(
                        "yd-journal-v6__area-card",
                        isActive && "yd-journal-v6__area-card--active",
                        area.count === 0 && "yd-journal-v6__area-card--empty"
                      )}
                      onClick={() => handleAreaClick(area.id)}
                      aria-pressed={isActive}
                    >
                      <div className="yd-journal-v6__area-card-top">
                        <span className="yd-journal-v6__area-icon">
                          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} aria-hidden />
                        </span>
                        <span className="yd-journal-v6__area-count">
                          {area.count > 0 ? `${area.count} Inhalte` : "Noch offen"}
                        </span>
                      </div>
                      <span className="yd-journal-v6__area-name">{area.label}</span>
                      <div className="yd-journal-v6__area-meter" aria-hidden>
                        <span
                          className="yd-journal-v6__area-meter-fill"
                          style={{ width: `${coverage.percent}%` }}
                        />
                      </div>
                      <p className="yd-journal-v6__area-coverage">
                        {coverage.published.length === 0
                          ? "Noch nicht abgedeckt"
                          : coverage.missing.length === 0
                            ? `${coverage.present.map((t) => t.label).join(" · ")} vorhanden`
                            : `${coverage.missing[0]?.label ?? "Inhalt"} fehlt noch`}
                      </p>
                      {area.lastUpdated ? (
                        <span className="yd-journal-v6__area-updated">
                          Zuletzt {formatLastUpdatedLabel(area.lastUpdated)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </section>

            <section
              className="yd-journal-v6__section yd-journal-v6__section--library yd-journal-v6__panel"
              aria-label="Veröffentlichte Antworten"
            >
              <div className="yd-journal-v6__library-head">
                <div>
                  <h2 className="yd-journal-v6__block-title yd-journal-v6__block-title--large">
                    {JOURNAL_SECTION_COPY.library.title}
                  </h2>
                  <p className="yd-journal-v6__block-copy">
                    {JOURNAL_SECTION_COPY.library.lead}
                    {focusLabel ? ` · ${focusLabel}` : ""}
                  </p>
                </div>
              </div>

              <div className="yd-journal-v6__library-toolbar">
                <label className="yd-journal-v6__library-select">
                  <span className="sr-only">Inhaltstyp filtern</span>
                  <select
                    value={libraryFilter}
                    onChange={(e) =>
                      setLibraryFilter(e.target.value as "all" | JournalContentType)
                    }
                  >
                    {LIBRARY_FILTER_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="yd-journal-v6__library-select-icon" strokeWidth={1.75} aria-hidden />
                </label>
                <span className="yd-journal-v6__library-sort">Zuletzt aktualisiert</span>
                {focusArea ? (
                  <button
                    type="button"
                    className="yd-journal-v6__filter-chip yd-journal-v6__filter-chip--active"
                    onClick={() => setFocusArea(null)}
                  >
                    {focusLabel}
                    <span aria-hidden> ×</span>
                  </button>
                ) : null}
              </div>

              {publishedEntries.length > 0 ? (
                <ul className="yd-journal-v6__library-grid">
                  {publishedEntries.map((entry) => {
                    const contentType = inferContentType(entry);
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="yd-journal-v6__library-card"
                          onClick={() => openEditor(entry.id)}
                        >
                          <div className="yd-journal-v6__library-card-top">
                            <span className="yd-journal-v6__library-card-tag">
                              {getContentTypeLabel(contentType).toUpperCase()}
                            </span>
                            {entry.cover_photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={entry.cover_photo_url}
                                alt=""
                                className="yd-journal-v6__library-card-thumb"
                              />
                            ) : (
                              <span className="yd-journal-v6__library-card-thumb yd-journal-v6__library-card-thumb--empty" aria-hidden />
                            )}
                          </div>
                          <p className="yd-journal-v6__library-card-title">
                            {journalEntryTitle(entry)}
                          </p>
                          <p className="yd-journal-v6__library-card-meta">
                            {formatReadingShort(entry.reading_time_minutes)} Lesezeit
                          </p>
                          <p className="yd-journal-v6__library-card-updated">
                            Aktualisiert {formatLastUpdatedLabel(entry.updated_at)}
                          </p>
                          <div className="yd-journal-v6__library-card-author">
                            <span className="yd-journal-v6__library-card-avatar" aria-hidden>
                              {authorInitials(authorLabel)}
                            </span>
                            <span className="yd-journal-v6__library-card-author-name">
                              {authorLabel}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="yd-journal-v6__empty">
                  <p className="yd-journal-v6__empty-title">
                    {searchQuery.trim()
                      ? "Keine Antworten zu dieser Suche."
                      : focusArea
                        ? areaStats.find((a) => a.id === focusArea)?.gapHint
                        : "Noch keine veröffentlichten Antworten."}
                  </p>
                  <p className="yd-journal-v6__empty-copy">
                    {searchQuery.trim()
                      ? "Anderen Suchbegriff versuchen oder Filter zurücksetzen."
                      : "Starten Sie mit einer häufigen Patientenfrage oben — oder schreiben Sie direkt eine neue Antwort."}
                  </p>
                </div>
              )}
            </section>

            <section
              className="yd-journal-v6__ki-strip yd-journal-v6__section yd-journal-v6__section--ki"
              aria-label="Patienten-KI"
            >
              <div className="yd-journal-v6__ki-strip-main">
                <Sparkles className="yd-journal-v6__ki-strip-icon" strokeWidth={1.5} aria-hidden />
                <div className="yd-journal-v6__ki-strip-copy">
                  <p className="yd-journal-v6__ki-strip-title">
                    {JOURNAL_KI.title}
                    <span
                      className={cn(
                        "yd-journal-v6__ki-strip-badge",
                        kiReady && "yd-journal-v6__ki-strip-badge--active"
                      )}
                    >
                      {kiReady ? JOURNAL_KI.badgeActive : JOURNAL_KI.badgeSetup}
                    </span>
                  </p>
                  <p className="yd-journal-v6__ki-strip-summary">
                    {kiReady ? JOURNAL_KI.summary : JOURNAL_KI.emptyHint}
                  </p>
                  <p className="yd-journal-v6__ki-strip-safety">{JOURNAL_KI.safetyLine}</p>
                </div>
              </div>
              <button
                type="button"
                className="yd-journal-v6__ki-strip-cta"
                onClick={kiReady ? openKiAssist : () => router.push("/journal/new")}
              >
                {kiReady ? JOURNAL_KI.ctaActive : JOURNAL_KI.ctaSetup}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            </section>

            {drafts.length > 0 ? (
              <section
                className="yd-journal-v6__section yd-journal-v6__section--drafts yd-journal-v6__section--drafts-mobile md:hidden"
                aria-label="Entwürfe"
              >
                <div className="yd-journal-v6__block-head yd-journal-v6__block-head--subtle">
                  <h2 className="yd-journal-v6__block-title yd-journal-v6__block-title--small">
                    Entwürfe
                  </h2>
                  <p className="yd-journal-v6__block-copy">
                    In Arbeit — noch nicht für Patienten sichtbar.
                  </p>
                </div>
                <ul className="yd-journal-v6__draft-list">
                  {drafts.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="yd-journal-v6__draft-row"
                        onClick={() => openEditor(entry.id)}
                      >
                        <FileEdit className="yd-journal-v6__draft-row-icon" strokeWidth={1.5} aria-hidden />
                        <span className="yd-journal-v6__draft-row-body">
                          <span className="yd-journal-v6__draft-row-title">
                            {journalEntryTitle(entry)}
                          </span>
                          <span className="yd-journal-v6__draft-row-meta">
                            Zuletzt bearbeitet {formatLastUpdatedLabel(entry.updated_at)}
                          </span>
                        </span>
                        <ChevronRight
                          className="yd-journal-v6__draft-row-chevron"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </main>

          {drafts.length > 0 ? (
            <aside className="yd-journal-v6__rail hidden md:block" aria-label="Entwürfe">
              <div className="yd-journal-v6__rail-inner">
                <h2 className="yd-journal-v6__rail-title yd-journal-v6__rail-title--drafts">
                  Entwürfe
                </h2>
                <ul className="yd-journal-v6__draft-list yd-journal-v6__draft-list--rail">
                  {drafts.slice(0, 4).map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="yd-journal-v6__draft-row"
                        onClick={() => openEditor(entry.id)}
                      >
                        <FileEdit className="yd-journal-v6__draft-row-icon" strokeWidth={1.5} aria-hidden />
                        <span className="yd-journal-v6__draft-row-body">
                          <span className="yd-journal-v6__draft-row-title">
                            {journalEntryTitle(entry)}
                          </span>
                          <span className="yd-journal-v6__draft-row-meta">
                            Zuletzt bearbeitet {formatLastUpdatedLabel(entry.updated_at)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
        </div>
      </div>
    </div>
  );
}
