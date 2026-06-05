"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

import { createDraftArticle, saveArticle } from "@/app/(protected)/journal/actions";
import {
  buildJournalOpenItems,
  buildJournalQuickAccess,
  groupPublishedByType,
  JOURNAL_SECTIONS,
  journalSectionEmptyCopy,
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
import type { JournalContentType } from "@/lib/journal/content-categories";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import { cn } from "@/lib/utils";

type JournalPatientKnowledgeProps = {
  initialEntries: JournalEntry[];
};

export function JournalPatientKnowledge({ initialEntries }: JournalPatientKnowledgeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<JournalContentType>("faq");
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const grouped = useMemo(
    () => groupPublishedByType(initialEntries, searchQuery),
    [initialEntries, searchQuery]
  );

  const quickAccess = useMemo(
    () => buildJournalQuickAccess(initialEntries),
    [initialEntries]
  );

  const openItems = useMemo(
    () => buildJournalOpenItems(initialEntries),
    [initialEntries]
  );

  const hasSearch = searchQuery.trim().length > 0;
  const totalVisible = JOURNAL_SECTIONS.reduce(
    (sum, section) => sum + grouped[section.id].length,
    0
  );

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

  const handleQuickAccess = (item: { entryId?: string; label: string }) => {
    if (item.entryId) {
      openEditor(item.entryId);
      return;
    }
    router.push("/journal/new");
  };

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
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </span>
          </label>
        </section>

        {openItems.length > 0 ? (
          <section className="yd-journal-pk__section" aria-label="Offene Inhalte">
            <h2 className="yd-journal-pk__section-title">Offene Inhalte</h2>
            <ul className="yd-journal-pk__open-list">
              {openItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="yd-journal-pk__open-row"
                    disabled={isBusy}
                    onClick={() => handleOpenItem(item)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {!hasSearch ? (
          <section className="yd-journal-pk__section" aria-label="Schnellzugriff">
            <h2 className="yd-journal-pk__section-title">Schnellzugriff</h2>
            <ul className="yd-journal-pk__quick-list">
              {quickAccess.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="yd-journal-pk__quick-row"
                    disabled={isBusy}
                    onClick={() => handleQuickAccess(item)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div
          className="yd-journal-pk__tabs md:hidden"
          role="tablist"
          aria-label="Patientenwissen"
        >
          {JOURNAL_SECTIONS.map((section) => {
            const count = grouped[section.id].length;
            const active = mobileTab === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn("yd-journal-pk__tab", active && "yd-journal-pk__tab--active")}
                onClick={() => setMobileTab(section.id)}
              >
                {section.title}
                {count > 0 ? <span className="yd-journal-pk__tab-count">{count}</span> : null}
              </button>
            );
          })}
        </div>

        <div className="yd-journal-pk__sections">
          {hasSearch && totalVisible === 0 ? (
            <p className="yd-journal-pk__empty-search">
              Keine Treffer — anderen Begriff versuchen oder neuen Text anlegen.
            </p>
          ) : null}

          {JOURNAL_SECTIONS.map((section) => {
            const entries = grouped[section.id];
            const hiddenOnMobile = mobileTab !== section.id;
            if (hasSearch && entries.length === 0) return null;

            return (
              <section
                key={section.id}
                className={cn(
                  "yd-journal-pk__section",
                  "yd-journal-pk__section--type",
                  hiddenOnMobile && "max-md:hidden"
                )}
                aria-label={section.title}
              >
                <div className="yd-journal-pk__section-head">
                  <h2 className="yd-journal-pk__section-title">{section.title}</h2>
                  <p className="yd-journal-pk__section-lead">{section.lead}</p>
                </div>

                {entries.length > 0 ? (
                  <ul className="yd-journal-pk__entry-list">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className="yd-journal-pk__entry-row"
                          onClick={() => openEditor(entry.id)}
                        >
                          <span className="yd-journal-pk__entry-title">
                            {journalEntryTitle(entry)}
                          </span>
                          <span className="yd-journal-pk__entry-meta">
                            {formatLastUpdatedLabel(entry.updated_at)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="yd-journal-pk__section-empty">
                    <p>{journalSectionEmptyCopy(section.id)}</p>
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
            );
          })}
        </div>

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
