"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createDraftArticle, saveArticle } from "@/app/(protected)/journal/actions";
import {
  type ClinicalAreaId,
  getClinicalAreaStats,
  groupPublishedByClinicalArea,
} from "@/lib/journal/clinical-areas";
import { getContentTypeLabel, inferContentType } from "@/lib/journal/content-categories";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import { getNextActions, type NextAction } from "@/lib/journal/next-actions";
import { getRecommendedTopicsMissing } from "@/lib/journal/recommended-topics";
import {
  formatDraftCount,
  formatLastUpdatedLabel,
  formatLastWorkspaceUpdate,
  formatPublishedCount,
  formatReadingTime,
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

export function JournalKnowledgeCenter({ initialEntries }: JournalKnowledgeCenterProps) {
  const router = useRouter();
  const [focusArea, setFocusArea] = useState<ClinicalAreaId | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = useMemo(() => journalWorkspaceStats(initialEntries), [initialEntries]);
  const areaStats = useMemo(() => getClinicalAreaStats(initialEntries), [initialEntries]);
  const faqTopics = useMemo(
    () => getRecommendedTopicsMissing(initialEntries, 6),
    [initialEntries]
  );
  const libraryGroups = useMemo(
    () => groupPublishedByClinicalArea(initialEntries, focusArea),
    [initialEntries, focusArea]
  );
  const nextActions = useMemo(() => getNextActions(initialEntries, 5), [initialEntries]);

  const drafts = useMemo(
    () =>
      initialEntries
        .filter((e) => e.status === "draft")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [initialEntries]
  );

  const metaParts = [
    formatPublishedCount(stats.publishedCount),
    stats.coveredAreas > 0
      ? `${stats.coveredAreas} ${stats.coveredAreas === 1 ? "Themenbereich" : "Themenbereiche"}`
      : null,
    formatDraftCount(stats.draftCount) || null,
    stats.lastUpdate ? formatLastWorkspaceUpdate(stats.lastUpdate) : null,
  ].filter(Boolean);

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
        router.push("/journal/new");
        break;
      case "create_article":
        router.push("/journal/new");
        break;
    }
  };

  const handleAreaClick = (id: ClinicalAreaId) => {
    setFocusArea((prev) => (prev === id ? null : id));
  };

  return (
    <div className="yd-journal-v6 flex min-h-0 flex-1 flex-col overflow-auto">
      <div className={`yd-journal-v6__frame ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        {actionError ? (
          <div className="yd-journal-v6__error" role="alert">
            {actionError}
          </div>
        ) : null}

        <header className="yd-journal-v6__hero">
          <p className="yd-journal-v6__eyebrow">Praxiswissen</p>
          <h1 className="yd-journal-v6__title">Journal</h1>
          <p className="yd-journal-v6__tagline">
            Das Wissen Ihrer Praxis für Patienten.
            <br />
            Verständliche Erklärungen. Nachsorge. Antworten auf häufige Fragen.
          </p>
          <p className="yd-journal-v6__meta">{metaParts.join(" · ")}</p>
        </header>

        <div className="yd-journal-v6__body">
          <main className="yd-journal-v6__main">
            <section aria-label="Themenbereiche">
              <p className="yd-journal-v6__section-label">Themenbereiche</p>
              <h2 className="yd-journal-v6__section-title">Ihre Wissenslandschaft</h2>
              <p className="yd-journal-v6__section-copy">
                Wo Ihre Praxis Patienten informiert — und wo noch Potenzial liegt.
              </p>
              <nav className="yd-journal-v6__areas" aria-label="Klinische Themenbereiche">
                {areaStats.map((area) => {
                  const isActive = focusArea === area.id;
                  const isEmpty = area.count === 0;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      className={`yd-journal-v6__area${isActive ? " yd-journal-v6__area--active" : ""}${isEmpty ? " yd-journal-v6__area--empty" : ""}`}
                      onClick={() => handleAreaClick(area.id)}
                      aria-pressed={isActive}
                    >
                      <span className="yd-journal-v6__area-name">{area.label}</span>
                      <span
                        className={`yd-journal-v6__area-count${isEmpty ? " yd-journal-v6__area-count--gap" : ""}`}
                      >
                        {isEmpty
                          ? "Noch nicht abgedeckt"
                          : `${area.count} ${area.count === 1 ? "Inhalt" : "Inhalte"}`}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </section>

            <section aria-label="Häufige Patientenfragen">
              <p className="yd-journal-v6__section-label">Patienten fragen häufig</p>
              <h2 className="yd-journal-v6__section-title">Einmal beantworten — dauerhaft da</h2>
              <p className="yd-journal-v6__section-copy">
                Diese Fragen hören Sie oft in der Praxis. Jede Antwort stärkt Ihre Bibliothek.
              </p>
              {faqTopics.length > 0 ? (
                <ul className="yd-journal-v6__faq-list">
                  {faqTopics.map((topic) => (
                    <li key={topic.title} className="yd-journal-v6__faq-item">
                      <button
                        type="button"
                        className="yd-journal-v6__faq-btn"
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
                        <p className="yd-journal-v6__faq-q">{topic.title}</p>
                        <span className="yd-journal-v6__faq-cta">Antwort erstellen</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="yd-journal-v6__empty">
                  <p className="yd-journal-v6__empty-copy">
                    Alle empfohlenen Fragen sind beantwortet. Pflegen Sie bestehende Artikel oder
                    ergänzen Sie neue Themenbereiche.
                  </p>
                </div>
              )}
            </section>

            <section className="yd-journal-v6__library" aria-label="Bibliothek">
              <p className="yd-journal-v6__section-label">Bibliothek</p>
              <h2 className="yd-journal-v6__section-title">
                {focusArea
                  ? areaStats.find((a) => a.id === focusArea)?.label ?? "Bibliothek"
                  : "Veröffentlichte Inhalte"}
              </h2>
              {focusArea ? (
                <button
                  type="button"
                  className="mb-4 text-[0.75rem] font-medium text-[rgba(26,45,74,0.45)] underline-offset-2 hover:underline"
                  onClick={() => setFocusArea(null)}
                >
                  Alle Bereiche anzeigen
                </button>
              ) : null}

              {libraryGroups.length > 0 ? (
                libraryGroups.map((group) => (
                  <div key={group.area.id} className="yd-journal-v6__library-group">
                    {!focusArea ? (
                      <h3 className="yd-journal-v6__library-area">{group.area.label}</h3>
                    ) : null}
                    <ul className="yd-journal-v6__articles">
                      {group.entries.map((entry) => {
                        const contentType = inferContentType(entry);
                        return (
                          <li key={entry.id} className="yd-journal-v6__article">
                            <button
                              type="button"
                              className="yd-journal-v6__article-btn"
                              onClick={() => openEditor(entry.id)}
                            >
                              <p className="yd-journal-v6__article-title">
                                {journalEntryTitle(entry)}
                              </p>
                              <div className="yd-journal-v6__article-meta">
                                <span className="yd-journal-v6__article-type">
                                  {getContentTypeLabel(contentType)}
                                </span>
                                <span>{formatReadingTime(entry.reading_time_minutes)}</span>
                                <span>
                                  Zuletzt aktualisiert{" "}
                                  {formatLastUpdatedLabel(entry.updated_at)}
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="yd-journal-v6__empty">
                  <p className="yd-journal-v6__empty-title">
                    {focusArea
                      ? areaStats.find((a) => a.id === focusArea)?.gapHint
                      : "Beginnen Sie mit dem ersten Wissensartikel Ihrer Praxis."}
                  </p>
                  <p className="yd-journal-v6__empty-copy">
                    {focusArea
                      ? "Patienten fragen häufig nach diesem Thema — eine Antwort macht den Unterschied."
                      : "Wählen Sie eine häufige Patientenfrage oben oder legen Sie direkt einen Artikel an."}
                  </p>
                </div>
              )}
            </section>

            {drafts.length > 0 ? (
              <section className="yd-journal-v6__drafts" aria-label="Entwürfe">
                <div className="yd-journal-v6__drafts-head">
                  <h2 className="yd-journal-v6__drafts-title">
                    {drafts.length} {drafts.length === 1 ? "Entwurf" : "Entwürfe"} in Arbeit
                  </h2>
                </div>
                <ul className="yd-journal-v6__drafts-list">
                  {drafts.slice(0, 3).map((entry) => (
                    <li key={entry.id} className="yd-journal-v6__draft-item">
                      <button
                        type="button"
                        className="yd-journal-v6__draft-btn"
                        onClick={() => openEditor(entry.id)}
                      >
                        <span>{journalEntryTitle(entry)}</span>
                        <span>Fortsetzen</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </main>

          <aside className="yd-journal-v6__next" aria-label="Empfohlen als Nächstes">
            <div className="yd-journal-v6__next-card">
              <h2 className="yd-journal-v6__next-title">Empfohlen als Nächstes</h2>
              <ul className="yd-journal-v6__next-list">
                {nextActions.map((action) => (
                  <li key={action.id} className="yd-journal-v6__next-item">
                    <button
                      type="button"
                      className="yd-journal-v6__next-btn"
                      disabled={isBusy && action.kind === "answer_faq"}
                      onClick={() => handleNextAction(action)}
                    >
                      <p className="yd-journal-v6__next-label">{action.label}</p>
                      <p className="yd-journal-v6__next-desc">{action.description}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
