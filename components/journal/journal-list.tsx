"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { createDraftArticle, deleteArticle } from "@/app/(protected)/journal/actions";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/lib/queries/journal";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";

interface JournalListProps {
  entries: JournalEntry[];
}

export function JournalList({ entries }: JournalListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNew = () => {
    startTransition(async () => {
      const result = await createDraftArticle();
      if (result.id) router.push(`/journal/${result.id}/edit`);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Artikel wirklich löschen?")) return;
    startTransition(async () => {
      await deleteArticle(id);
      router.refresh();
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
            Journal
          </p>
          <h1 className="font-serif text-5xl font-light tracking-tight">Artikel</h1>
          <p className="text-text-secondary mt-2">
            Schreiben und veröffentlichen Sie Fachartikel für Ihre Patienten.
          </p>
        </div>
        <Button onClick={handleNew} disabled={isPending} size="lg">
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
          Neuer Artikel
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center bg-surface-card">
          <FileText
            className="w-10 h-10 text-text-tertiary mx-auto mb-4"
            strokeWidth={1.5}
          />
          <h2 className="font-serif text-2xl font-light mb-2">Noch keine Artikel</h2>
          <p className="text-text-secondary text-sm mb-6">
            Beginnen Sie mit Ihrem ersten Artikel — ein Thema, eine klare Stimme.
          </p>
          <Button onClick={handleNew} disabled={isPending}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
            Ersten Artikel schreiben
          </Button>
        </div>
      ) : (
        <div className="space-y-1 border-t border-border">
          {entries.map((e) => {
            const topic = getTopicLabel(e.topic);
            return (
              <div
                key={e.id}
                className="flex items-center gap-4 py-4 border-b border-border group"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/journal/${e.id}/edit`}
                    className="block hover:underline"
                  >
                    <h3 className="font-serif text-xl font-light truncate">
                      {e.title ? (
                        e.title
                      ) : (
                        <span className="italic text-text-tertiary">Ohne Titel</span>
                      )}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                        e.status === "published"
                          ? "bg-brand/10 text-brand"
                          : "bg-surface-sunken"
                      }`}
                    >
                      {e.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                    {topic && <span>{topic}</span>}
                    <span>{e.word_count} Wörter</span>
                    <span>
                      {new Date(e.updated_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-2 transition-all"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
