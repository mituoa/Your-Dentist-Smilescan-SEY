"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Baby,
  ChevronRight,
  FileEdit,
  FilePlus,
  Layers,
  MessageCircle,
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
import {
  type ClinicalAreaId,
  getClinicalAreaStats,
  inferClinicalArea,
} from "@/lib/journal/clinical-areas";
import { getContentTypeLabel, inferContentType, type JournalContentType } from "@/lib/journal/content-categories";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import { getNextActions, type NextAction } from "@/lib/journal/next-actions";
import { getRecommendedTopicsMissing } from "@/lib/journal/recommended-topics";
import {
  formatDraftCount,
  formatLastUpdatedLabel,
  formatLastWorkspaceUpdate,
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

interface JournalKnowledgeCenterProps {
  initialEntries: JournalEntry[];
}

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

function nextActionIcon(action: NextAction): LucideIcon {
  switch (action.kind) {
    case "resume_draft":
      return PencilLine;
    case "answer_faq":
      return MessageCircle;
    case "fill_area":
    case "expand_area":
      return Plus;
    default:
      return FilePlus;
  }
}

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

export function JournalKnowledgeCenter({ initialEntries }: JournalKnowledgeCenterProps) {
  const router = useRouter();
  const [focusArea, setFocusArea] = useState<ClinicalAreaId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = useMemo(() => journalWorkspaceStats(initialEntries), [initialEntries]);
  const areaStats = useMemo(() => getClinicalAreaStats(initialEntries), [initialEntries]);
  const faqTopics = useMemo(
    () => getRecommendedTopicsMissing(initialEntries, 6),
    [initialEntries]
  );
  const nextActions = useMemo(() => getNextActions(initialEntries, 3), [initialEntries]);

  const answeredFaqCount = useMemo(
    () =>
      initialEntries.filter(
        (e) => e.status === "published" && inferContentType(e) === "faq"
      ).length,
    [initialEntries]
  );

  const heroStatsLine = useMemo(() => {
    const parts = [
      formatPublishedCount(stats.publishedCount),
      answeredFaqCount > 0
        ? answeredFaqCount === 1
          ? "1 beantwortete Frage"
          : `${answeredFaqCount} beantwortete Fragen`
        : null,
      stats.draftCount > 0 ? formatDraftCount(stats.draftCount) : null,
      stats.lastUpdate
        ? `Zuletzt aktualisiert ${formatLastWorkspaceUpdate(stats.lastUpdate).replace(/^Heute bearbeitet$/i, "heute").replace(/^Gestern bearbeitet$/i, "gestern")}`
        : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [stats, answeredFaqCount]);

  const publishedEntries = useMemo(() => {
    let entries = initialEntries.filter((e) => e.status === "published");
    if (focusArea) {
      entries = entries.filter((e) => inferClinicalArea(e) === focusArea);
    }
    if (searchQuery.trim()) {
      entries = entries.filter((e) => matchesSearch(e, searchQuery));
    }
    return entries.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [initialEntries, focusArea, searchQuery]);

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

  const handleNextAction = (action: NextAction) => {
    if (isBusy) return;
    switch (action.kind) {
      case "resume_draft":
        openEditor(action.entryId);
        break;
      case "answer_faq":
        void startArticle({
          title: action.topic.title,
          content: action.topic.content,
          clinicalArea: action.topic.clinicalArea,
          contentType: action.topic.contentType,
        });
        break;
      case "fill_area":
      case "expand_area":
      case "create_article":
        router.push("/journal/new");
        break;
    }
  };

  const handleAreaClick = (id: ClinicalAreaId) => {
    setFocusArea((prev) => (prev === id ? null : id));
  };

  const focusLabel = focusArea
    ? areaStats.find((a) => a.id === focusArea)?.label
    : null;

  const resumeDraft = drafts[0] ?? null;
  const resumeAction = nextActions.find((a) => a.kind === "resume_draft") ?? null;

  return (
    <div className="yd-journal-v6 yd-clinical-brand flex min-h-0 flex-1 flex-col overflow-auto">
      <div className={`yd-journal-v6__frame ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        {actionError ? (
          <div className="yd-journal-v6__error" role="alert">
            {actionError}
          </div>
        ) : null}

        {heroStatsLine ? (
          <header className="yd-journal-v6__hero">
            <p className="yd-journal-v6__stats-line">{heroStatsLine}</p>
          </header>
        ) : null}

        <div className="yd-journal-v6__body">
          <main className="yd-journal-v6__main">
            {resumeDraft || resumeAction ? (
              <section
                className="yd-journal-v6__section yd-journal-v6__section--resume md:hidden"
                aria-label="Entwurf fortsetzen"
              >
                <button
                  type="button"
                  className="yd-journal-v6__resume-card"
                  onClick={() => {
                    if (resumeAction?.kind === "resume_draft") {
                      openEditor(resumeAction.entryId);
                    } else if (resumeDraft) {
                      openEditor(resumeDraft.id);
                    }
                  }}
                >
                  <span className="yd-journal-v6__resume-icon" aria-hidden>
                    <PencilLine className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.65} />
                  </span>
                  <span className="yd-journal-v6__resume-body">
                    <span className="yd-journal-v6__resume-label">Entwurf fortsetzen</span>
                    <span className="yd-journal-v6__resume-title">
                      {resumeAction?.kind === "resume_draft"
                        ? resumeAction.label
                        : journalEntryTitle(resumeDraft!)}
                    </span>
                    {resumeDraft ? (
                      <span className="yd-journal-v6__resume-meta">
                        Zuletzt bearbeitet {formatLastUpdatedLabel(resumeDraft.updated_at)}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="yd-journal-v6__resume-chevron" strokeWidth={1.75} aria-hidden />
                </button>
              </section>
            ) : null}

            <section className="yd-journal-v6__section yd-journal-v6__section--search" aria-label="Suche">
              <label className="yd-journal-v6__search" htmlFor="journal-search">
                <Search className="yd-journal-v6__search-icon" strokeWidth={1.75} aria-hidden />
                <input
                  id="journal-search"
                  type="search"
                  className="yd-journal-v6__search-input"
                  placeholder="Inhalte durchsuchen …"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
              </label>
            </section>

            <section
              className="yd-journal-v6__section yd-journal-v6__section--library yd-journal-v6__block--featured"
              aria-label="Bibliothek"
            >
              <div className="yd-journal-v6__library-head">
                <div>
                  <h2 className="yd-journal-v6__block-title yd-journal-v6__block-title--large">
                    Ihre Bibliothek
                  </h2>
                  <p className="yd-journal-v6__block-copy">
                    Veröffentlichte Inhalte für Ihre Patienten
                    {focusLabel ? ` · ${focusLabel}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="yd-journal-v6__new-btn"
                  disabled={isBusy}
                  onClick={() => router.push("/journal/new")}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  Neuer Inhalt
                </button>
              </div>

              <div className="yd-journal-v6__library-filters">
                {focusArea ? (
                  <button
                    type="button"
                    className="yd-journal-v6__filter-chip yd-journal-v6__filter-chip--active"
                    onClick={() => setFocusArea(null)}
                  >
                    {focusLabel}
                    <span aria-hidden> ×</span>
                  </button>
                ) : (
                  <span className="yd-journal-v6__filter-hint">Alle Bereiche</span>
                )}
              </div>

              {publishedEntries.length > 0 ? (
                <ul className="yd-journal-v6__library-list">
                  {publishedEntries.map((entry) => {
                    const contentType = inferContentType(entry);
                    const areaLabel = areaStats.find(
                      (a) => a.id === inferClinicalArea(entry)
                    )?.label;
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="yd-journal-v6__library-row"
                          onClick={() => openEditor(entry.id)}
                        >
                          <div className="yd-journal-v6__library-row-main">
                            <div className="yd-journal-v6__library-row-meta">
                              <span>{getContentTypeLabel(contentType)}</span>
                              {areaLabel ? (
                                <>
                                  <span aria-hidden> · </span>
                                  <span>{areaLabel}</span>
                                </>
                              ) : null}
                            </div>
                            <p className="yd-journal-v6__library-row-title">
                              {journalEntryTitle(entry)}
                            </p>
                            <p className="yd-journal-v6__library-row-sub">
                              {formatReadingShort(entry.reading_time_minutes)}
                              <span aria-hidden> · </span>
                              Aktualisiert {formatLastUpdatedLabel(entry.updated_at)}
                            </p>
                          </div>
                          {entry.cover_photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={entry.cover_photo_url}
                              alt=""
                              className="yd-journal-v6__library-row-thumb"
                            />
                          ) : null}
                          <ArrowRight
                            className="yd-journal-v6__library-row-arrow"
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
                      ? "Keine Inhalte zu dieser Suche."
                      : focusArea
                        ? areaStats.find((a) => a.id === focusArea)?.gapHint
                        : "Hier entsteht das Wissen Ihrer Praxis."}
                  </p>
                  <p className="yd-journal-v6__empty-copy">
                    {searchQuery.trim()
                      ? "Anderen Suchbegriff versuchen oder Filter zurücksetzen."
                      : "Beginnen Sie mit einer häufigen Patientenfrage — oder legen Sie direkt einen Inhalt an."}
                  </p>
                </div>
              )}
            </section>

            <section
              className="yd-journal-v6__section yd-journal-v6__section--areas"
              aria-label="Wissensbereiche"
            >
              <div className="yd-journal-v6__block-head">
                <h2 className="yd-journal-v6__block-title">Wissensbereiche</h2>
                <p className="yd-journal-v6__block-copy">
                  Wo Ihre Praxis Patienten informiert — und was noch fehlt.
                </p>
              </div>
              <nav className="yd-journal-v6__areas" aria-label="Wissensbereiche">
                {areaStats.map((area) => {
                  const Icon = AREA_ICONS[area.id];
                  const isActive = focusArea === area.id;
                  const coverage = getAreaCoverage(area.id, initialEntries);
                  return (
                    <button
                      key={area.id}
                      type="button"
                      className={`yd-journal-v6__area-card${isActive ? " yd-journal-v6__area-card--active" : ""}${area.count === 0 ? " yd-journal-v6__area-card--empty" : ""}`}
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
                    </button>
                  );
                })}
              </nav>
            </section>

            <section
              className="yd-journal-v6__section yd-journal-v6__section--faq"
              aria-label="Patientenfragen"
            >
              <div className="yd-journal-v6__block-head">
                <h2 className="yd-journal-v6__block-title">Patienten fragen häufig</h2>
                <p className="yd-journal-v6__block-copy">
                  Das fragen Patienten ständig. Jede Antwort entlastet Ihr Team.
                </p>
              </div>
              {faqTopics.length > 0 ? (
                <ul className="yd-journal-v6__faq-list">
                  {faqTopics.map((topic) => (
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
                        <MessageCircle
                          className="yd-journal-v6__faq-row-icon"
                          strokeWidth={1.5}
                          aria-hidden
                        />
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
                  Alle empfohlenen Fragen sind beantwortet.
                </p>
              )}
            </section>

            {drafts.length > 0 ? (
              <section
                className="yd-journal-v6__section yd-journal-v6__section--drafts"
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

          {nextActions.length > 0 ? (
            <aside className="yd-journal-v6__rail hidden md:block" aria-label="Empfehlungen">
              <div className="yd-journal-v6__rail-inner">
                <h2 className="yd-journal-v6__rail-title">Als Nächstes</h2>
                <ul className="yd-journal-v6__rail-list">
                  {nextActions.map((action) => {
                    const Icon = nextActionIcon(action);
                    return (
                      <li key={action.id}>
                        <button
                          type="button"
                          className="yd-journal-v6__rail-link"
                          disabled={isBusy && action.kind === "answer_faq"}
                          onClick={() => handleNextAction(action)}
                        >
                          <Icon className="yd-journal-v6__rail-link-icon" strokeWidth={1.75} aria-hidden />
                          <span className="yd-journal-v6__rail-link-text">{action.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
