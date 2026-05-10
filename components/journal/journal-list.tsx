"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { createDraftArticle, deleteArticle } from "@/app/(protected)/journal/actions";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

interface JournalListProps {
  entries: JournalEntry[];
}

export function JournalList({ entries }: JournalListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const currentView = searchParams.get("view") || "all";

  const handleNew = () => {
    startTransition(async () => {
      const result = await createDraftArticle();
      if (result.id) router.push(`/journal/${result.id}/edit`);
    });
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    startTransition(async () => {
      setDeletingId(id);
      await deleteArticle(id);
      setDeletingId(null);
      setConfirmDeleteId(null);
      router.refresh();
    });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const filteredEntries = entries.filter((entry) => {
    if (currentView === "drafts") return entry.status === "draft";
    if (currentView === "published") return entry.status === "published";
    if (currentView === "scheduled") {
      return (
        entry.status === "published" &&
        !!entry.published_at &&
        new Date(entry.published_at).getTime() > Date.now()
      );
    }
    return true;
  });

  return (
    <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
      <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <div className="mb-3 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Journal
        </div>
        <h1 className="mb-4 font-serif text-4xl font-light text-slate-900 dark:text-white md:text-5xl">
          Artikel
        </h1>
        <p className="mb-6 max-w-2xl text-slate-600 dark:text-slate-400">
          Schreiben und veröffentlichen Sie Fachartikel für Ihre Patienten.
        </p>
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Ansicht:{" "}
            {currentView === "drafts"
              ? "Entwürfe"
              : currentView === "published"
                ? "Veröffentlicht"
                : currentView === "scheduled"
                  ? "Geplant"
                  : "Alle Artikel"}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {filteredEntries.length} Einträge
          </span>
        </div>
        <button
          type="button"
          onClick={handleNew}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Plus className="h-4 w-4" />
          Neuer Artikel
        </button>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            Noch keine Artikel
          </h2>
          <p className="mx-auto mb-6 max-w-md text-slate-600 dark:text-slate-400">
            Beginnen Sie mit Ihrem ersten Artikel — ein Thema, eine klare Stimme.
          </p>
          <button
            type="button"
            onClick={handleNew}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Plus className="h-4 w-4" />
            Ersten Artikel schreiben
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-200 dark:border-slate-800 dark:divide-slate-800 dark:bg-slate-900">
          {filteredEntries.map((e) => {
            const topic = getTopicLabel(e.topic);
            const isDeleting = deletingId === e.id;
            const isConfirming = confirmDeleteId === e.id;
            return (
              <div
                key={e.id}
                className="group relative transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/journal/${e.id}/edit`} className="block group/link">
                      <h3 className="mb-2 text-base font-medium text-slate-900 transition-colors group-hover/link:text-slate-700 dark:text-white dark:group-hover/link:text-slate-300">
                        {e.title ? (
                          e.title
                        ) : (
                          <span className="italic text-slate-500 dark:text-slate-400">
                            Ohne Titel
                          </span>
                        )}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          e.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {e.status === "published" ? "Veröffentlicht" : "Entwurf"}
                      </span>

                      {topic && (
                        <span className="text-slate-600 dark:text-slate-400">{topic}</span>
                      )}

                      <span>{e.word_count} Wörter</span>
                      <span>{formatDate(e.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirming && (
                      <span className="mr-2 text-xs text-red-600 dark:text-red-400">
                        Artikel wirklich löschen?
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      disabled={isDeleting}
                      className={`rounded-lg p-2 opacity-0 transition-all disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100 ${
                        isConfirming
                          ? "opacity-100 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                          : "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      }`}
                      aria-label="Artikel löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
