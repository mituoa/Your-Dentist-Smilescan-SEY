"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  FileEdit,
  FileText,
  Plus,
  Search,
  Sparkles,
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
  formatLastUpdatedLabel,
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

const PATIENT_FACING_TYPES: JournalContentType[] = ["faq", "nachsorge"];

const LIBRARY_FILTER_OPTIONS: { id: "all" | JournalContentType; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "faq", label: "FAQ" },
  { id: "nachsorge", label: "Nachsorge" },
  { id: "erklaerung", label: "Erklärung" },
  { id: "praxiswissen", label: "Praxiswissen" },
];

const CONTENT_TYPE_ORDER: Record<JournalContentType, number> = {
  faq: 0,
  nachsorge: 1,
  erklaerung: 2,
  praxiswissen: 3,
};

const DOCTOR_JOURNAL_TYPES: JournalContentType[] = ["erklaerung", "praxiswissen"];

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
    return entries.sort((a, b) => {
      const typeDiff =
        CONTENT_TYPE_ORDER[inferContentType(a)] - CONTENT_TYPE_ORDER[inferContentType(b)];
      if (typeDiff !== 0) return typeDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [initialEntries, focusArea, libraryFilter, searchQuery]);

  const doctorJournalEntries = useMemo(
    () =>
      initialEntries
        .filter(
          (e) =>
            e.status === "published" && DOCTOR_JOURNAL_TYPES.includes(inferContentType(e))
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 6),
    [initialEntries]
  );

  const drafts = useMemo(
    () =>
      initialEntries
        .filter((e) => e.status === "draft")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [initialEntries]
  );

  const doctorDrafts = useMemo(
    () =>
      drafts.filter((e) => DOCTOR_JOURNAL_TYPES.includes(inferContentType(e))),
    [drafts]
  );

  const patientQuestionDrafts = useMemo(
    () =>
      drafts.filter((e) => PATIENT_FACING_TYPES.includes(inferContentType(e))),
    [drafts]
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

  const searchField = (
    <JournalSearchField
      id="journal-hub-search"
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="Antworten suchen…"
    />
  );

  const openKiAssist = () => {
    if (assist?.openCommand) {
      assist.openCommand();
      return;
    }
    router.push("/settings");
  };

  return (
    <div className="yd-journal-v6 yd-journal-v6--hub yd-journal-v6--premium yd-journal-v6--clinical yd-journal-v6--care-hub yd-clinical-brand yd-clinical-control flex min-h-0 flex-1 flex-col overflow-auto">
      <div className={`yd-journal-v6__frame ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        {actionError ? (
          <div className="yd-journal-v6__error" role="alert">
            {actionError}
          </div>
        ) : null}

        <div className="yd-journal-v6__canvas">
        <header className="yd-cc-hub__header">
          <div className="yd-cc-hub__header-main">
            <div className="yd-cc-hub__header-actions yd-cc-hub__header-actions--solo">
              <button
                type="button"
                className="yd-journal-v6__action yd-journal-v6__action--primary yd-cc-hub__action-primary"
                disabled={isBusy}
                onClick={() => router.push("/journal/new")}
              >
                <Plus className="yd-journal-v6__action-icon" strokeWidth={1.5} aria-hidden />
                Neue Antwort
              </button>
            </div>
          </div>
          <div className="yd-cc-hub__header-bar">
            <div className="yd-cc-hub__stats-pills yd-cc-hub__stats-pills--compact" aria-label="Überblick">
              <span className="yd-cc-hub__stats-pill">
                <strong>{stats.publishedCount}</strong> live
              </span>
              <span className="yd-cc-hub__stats-pill">
                <strong>{stats.draftCount}</strong> Entwürfe
              </span>
              <span className="yd-cc-hub__stats-pill">
                <strong>{stats.coveredAreas}</strong>/{stats.totalAreas} Bereiche
              </span>
            </div>
            <div className="yd-cc-hub__header-search">{searchField}</div>
          </div>
        </header>

        <div className="yd-journal-v6__body yd-cc-hub__body">
          <section
            className="yd-journal-v6__section yd-journal-v6__panel yd-cc-hub__zone"
            aria-label={JOURNAL_SECTION_COPY.questionsColumn.tag}
          >
            <div className="yd-journal-v6__block-head">
              <h2 className="yd-journal-v6__block-title yd-journal-v6__block-title--large">
                {JOURNAL_SECTION_COPY.questionsColumn.title}
              </h2>
              <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.questionsColumn.lead}</p>
            </div>

            <div className="yd-cc-hub__ki-card" aria-label="Patienten-KI">
              <div className="yd-cc-hub__ki-card-main">
                <Sparkles className="yd-cc-hub__ki-card-icon" strokeWidth={1.5} aria-hidden />
                <div className="yd-cc-hub__ki-card-copy">
                  <p className="yd-cc-hub__ki-card-title">
                    {JOURNAL_KI.title}
                    <span
                      className={cn(
                        "yd-cc-hub__ki-card-badge",
                        kiReady && "yd-cc-hub__ki-card-badge--active"
                      )}
                    >
                      {kiReady ? JOURNAL_KI.badgeActive : JOURNAL_KI.badgeSetup}
                    </span>
                  </p>
                  <p className="yd-cc-hub__ki-card-summary">
                    {kiReady ? JOURNAL_KI.summary : JOURNAL_KI.emptyHint}
                  </p>
                  <p className="yd-cc-hub__ki-card-safety">{JOURNAL_KI.safetyLine}</p>
                </div>
              </div>
              <button
                type="button"
                className="yd-cc-hub__ki-card-cta"
                onClick={kiReady ? openKiAssist : () => router.push("/journal/new")}
              >
                {kiReady ? JOURNAL_KI.ctaActive : JOURNAL_KI.ctaSetup}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>

            {priorityTopics.length > 0 ? (
              <ol className="yd-cc-hub__faq-list">
                {priorityTopics.map((topic, index) => (
                  <li key={topic.title}>
                    <button
                      type="button"
                      className="yd-cc-hub__faq-row"
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
                      <span className="yd-cc-hub__faq-rank" aria-hidden>
                        {index + 1}
                      </span>
                      <span className="yd-cc-hub__faq-body">
                        <span className="yd-cc-hub__faq-q">{topic.title}</span>
                        <span className="yd-cc-hub__faq-hint">{topic.hint}</span>
                      </span>
                      <span className="yd-cc-hub__faq-cta">
                        Antwort erstellen
                        <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="yd-journal-v6__empty-copy">
                Alle priorisierten Fragen sind beantwortet — Patienten finden die Antworten online.
              </p>
            )}

            {patientQuestionDrafts.length > 0 ? (
              <div className="yd-cc-hub__zone-sub">
                <h3 className="yd-cc-hub__zone-subtitle">Antworten in Arbeit</h3>
                <ul className="yd-journal-v6__draft-list">
                  {patientQuestionDrafts.map((entry) => (
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
                            {formatLastUpdatedLabel(entry.updated_at)}
                          </span>
                        </span>
                        <ChevronRight className="yd-journal-v6__draft-row-chevron" strokeWidth={1.75} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section
            className="yd-journal-v6__section yd-journal-v6__panel yd-cc-hub__zone"
            aria-label={JOURNAL_SECTION_COPY.doctorJournal.title}
          >
            <div className="yd-journal-v6__block-head yd-journal-v6__block-head--row">
              <div>
                <h2 className="yd-journal-v6__block-title yd-journal-v6__block-title--large">
                  {JOURNAL_SECTION_COPY.doctorJournal.title}
                </h2>
                <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.doctorJournal.lead}</p>
              </div>
              <button
                type="button"
                className="yd-cc-hub__zone-action"
                disabled={isBusy}
                onClick={() => router.push("/journal/new")}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {JOURNAL_SECTION_COPY.doctorJournal.newCta}
              </button>
            </div>

            {doctorJournalEntries.length > 0 ? (
              <ul className="yd-cc-hub__journal-list">
                {doctorJournalEntries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="yd-cc-hub__journal-row"
                      onClick={() => openEditor(entry.id)}
                    >
                      <FileText className="yd-cc-hub__journal-row-icon" strokeWidth={1.5} aria-hidden />
                      <span className="yd-cc-hub__journal-row-body">
                        <span className="yd-cc-hub__journal-row-title">
                          {journalEntryTitle(entry)}
                        </span>
                        <span className="yd-cc-hub__journal-row-meta">
                          {getContentTypeLabel(inferContentType(entry))} · {authorLabel}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-40" strokeWidth={1.75} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="yd-journal-v6__empty-copy">
                Noch keine Erklärungen oder Praxiswissen veröffentlicht — ideal für fachliche Texte
                und Behandlungserklärungen.
              </p>
            )}

            {doctorDrafts.length > 0 ? (
              <div className="yd-cc-hub__zone-sub">
                <h3 className="yd-cc-hub__zone-subtitle">
                  {JOURNAL_SECTION_COPY.doctorJournal.draftsTitle}
                </h3>
                <p className="yd-cc-hub__zone-subcopy">
                  {JOURNAL_SECTION_COPY.doctorJournal.draftsLead}
                </p>
                <ul className="yd-journal-v6__draft-list">
                    {doctorDrafts.map((entry) => (
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
                              {formatLastUpdatedLabel(entry.updated_at)}
                            </span>
                          </span>
                          <ChevronRight className="yd-journal-v6__draft-row-chevron" strokeWidth={1.75} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
          </section>

          <section
            className="yd-journal-v6__section yd-journal-v6__section--library yd-journal-v6__panel yd-cc-hub__library-full"
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

              <div className="yd-cc-hub__library-toolbar">
                <div className="yd-cc-hub__segments" role="tablist" aria-label="Inhaltstyp">
                  {LIBRARY_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="tab"
                      aria-selected={libraryFilter === option.id}
                      className={cn(
                        "yd-cc-hub__segment",
                        libraryFilter === option.id && "yd-cc-hub__segment--active"
                      )}
                      onClick={() => setLibraryFilter(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
                <ul className="yd-cc-hub__library-list">
                  {publishedEntries.map((entry) => {
                    const contentType = inferContentType(entry);
                    const areaLabel =
                      areaStats.find((a) => a.id === inferClinicalArea(entry))?.label ?? null;
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="yd-cc-hub__library-row"
                          onClick={() => openEditor(entry.id)}
                        >
                          <span className="yd-cc-hub__library-row-main">
                            <span className="yd-cc-hub__library-row-title">
                              {journalEntryTitle(entry)}
                            </span>
                            <span className="yd-cc-hub__library-row-meta">
                              {getContentTypeLabel(contentType)}
                              {areaLabel ? ` · ${areaLabel}` : ""}
                              {" · "}
                              {formatReadingShort(entry.reading_time_minutes)}
                            </span>
                          </span>
                          <span className="yd-cc-hub__library-row-date">
                            {formatLastUpdatedLabel(entry.updated_at)}
                          </span>
                          <ChevronRight
                            className="yd-cc-hub__library-row-chevron"
                            strokeWidth={1.75}
                            aria-hidden
                          />
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
            className="yd-journal-v6__section yd-journal-v6__section--areas yd-journal-v6__panel yd-cc-hub__areas-full"
            aria-label="Themenbereiche"
          >
            <div className="yd-journal-v6__block-head">
              <h2 className="yd-journal-v6__block-title">{JOURNAL_SECTION_COPY.landscape.title}</h2>
              <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.landscape.lead}</p>
            </div>
            <nav className="yd-cc-hub__areas" aria-label="Wissenslandschaft">
              {areaStats.map((area) => {
                const isActive = focusArea === area.id;
                const coverage = getAreaCoverage(area.id, initialEntries);
                return (
                  <button
                    key={area.id}
                    type="button"
                    className={cn(
                      "yd-cc-hub__area-row",
                      isActive && "yd-cc-hub__area-row--active",
                      area.count === 0 && "yd-cc-hub__area-row--empty"
                    )}
                    onClick={() => handleAreaClick(area.id)}
                    aria-pressed={isActive}
                  >
                    <span className="yd-cc-hub__area-name">{area.label}</span>
                    <span className="yd-cc-hub__area-meta">
                      {area.count > 0 ? `${area.count} Inhalte` : "Offen"}
                      {coverage.missing.length > 0 && area.count > 0
                        ? ` · ${coverage.missing[0]?.label} fehlt`
                        : null}
                    </span>
                    <span className="yd-cc-hub__area-meter" aria-hidden>
                      <span
                        className="yd-cc-hub__area-meter-fill"
                        style={{ width: `${coverage.percent}%` }}
                      />
                    </span>
                  </button>
                );
              })}
            </nav>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}
