"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  FileEdit,
  FileText,
  Inbox,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  UserRound,
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
import type { CareCenterPatientSignal } from "@/lib/queries/care-center-patient-signals";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import { cn } from "@/lib/utils";

export type JournalKnowledgeCenterProps = {
  initialEntries: JournalEntry[];
  authorLabel: string;
  publicSlug?: string | null;
  patientSignals?: CareCenterPatientSignal[];
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
  patientSignals = [],
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

  const patientFacingPublished = useMemo(
    () =>
      initialEntries
        .filter(
          (e) =>
            e.status === "published" && PATIENT_FACING_TYPES.includes(inferContentType(e))
        )
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5),
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
    <div className="yd-journal-v6 yd-journal-v6--hub yd-journal-v6--premium yd-journal-v6--clinical yd-journal-v6--care-hub yd-clinical-brand yd-clinical-control flex min-h-0 flex-1 flex-col overflow-auto">
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

        <header className="yd-journal-v6__hero yd-journal-v6__hero--primary hidden md:block">
          <div className="yd-journal-v6__hero-top">
            <div>
              <p className="yd-journal-v6__eyebrow">PRAXISWISSEN</p>
              <h1 className="yd-journal-v6__title">{JOURNAL_HUB.title}</h1>
              <p className="yd-journal-v6__essence">{JOURNAL_HUB.essence}</p>
            </div>
            <div className="yd-cc-hub__hero-stats" aria-label="Überblick">
              <div className="yd-cc-hub__hero-stat">
                <span className="yd-cc-hub__hero-stat-value">{stats.publishedCount}</span>
                <span className="yd-cc-hub__hero-stat-label">Veröffentlicht</span>
              </div>
              <div className="yd-cc-hub__hero-stat yd-cc-hub__hero-stat--amber">
                <span className="yd-cc-hub__hero-stat-value">{priorityTopics.length}</span>
                <span className="yd-cc-hub__hero-stat-label">Offene Fragen</span>
              </div>
              <div className="yd-cc-hub__hero-stat">
                <span className="yd-cc-hub__hero-stat-value">
                  {stats.coveredAreas}/{stats.totalAreas}
                </span>
                <span className="yd-cc-hub__hero-stat-label">Bereiche</span>
              </div>
              <div
                className={cn(
                  "yd-cc-hub__hero-stat",
                  kiReady && "yd-cc-hub__hero-stat--active"
                )}
              >
                <span className="yd-cc-hub__hero-stat-value">{kiReady ? "Aktiv" : "—"}</span>
                <span className="yd-cc-hub__hero-stat-label">Patienten-KI</span>
              </div>
            </div>
          </div>
        </header>

        <div className="yd-cc-hub__overview md:hidden" aria-label="Überblick">
          <div className="yd-cc-hub__stat">
            <span className="yd-cc-hub__stat-value">{stats.publishedCount}</span>
            <span className="yd-cc-hub__stat-label">Veröffentlicht</span>
          </div>
          <div className="yd-cc-hub__stat">
            <span className="yd-cc-hub__stat-value">{priorityTopics.length}</span>
            <span className="yd-cc-hub__stat-label">Offene Fragen</span>
          </div>
          <div className="yd-cc-hub__stat">
            <span className="yd-cc-hub__stat-value">
              {stats.coveredAreas}/{stats.totalAreas}
            </span>
            <span className="yd-cc-hub__stat-label">Bereiche</span>
          </div>
          <div className="yd-cc-hub__stat">
            <span
              className={cn(
                "yd-cc-hub__stat-value",
                kiReady && "yd-cc-hub__stat-value--active"
              )}
            >
              {kiReady ? "Aktiv" : "—"}
            </span>
            <span className="yd-cc-hub__stat-label">Patienten-KI</span>
          </div>
        </div>

        <div className="yd-journal-v6__body yd-cc-hub__body">
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

          <div className="yd-cc-hub__columns">
            <article
              className="yd-cc-hub__column yd-cc-hub__column--questions"
              aria-label={JOURNAL_SECTION_COPY.questionsColumn.tag}
            >
              <header className="yd-cc-hub__column-head">
                <span className="yd-cc-hub__column-tag">{JOURNAL_SECTION_COPY.questionsColumn.tag}</span>
                <h2 className="yd-journal-v6__block-title">{JOURNAL_SECTION_COPY.questionsColumn.title}</h2>
                <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.questionsColumn.lead}</p>
              </header>

              <div className="yd-cc-hub__ki-card" aria-label="Patienten-KI">
                <div className="yd-cc-hub__ki-card-main">
                  <Sparkles className="yd-cc-hub__ki-card-icon" strokeWidth={1.5} aria-hidden />
                  <div>
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
                <div className="yd-cc-hub__column-sub">
                  <h3 className="yd-cc-hub__column-subtitle">Antworten in Arbeit</h3>
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
            </article>

            <article
              className="yd-cc-hub__column yd-cc-hub__column--doctor"
              aria-label={JOURNAL_SECTION_COPY.doctorJournal.title}
            >
              <header className="yd-cc-hub__column-head yd-cc-hub__column-head--row">
                <div>
                  <span className="yd-cc-hub__column-tag yd-cc-hub__column-tag--doctor">Arzt-Journal</span>
                  <h2 className="yd-journal-v6__block-title">{JOURNAL_SECTION_COPY.doctorJournal.title}</h2>
                  <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.doctorJournal.lead}</p>
                </div>
                <button
                  type="button"
                  className="yd-cc-hub__column-action"
                  disabled={isBusy}
                  onClick={() => router.push("/journal/new")}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  {JOURNAL_SECTION_COPY.doctorJournal.newCta}
                </button>
              </header>

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
                <div className="yd-cc-hub__column-sub">
                  <h3 className="yd-cc-hub__column-subtitle">
                    {JOURNAL_SECTION_COPY.doctorJournal.draftsTitle}
                  </h3>
                  <p className="yd-cc-hub__column-subcopy">
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
            </article>

            <article
              className="yd-cc-hub__column yd-cc-hub__column--patient"
              aria-label={JOURNAL_SECTION_COPY.patientInfo.title}
            >
              <header className="yd-cc-hub__column-head">
                <span className="yd-cc-hub__column-tag yd-cc-hub__column-tag--patient">
                  Patienten-Informationen
                </span>
                <h2 className="yd-journal-v6__block-title">{JOURNAL_SECTION_COPY.patientInfo.title}</h2>
                <p className="yd-journal-v6__block-copy">{JOURNAL_SECTION_COPY.patientInfo.lead}</p>
              </header>

              <div className="yd-cc-hub__column-block">
                <h3 className="yd-cc-hub__column-subtitle">
                  {JOURNAL_SECTION_COPY.patientInfo.signalsTitle}
                </h3>
                <p className="yd-cc-hub__column-subcopy">
                  {JOURNAL_SECTION_COPY.patientInfo.signalsLead}
                </p>
                {patientSignals.length > 0 ? (
                  <ul className="yd-cc-hub__signal-list">
                    {patientSignals.map((signal) => (
                      <li key={signal.id}>
                        <Link href={`/inbox/${signal.id}`} className="yd-cc-hub__signal-row">
                          <UserRound className="yd-cc-hub__signal-icon" strokeWidth={1.5} aria-hidden />
                          <span className="yd-cc-hub__signal-body">
                            <span className="yd-cc-hub__signal-name">{signal.patientName}</span>
                            <span className="yd-cc-hub__signal-concern">{signal.concernLine}</span>
                          </span>
                          <span className="yd-cc-hub__signal-time">{signal.relativeTime}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="yd-journal-v6__empty-copy">
                    {JOURNAL_SECTION_COPY.patientInfo.signalsEmpty}
                  </p>
                )}
              </div>

              <div className="yd-cc-hub__column-block">
                <h3 className="yd-cc-hub__column-subtitle">
                  {JOURNAL_SECTION_COPY.patientInfo.publishedTitle}
                </h3>
                <p className="yd-cc-hub__column-subcopy">
                  {JOURNAL_SECTION_COPY.patientInfo.publishedLead}
                </p>
                {patientFacingPublished.length > 0 ? (
                  <ul className="yd-cc-hub__patient-list">
                    {patientFacingPublished.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="yd-cc-hub__patient-row"
                          onClick={() => openEditor(entry.id)}
                        >
                          <span className="yd-cc-hub__patient-row-title">
                            {journalEntryTitle(entry)}
                          </span>
                          <span className="yd-cc-hub__patient-row-meta">
                            {getContentTypeLabel(inferContentType(entry))}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-35" strokeWidth={1.75} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="yd-journal-v6__empty-copy">
                    {JOURNAL_SECTION_COPY.patientInfo.publishedEmpty}
                  </p>
                )}
              </div>

              <div className="yd-cc-hub__column-block yd-cc-hub__column-block--links">
                <h3 className="yd-cc-hub__column-subtitle">{JOURNAL_SECTION_COPY.quickLinks.title}</h3>
                <ul className="yd-cc-hub__quick-list yd-cc-hub__quick-list--compact">
                  <li>
                    <Link href="/inbox" className="yd-cc-hub__quick-link">
                      <Inbox className="yd-cc-hub__quick-icon" strokeWidth={1.5} aria-hidden />
                      <span className="yd-cc-hub__quick-label">
                        {JOURNAL_SECTION_COPY.quickLinks.tracker}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-35" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings?section=oeffnungszeiten" className="yd-cc-hub__quick-link">
                      <CalendarDays className="yd-cc-hub__quick-icon" strokeWidth={1.5} aria-hidden />
                      <span className="yd-cc-hub__quick-label">
                        {JOURNAL_SECTION_COPY.quickLinks.appointments}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-35" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/editor" className="yd-cc-hub__quick-link">
                      <ExternalLink className="yd-cc-hub__quick-icon" strokeWidth={1.5} aria-hidden />
                      <span className="yd-cc-hub__quick-label">
                        {JOURNAL_SECTION_COPY.quickLinks.profile}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-35" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </li>
                </ul>
              </div>
            </article>
          </div>

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
