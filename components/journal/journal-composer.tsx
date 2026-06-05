/* eslint-disable @typescript-eslint/no-explicit-any -- Tiptap extension typings */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import TurndownService from "turndown";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import {
  saveArticle,
  publishArticle,
  unpublishArticle,
} from "@/app/(protected)/journal/actions";
import {
  inferClinicalArea,
  isClinicalAreaId,
  type ClinicalAreaId,
} from "@/lib/journal/clinical-areas";
import { inferContentType, type JournalContentType } from "@/lib/journal/content-categories";
import { excerptFromMarkdown } from "@/lib/journal/excerpt-from-markdown";
import { calculateReadingTime, countWords } from "@/lib/validation/journal-limits";
import { CoverPhotoUpload } from "./cover-photo-upload";
import { JournalComposerSidebar } from "./journal-composer-sidebar";
import { YdInlineBusy } from "@/components/design-system/yd-skeleton";
import { clinicalWorkspaceFrame } from "@/lib/clinical-ui";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import type { JournalEntry } from "@/lib/types/journal-entry";

interface JournalComposerProps {
  article: JournalEntry;
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export function JournalComposer({ article }: JournalComposerProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title || "");
  const [subtitle, setSubtitle] = useState(article.excerpt || "");
  const [clinicalArea, setClinicalArea] = useState<ClinicalAreaId | null>(
    isClinicalAreaId(article.clinical_area) ? article.clinical_area : inferClinicalArea(article)
  );
  const [contentType, setContentType] = useState<JournalContentType>(
    inferContentType(article)
  );
  const [coverUrl, setCoverUrl] = useState(article.cover_photo_url);
  const [contentMd, setContentMd] = useState(article.content_markdown || "");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const initialHtml = useMemo(() => {
    if (!article.content_markdown) return "";
    return marked.parse(article.content_markdown, { async: false }) as string;
  }, [article.content_markdown]);

  const extensions = useMemo(
    () =>
      [
        (StarterKit as any).configure({
          heading: { levels: [2, 3] },
        }),
        (Placeholder as any).configure({
          placeholder:
            "Erklären Sie Ihren Patienten ruhig und verständlich, was sie wissen müssen…",
        }),
        (Link as any).configure({
          openOnClick: false,
          autolink: true,
        }),
        Typography,
      ] as any,
    []
  );

  const editor = useEditor({
    extensions,
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }: { editor: { getHTML: () => string } }) => {
      const html = ed.getHTML();
      const md = turndown.turndown(html);
      setContentMd(md);
    },
    immediatelyRender: false,
  } as any);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRenderRef = useRef(true);

  const resolvedSubtitle = useMemo(() => {
    const trimmed = subtitle.trim();
    if (trimmed) return trimmed.slice(0, JOURNAL_LIMITS.excerpt);
    return excerptFromMarkdown(contentMd).slice(0, JOURNAL_LIMITS.excerpt);
  }, [subtitle, contentMd]);

  const readingTimeMinutes = useMemo(
    () => calculateReadingTime(countWords(contentMd)),
    [contentMd]
  );

  const performSave = useCallback(async (): Promise<boolean> => {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const result = await saveArticle({
        id: article.id,
        title,
        excerpt: resolvedSubtitle,
        content_markdown: contentMd,
        topic: article.topic,
        clinical_area: clinicalArea,
        content_type: contentType,
        cover_photo_url: coverUrl,
      });
      if (result.error) {
        setSaveStatus("error");
        setSaveError(result.error);
        return false;
      }
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      return true;
    } catch {
      setSaveStatus("error");
      setSaveError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      return false;
    }
  }, [
    article.id,
    article.topic,
    title,
    resolvedSubtitle,
    contentMd,
    clinicalArea,
    contentType,
    coverUrl,
  ]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => void performSave(), 2000);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [title, subtitle, contentMd, clinicalArea, contentType, coverUrl, performSave]);

  const canPublish = Boolean(title.trim() && contentMd.trim() && clinicalArea);

  const handlePublish = async () => {
    if (isPending) return;
    setIsPending(true);
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    try {
      const saved = await performSave();
      if (!saved) {
        setIsPending(false);
        return;
      }
      const result = await publishArticle(article.id);
      setIsPending(false);
      if (result.error) {
        setSaveError(result.error);
        setSaveStatus("error");
      } else {
        router.refresh();
      }
    } catch {
      setIsPending(false);
      setSaveError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setSaveStatus("error");
    }
  };

  const handleUnpublish = async () => {
    if (isPending) return;
    setIsPending(true);
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    try {
      const result = await unpublishArticle(article.id);
      setIsPending(false);
      if (result.error) {
        setSaveError(result.error);
        setSaveStatus("error");
      } else {
        router.refresh();
      }
    } catch {
      setIsPending(false);
      setSaveError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setSaveStatus("error");
    }
  };

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return (
        <span className="yd-journal-composer-v6__save flex items-center gap-1.5">
          <YdInlineBusy />
          Speichern…
        </span>
      );
    }
    if (saveStatus === "error") {
      return (
        <span className="yd-journal-composer-v6__save flex items-center gap-1.5 text-red-600">
          <AlertCircle className="h-3 w-3" strokeWidth={2} />
          {saveError}
        </span>
      );
    }
    if (saveStatus === "saved" && lastSavedAt) {
      // eslint-disable-next-line react-hooks/purity -- wall clock for relative save label
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      const label =
        seconds < 5
          ? "gerade eben"
          : seconds < 60
            ? `vor ${seconds}s`
            : `vor ${Math.floor(seconds / 60)} Min.`;
      return (
        <span className="yd-journal-composer-v6__save flex items-center gap-1.5 text-emerald-700">
          <Check className="h-3 w-3" strokeWidth={2} />
          Gespeichert {label}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="yd-journal-composer-v6 yd-clinical-brand">
      <header className="yd-journal-composer-v6__bar">
        <div className="yd-journal-composer-v6__bar-inner">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/journal")}
              className="yd-journal-composer-v6__back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Journal
            </button>
            {renderSaveStatus()}
          </div>
        </div>
      </header>

      <div className={`yd-journal-composer-v6__body ${clinicalWorkspaceFrame}`}>
        <main className="yd-journal-composer-v6__main">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel Ihres Patientenartikels"
            maxLength={JOURNAL_LIMITS.title}
            className="yd-journal-composer-v6__title"
            aria-label="Titel"
          />

          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Kurze Einleitung für Patienten (optional)"
            maxLength={JOURNAL_LIMITS.excerpt}
            rows={2}
            className="yd-journal-composer-v6__subtitle"
            aria-label="Untertitel"
          />

          <div className="yd-journal-composer-v6__content">
            <EditorContent editor={editor} />
          </div>

          <div className="yd-journal-composer-v6__media">
            <p className="yd-journal-composer-v6__media-label">Bild</p>
            <CoverPhotoUpload coverUrl={coverUrl} onChange={setCoverUrl} />
          </div>
        </main>

        <JournalComposerSidebar
          article={article}
          clinicalArea={clinicalArea}
          contentType={contentType}
          readingTimeMinutes={readingTimeMinutes}
          canPublish={canPublish}
          isPending={isPending}
          status={article.status}
          onClinicalAreaChange={setClinicalArea}
          onContentTypeChange={setContentType}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
        />
      </div>
    </div>
  );
}
