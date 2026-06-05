"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  FileEdit,
  HelpCircle,
  HeartPulse,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import { createDraftArticle, saveArticle } from "@/app/(protected)/journal/actions";
import {
  buildJournalFrequentCards,
  buildJournalKnowledgeAreas,
  buildJournalOpenItems,
  buildRecentlyEdited,
  filterEntriesByContentType,
  filterEntriesByKnowledgeArea,
  journalSectionEmptyCopy,
  JOURNAL_FREQUENT_CARDS,
  searchJournalEntries,
  type JournalKnowledgeAreaId,
  type JournalOpenItem,
} from "@/lib/journal/journal-patient-knowledge";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import type { RecommendedTopic } from "@/lib/journal/recommended-topics";
import {
  formatLastUpdatedLabel,
  journalEntryTitle,
} from "@/lib/journal/workspace-display";
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";
import { getContentTypeLabel, inferContentType, type JournalContentType } from "@/lib/journal/content-categories";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import { cn } from "@/lib/utils";

type JournalPatientKnowledgeProps = {
  initialEntries: JournalEntry[];
};

type BrowseFilter =
  | { kind: "type"; id: JournalContentType }
  | { kind: "area"; id: JournalKnowledgeAreaId }
  | null;

const FREQUENT_ICONS: Record<JournalContentType, typeof HelpCircle> = {
  faq: HelpCircle,
  nachsorge: HeartPulse,
  erklaerung: BookOpen,
  praxiswissen: Sparkles,
};

export function JournalPatientKnowledge({ initialEntries }: JournalPatientKnowledgeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const hasSearch = searchQuery.trim().length > 0;

  const frequentCards = useMemo(
    () => buildJournalFrequentCards(initialEntries),
    [initialEntries]
  );

  const knowledgeAreas = useMemo(
    () => buildJournalKnowledgeAreas(initialEntries),
    [initialEntries]
  );

  const openItems = useMemo(
    () => buildJournalOpenItems(initialEntries),
    [initialEntries]
  );

  const recentlyEdited = useMemo(
    () => buildRecentlyEdited(initialEntries),
    [initialEntries]
  );

  const searchResults = useMemo(
    () => searchJournalEntries(initialEntries, searchQuery),
    [initialEntries, searchQuery]
  );

  const browseEntries = useMemo(() => {
    if (!browseFilter) return [];
    if (browseFilter.kind === "type") {
      return filterEntriesByContentType(initialEntries, browseFilter.id);
    }
    return filterEntriesByKnowledgeArea(initialEntries, browseFilter.id);
  }, [browseFilter, initialEntries]);

  const openEditor = useCallback(
    (entryId: string) => {
      router.push(`/journal/${entryId}/edit`);
    },
    [router]
  );

  const startFromTopic = useCallback(
    async (topic: RecommendedTopic) => {
      setActionError(null);
      setIsBusy(true);
      try {
        const created = await createDraftArticle();
        if (created.error || !created.id) {
          setActionError(created.error || "Entwurf konnte nicht erstellt werden.");
          return;
        }

        const excerpt = excerptFromMarkdown(topic.content);
        const saved = await saveArticle({
          id: created.id,
          title: topic.title.slice(0, JOURNAL_LIMITS.title),
          excerpt,
          content_markdown: topic.content.slice(0, JOURNAL_LIMITS.content_markdown),
          topic: null,
          clinical_area: topic.clinicalArea,
          content_type: topic.contentType,
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

  const handleOpenItem = (item: JournalOpenItem) => {
    if (isBusy) return;
    switch (item.kind) {
      case "draft":
        openEditor(item.entryId);
        break;
      case "missing_faq":
      case "missing_nachsorge":
        void startFromTopic(item.topic);
        break;
    }
  };

  const toggleBrowseType = (type: JournalContentType) => {
    setBrowseFilter((prev) =>
      prev?.kind === "type" && prev.id === type ? null : { kind: "type", id: type }
    );
  };

  const toggleBrowseArea = (areaId: JournalKnowledgeAreaId) => {
    setBrowseFilter((prev) =>
      prev?.kind === "area" && prev.id === areaId ? null : { kind: "area", id: areaId }
    );
  };

  const browseTitle =
    browseFilter?.kind === "type"
      ? JOURNAL_FREQUENT_CARDS.find((c) => c.id === browseFilter.id)?.title ?? "Inhalte"
      : browseFilter?.kind === "area"
        ? knowledgeAreas.find((a) => a.id === browseFilter.id)?.label ?? "Bereich"
        : null;

  return (
    <div className="yd-journal-v6 yd-journal-pk yd-clinical-brand flex min-h-0 flex-1 flex-col overflow-auto">
      <div
        className={`yd-journal-pk__frame ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
      >
        {actionError ? (
          <div className="yd-journal-pk__error" role="alert">
            {actionError}
          </div>
        ) : null}

        <header className="yd-journal-pk__head">
          <div className="yd-journal-pk__head-row">
            <div className="min-w-0">
              <h1 className="yd-journal-pk__title">Journal</h1>
              <p className="yd-journal-pk__subtitle">Patientenwissen Ihrer Praxis</p>
              <p className="yd-journal-pk__lead">
                Antworten, Nachsorge und Erklärungen für häufige Fragen.
              </p>
            </div>
            <button
              type="button"
              className="yd-journal-pk__new hidden md:inline-flex"
              disabled={isBusy}
              onClick={() => router.push("/journal/new")}
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Neuer Text
            </button>
          </div>
        </header>

        <section className="yd-journal-pk__search-section" aria-label="Suche">
          <label className="yd-journal-pk__search" htmlFor="journal-pk-search">
            <span className="yd-journal-pk__search-label">Wonach suchen Sie?</span>
            <span className="yd-journal-pk__search-field">
              <Search className="yd-journal-pk__search-icon" strokeWidth={1.75} aria-hidden />
              <input
                id="journal-pk-search"
                type="search"
                className="yd-journal-pk__search-input"
                placeholder="Patientenfrage oder Thema …"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setBrowseFilter(null);
                }}
                autoComplete="off"
              />
            </span>
          </label>
        </section>

        {hasSearch ? (
          <section className="yd-journal-pk__section" aria-label="Suchergebnisse">
            <h2 className="yd-journal-pk__section-title">Suchergebnisse</h2>
            {searchResults.length === 0 ? (
              <p className="yd-journal-pk__empty-search">
                Keine Treffer — anderen Begriff versuchen oder neuen Text anlegen.
              </p>
            ) : (
              <ul className="yd-journal-pk__recent-list">
                {searchResults.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="yd-journal-pk__recent-row"
                      onClick={() => openEditor(entry.id)}
                    >
                      <span className="yd-journal-pk__recent-main">
                        <span className="yd-journal-pk__recent-title">
                          {journalEntryTitle(entry)}
                        </span>
                        <span className="yd-journal-pk__recent-meta">
                          {getContentTypeLabel(inferContentType(entry))} ·{" "}
                          {entry.status === "draft" ? "Entwurf" : "Veröffentlicht"}
                        </span>
                      </span>
                      <span className="yd-journal-pk__recent-time">
                        {formatLastUpdatedLabel(entry.updated_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            <section className="yd-journal-pk__section" aria-label="Häufig genutzt">
              <h2 className="yd-journal-pk__section-title">Häufig genutzt</h2>
              <div className="yd-journal-pk__frequent-grid">
                {frequentCards.map((card) => {
                  const Icon = FREQUENT_ICONS[card.id];
                  const active =
                    browseFilter?.kind === "type" && browseFilter.id === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={cn(
                        "yd-journal-pk__frequent-card",
                        active && "yd-journal-pk__frequent-card--active"
                      )}
                      onClick={() => toggleBrowseType(card.id)}
                    >
                      <span className="yd-journal-pk__frequent-icon" aria-hidden>
                        <Icon className="h-5 w-5" strokeWidth={1.65} />
                      </span>
                      <span className="yd-journal-pk__frequent-count">{card.count}</span>
                      <span className="yd-journal-pk__frequent-label">{card.title}</span>
                      <span className="yd-journal-pk__frequent-hint">{card.hint}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {openItems.length > 0 ? (
              <section className="yd-journal-pk__section" aria-label="Benötigt Aufmerksamkeit">
                <h2 className="yd-journal-pk__section-title">Benötigt Aufmerksamkeit</h2>
                <ul className="yd-journal-pk__attention-list">
                  {openItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="yd-journal-pk__attention-row"
                        disabled={isBusy}
                        onClick={() => handleOpenItem(item)}
                      >
                        <AlertCircle className="yd-journal-pk__attention-icon" strokeWidth={1.75} aria-hidden />
                        <span className="yd-journal-pk__attention-label">{item.label}</span>
                        <ChevronRight className="yd-journal-pk__attention-chevron" strokeWidth={1.75} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="yd-journal-pk__section" aria-label="Wissensbereiche">
              <h2 className="yd-journal-pk__section-title">Wissensbereiche</h2>
              <div className="yd-journal-v6__areas">
                {knowledgeAreas.map((area) => {
                  const active =
                    browseFilter?.kind === "area" && browseFilter.id === area.id;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      className={cn(
                        "yd-journal-v6__area-card",
                        active && "yd-journal-v6__area-card--active",
                        area.count === 0 && "yd-journal-v6__area-card--empty"
                      )}
                      onClick={() => toggleBrowseArea(area.id)}
                    >
                      <span className="yd-journal-v6__area-card-top">
                        <span className="yd-journal-v6__area-name">{area.label}</span>
                        <span className="yd-journal-v6__area-count">
                          {area.count} {area.count === 1 ? "Text" : "Texte"}
                        </span>
                      </span>
                      <span className="yd-journal-v6__area-meter" aria-hidden>
                        <span
                          className="yd-journal-v6__area-meter-fill"
                          style={{ width: `${area.coveragePct}%` }}
                        />
                      </span>
                      <span className="yd-journal-v6__area-coverage">{area.gapHint}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {browseFilter && browseTitle ? (
              <section className="yd-journal-pk__section yd-journal-pk__browse" aria-label={browseTitle}>
                <div className="yd-journal-pk__browse-head">
                  <h2 className="yd-journal-pk__browse-title">{browseTitle}</h2>
                  <button
                    type="button"
                    className="yd-journal-pk__browse-close"
                    onClick={() => setBrowseFilter(null)}
                  >
                    Schließen
                  </button>
                </div>
                {browseEntries.length > 0 ? (
                  <ul className="yd-journal-pk__recent-list">
                    {browseEntries.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="yd-journal-pk__recent-row"
                          onClick={() => openEditor(entry.id)}
                        >
                          <span className="yd-journal-pk__recent-main">
                            <span className="yd-journal-pk__recent-title">
                              {journalEntryTitle(entry)}
                            </span>
                          </span>
                          <span className="yd-journal-pk__recent-time">
                            {formatLastUpdatedLabel(entry.updated_at)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="yd-tracker-empty yd-journal-pk__browse-empty">
                    <p className="yd-tracker-empty__title">Noch keine Inhalte</p>
                    <p className="yd-tracker-empty__text">
                      {browseFilter.kind === "type"
                        ? journalSectionEmptyCopy(browseFilter.id)
                        : "In diesem Bereich sind noch keine Texte veröffentlicht."}
                    </p>
                    <button
                      type="button"
                      className="yd-journal-pk__section-empty-cta"
                      disabled={isBusy}
                      onClick={() => router.push("/journal/new")}
                    >
                      Text anlegen
                    </button>
                  </div>
                )}
              </section>
            ) : null}

            <section className="yd-journal-pk__section" aria-label="Zuletzt bearbeitet">
              <h2 className="yd-journal-pk__section-title">Zuletzt bearbeitet</h2>
              {recentlyEdited.length === 0 ? (
                <div className="yd-tracker-empty yd-journal-pk__recent-empty">
                  <p className="yd-tracker-empty__title">Noch keine Texte</p>
                  <p className="yd-tracker-empty__text">
                    Ihre zuletzt bearbeiteten Inhalte erscheinen hier — ruhig und übersichtlich.
                  </p>
                </div>
              ) : (
                <ul className="yd-journal-pk__recent-list">
                  {recentlyEdited.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="yd-journal-pk__recent-row"
                        onClick={() => openEditor(entry.id)}
                      >
                        <span className="yd-journal-pk__recent-main">
                          <span className="yd-journal-pk__recent-title">
                            {journalEntryTitle(entry)}
                          </span>
                          <span className="yd-journal-pk__recent-meta">
                            {entry.status === "draft" ? (
                              <>
                                <FileEdit className="inline h-3 w-3 opacity-70" aria-hidden />
                                {" Entwurf"}
                              </>
                            ) : (
                              getContentTypeLabel(inferContentType(entry))
                            )}
                          </span>
                        </span>
                        <span className="yd-journal-pk__recent-time">
                          {formatLastUpdatedLabel(entry.updated_at)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <div className="yd-journal-pk__mobile-new md:hidden">
          <button
            type="button"
            className="yd-journal-pk__mobile-new-btn"
            disabled={isBusy}
            onClick={() => router.push("/journal/new")}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            Neuer Text
          </button>
        </div>
      </div>
    </div>
  );
}
