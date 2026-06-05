"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

import {
  getContentTypeLabel,
  inferContentType,
  type JournalContentType,
} from "@/lib/journal/content-categories";
import {
  formatLastUpdatedLabel,
  journalEntryTitle,
} from "@/lib/journal/workspace-display";
import type { JournalEntry } from "@/lib/types/journal-entry";

const MOBILE_TABS: { id: JournalContentType; label: string }[] = [
  { id: "faq", label: "FAQ" },
  { id: "nachsorge", label: "Nachsorge" },
  { id: "erklaerung", label: "Erklärungen" },
  { id: "praxiswissen", label: "Praxiswissen" },
];

type JournalMobileHubProps = {
  initialEntries: JournalEntry[];
};

export function JournalMobileHub({ initialEntries }: JournalMobileHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JournalContentType>("faq");

  const published = useMemo(
    () =>
      initialEntries
        .filter((e) => e.status === "published")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [initialEntries]
  );

  const filtered = useMemo(
    () => published.filter((e) => inferContentType(e) === activeTab),
    [published, activeTab]
  );

  const latestDraft = useMemo(
    () =>
      initialEntries
        .filter((e) => e.status === "draft")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] ??
      null,
    [initialEntries]
  );

  return (
    <div className="yd-journal-mobile yd-clinical-brand flex min-h-0 flex-1 flex-col">
      <header className="yd-journal-mobile__head">
        <h1 className="yd-journal-mobile__title">Journal</h1>
        <p className="yd-journal-mobile__lead">
          Das Wissen Ihrer Praxis — Erklärungen, Nachsorge und Antworten für Patienten.
        </p>
      </header>

      {latestDraft ? (
        <button
          type="button"
          className="yd-journal-mobile__draft"
          onClick={() => router.push(`/journal/${latestDraft.id}/edit`)}
        >
          <span className="yd-journal-mobile__draft-body">
            <span className="yd-journal-mobile__draft-label">Entwurf fortsetzen</span>
            <span className="yd-journal-mobile__draft-title">{journalEntryTitle(latestDraft)}</span>
          </span>
          <ChevronRight className="yd-journal-mobile__draft-chevron" strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}

      <div className="yd-journal-mobile__tabs" role="tablist" aria-label="Inhaltstypen">
        {MOBILE_TABS.map((tab) => {
          const count = published.filter((e) => inferContentType(e) === tab.id).length;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`yd-journal-mobile__tab${active ? " yd-journal-mobile__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {count > 0 ? <span className="yd-journal-mobile__tab-count">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="yd-journal-mobile__list-wrap" role="tabpanel">
        {filtered.length > 0 ? (
          <ul className="yd-journal-mobile__list">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="yd-journal-mobile__article"
                  onClick={() => router.push(`/journal/${entry.id}/edit`)}
                >
                  <span className="yd-journal-mobile__article-type">
                    {getContentTypeLabel(inferContentType(entry))}
                  </span>
                  <span className="yd-journal-mobile__article-title">
                    {journalEntryTitle(entry)}
                  </span>
                  <span className="yd-journal-mobile__article-meta">
                    Aktualisiert {formatLastUpdatedLabel(entry.updated_at)}
                  </span>
                  <ChevronRight
                    className="yd-journal-mobile__article-chevron"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="yd-journal-mobile__empty">
            <p className="yd-journal-mobile__empty-title">
              Noch keine {getContentTypeLabel(activeTab)}-Inhalte
            </p>
            <p className="yd-journal-mobile__empty-copy">
              Legen Sie einen neuen Inhalt an — Ihre Patienten finden ihn im Praxisprofil.
            </p>
          </div>
        )}
      </div>

      <div className="yd-journal-mobile__footer">
        <button
          type="button"
          className="yd-journal-mobile__new"
          onClick={() => router.push("/journal/new")}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Neuer Inhalt
        </button>
      </div>
    </div>
  );
}
