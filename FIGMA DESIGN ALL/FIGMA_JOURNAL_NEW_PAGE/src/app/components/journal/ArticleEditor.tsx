import * as React from "react";
import { ArrowLeft, Check, AlertCircle, Upload, X } from "lucide-react";

type ArticleStatus = "draft" | "published";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  topic: string | null;
  coverUrl: string | null;
  status: ArticleStatus;
  updatedAt: Date;
}

interface ArticleEditorProps {
  article: Article;
  onSave: (updates: Partial<Article>) => Promise<void>;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  onUploadCover: (file: File) => Promise<string>;
}

const TOPICS = [
  "Prävention",
  "Behandlung",
  "Technologie",
  "Patient Care",
  "Forschung",
  "Team",
];

const TITLE_MAX = 100;
const EXCERPT_MAX = 280;

export function ArticleEditor({
  article,
  onSave,
  onPublish,
  onUnpublish,
  onUploadCover,
}: ArticleEditorProps) {
  const [title, setTitle] = React.useState(article.title);
  const [excerpt, setExcerpt] = React.useState(article.excerpt);
  const [content, setContent] = React.useState(article.content);
  const [topic, setTopic] = React.useState<string | null>(article.topic);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(article.coverUrl);

  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [lastSaved, setLastSaved] = React.useState<Date>(article.updatedAt);

  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishError, setPublishError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Autosave logic
  React.useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't autosave on initial mount
    if (
      title === article.title &&
      excerpt === article.excerpt &&
      content === article.content &&
      topic === article.topic
    ) {
      return;
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      setSaveError(null);

      try {
        await onSave({ title, excerpt, content, topic });
        setSaveStatus("saved");
        setLastSaved(new Date());

        // Reset to idle after 2s
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } catch (error) {
        setSaveStatus("error");
        setSaveError("Speichern fehlgeschlagen");
      }
    }, 1000); // 1s debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, excerpt, content, topic]);

  const handlePublish = async () => {
    // Validation
    if (!title.trim()) {
      setPublishError("Titel erforderlich");
      return;
    }
    if (!content.trim()) {
      setPublishError("Inhalt erforderlich");
      return;
    }
    if (!topic) {
      setPublishError("Thema erforderlich");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      await onPublish();
      setIsPublishing(false);
    } catch (error) {
      setIsPublishing(false);
      setPublishError("Veröffentlichung fehlgeschlagen");
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      await onUnpublish();
      setIsPublishing(false);
    } catch (error) {
      setIsPublishing(false);
      setPublishError("Aktion fehlgeschlagen");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Nur Bilddateien erlaubt");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Datei zu groß (max. 5MB)");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await onUploadCover(file);
      setCoverUrl(url);
      await onSave({ coverUrl: url });
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      setUploadError("Upload fehlgeschlagen");
    }
  };

  const handleRemoveCover = async () => {
    setCoverUrl(null);
    await onSave({ coverUrl: null });
  };

  const canPublish = title.trim() && content.trim() && topic && saveStatus !== "saving";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Fixed Dark Top Bar */}
      <div className="sticky top-0 z-20 bg-slate-900 dark:bg-slate-950 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Left: Back + Status */}
          <div className="flex items-center gap-4">
            <a
              href="/journal"
              className="p-2 -m-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Zurück zu Journals"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                  article.status === "published"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-slate-700 text-slate-300 border border-slate-600"
                }`}
              >
                {article.status === "published" ? "Veröffentlicht" : "Entwurf"}
              </span>

              {/* Save Status */}
              {saveStatus === "saving" && (
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
                  Speichern…
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-xs text-green-400 flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  Gespeichert {lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  Fehler: {saveError}
                </span>
              )}
            </div>
          </div>

          {/* Right: Publish/Unpublish */}
          <div className="flex items-center gap-3">
            {publishError && (
              <span className="text-xs text-red-400 hidden sm:block">
                {publishError}
              </span>
            )}

            {article.status === "draft" ? (
              <button
                onClick={handlePublish}
                disabled={!canPublish || isPublishing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isPublishing ? "Wird veröffentlicht…" : "Veröffentlichen"}
              </button>
            ) : (
              <button
                onClick={handleUnpublish}
                disabled={isPublishing}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isPublishing ? "Wird bearbeitet…" : "Zurück in Entwurf"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Metadata Block */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          {/* Topic Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
              Thema <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    topic === t
                      ? "bg-slate-900 text-white dark:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
              Cover-Foto (optional)
            </label>

            {coverUrl ? (
              <div className="relative group">
                <img
                  src={coverUrl}
                  alt="Article cover"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                />
                <button
                  onClick={handleRemoveCover}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Cover entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {isUploading ? "Wird hochgeladen…" : "Foto hochladen"}
                  </span>
                </button>
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {uploadError}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                  JPG, PNG oder WebP, max. 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Titel"
            className="w-full text-4xl md:text-5xl font-serif font-light text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
          />
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-600">
            {title.length}/{TITLE_MAX}
          </div>
        </div>

        {/* Excerpt Textarea */}
        <div className="mb-8">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, EXCERPT_MAX))}
            placeholder="Kurzbeschreibung (erscheint in Artikel-Vorschauen)"
            rows={3}
            className="w-full text-base text-slate-600 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 p-0 resize-none"
          />
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-600">
            {excerpt.length}/{EXCERPT_MAX}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 mb-8" />

        {/* Rich Text Body Editor */}
        <div className="min-h-[400px]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Schreiben Sie Ihre Geschichte…"
            className="w-full min-h-[400px] text-base text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 p-0 resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
