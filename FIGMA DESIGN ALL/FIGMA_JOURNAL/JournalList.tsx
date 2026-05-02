import * as React from "react";
import { Plus, FileText, Trash2 } from "lucide-react";

type ArticleStatus = "Veröffentlicht" | "Entwurf";

interface Article {
  id: string;
  title: string | null;
  status: ArticleStatus;
  topic: string | null;
  wordCount: number;
  publishedAt: Date | null;
  updatedAt: Date;
}

interface JournalListProps {
  articles: Article[];
  onCreateArticle: () => Promise<string>;
  onDeleteArticle: (id: string) => Promise<void>;
}

export function JournalList({ articles, onCreateArticle, onDeleteArticle }: JournalListProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newId = await onCreateArticle();
      window.location.href = `/journal/${newId}/edit`;
    } catch (error) {
      console.error("Failed to create article:", error);
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    setDeletingId(id);
    try {
      await onDeleteArticle(id);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Failed to delete article:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Journal
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-slate-900 dark:text-white mb-4">
          Artikel
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
          Schreiben und veröffentlichen Sie Fachartikel für Ihre Patienten.
        </p>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Neuer Artikel
        </button>
      </div>

      {/* Empty State */}
      {articles.length === 0 && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Noch keine Artikel
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Beginnen Sie mit Ihrem ersten Artikel — ein Thema, eine klare Stimme.
          </p>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Ersten Artikel schreiben
          </button>
        </div>
      )}

      {/* Article List */}
      {articles.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {articles.map((article) => {
            const isDeleting = deletingId === article.id;
            const isConfirming = confirmDeleteId === article.id;
            const displayDate = article.publishedAt || article.updatedAt;

            return (
              <div
                key={article.id}
                className="group relative hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/journal/${article.id}/edit`}
                      className="block group/link"
                    >
                      <h3 className="text-base font-medium text-slate-900 dark:text-white group-hover/link:text-slate-700 dark:group-hover/link:text-slate-300 transition-colors mb-2">
                        {article.title || <span className="italic text-slate-500 dark:text-slate-400">Ohne Titel</span>}
                      </h3>
                    </a>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          article.status === "Veröffentlicht"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {article.status}
                      </span>

                      {article.topic && (
                        <span className="text-slate-600 dark:text-slate-400">
                          {article.topic}
                        </span>
                      )}

                      <span>{article.wordCount} Wörter</span>

                      <span>{formatDate(displayDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirming && (
                      <span className="text-xs text-red-600 dark:text-red-400 mr-2">
                        Artikel wirklich löschen?
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={isDeleting}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${
                        isConfirming
                          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 opacity-100"
                          : "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-950/50"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      aria-label="Delete article"
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
  );
}
