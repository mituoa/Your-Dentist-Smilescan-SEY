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
import {
  saveArticle,
  publishArticle,
  unpublishArticle,
} from "@/app/(protected)/journal/actions";
import { ComposerTopBar } from "./composer-topbar";
import { TopicSelector } from "./topic-selector";
import { CoverPhotoUpload } from "./cover-photo-upload";
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
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [topic, setTopic] = useState(article.topic);
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
          placeholder: "Schreiben Sie Ihre Erklärung…",
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
        class:
          "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] font-serif",
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

  const performSave = useCallback(async (): Promise<boolean> => {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const result = await saveArticle({
        id: article.id,
        title,
        excerpt,
        content_markdown: contentMd,
        topic,
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
  }, [article.id, title, excerpt, contentMd, topic, coverUrl]);

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
  }, [title, excerpt, contentMd, topic, coverUrl, performSave]);

  const canPublish = Boolean(title.trim() && contentMd.trim() && topic);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <ComposerTopBar
        status={article.status}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        saveError={saveError}
        canPublish={canPublish}
        isPending={isPending}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />

      <div className="mx-auto max-w-4xl px-4 pt-20 pb-8 md:px-6 md:pb-12">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-8">
          <TopicSelector value={topic} onChange={setTopic} required />
          <CoverPhotoUpload coverUrl={coverUrl} onChange={setCoverUrl} />
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            maxLength={JOURNAL_LIMITS.title}
            className="w-full border-none bg-transparent p-0 font-serif text-4xl font-light leading-tight tracking-tight text-slate-900 outline-none placeholder:text-slate-300 md:text-5xl dark:text-white dark:placeholder:text-slate-700"
          />
          {title.length > JOURNAL_LIMITS.title * 0.8 && (
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-600">
              {title.length}/{JOURNAL_LIMITS.title}
            </div>
          )}
        </div>

        <div className="mb-12">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Kurzbeschreibung für die Übersicht"
            maxLength={JOURNAL_LIMITS.excerpt}
            rows={2}
            className="w-full resize-none border-none bg-transparent p-0 text-base leading-relaxed text-slate-600 outline-none placeholder:text-slate-300 dark:text-slate-400 dark:placeholder:text-slate-700"
          />
          {excerpt.length > JOURNAL_LIMITS.excerpt * 0.8 && (
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-600">
              {excerpt.length}/{JOURNAL_LIMITS.excerpt}
            </div>
          )}
        </div>

        <hr className="mb-8 border-slate-200 dark:border-slate-800" />

        <div className="composer-content">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .composer-content .ProseMirror {
          color: rgb(15 23 42);
          min-height: 400px;
        }
        .dark .composer-content .ProseMirror {
          color: rgb(241 245 249);
        }
        .composer-content .ProseMirror p.is-editor-empty:first-child::before {
          color: rgb(148 163 184);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .dark .composer-content .ProseMirror p.is-editor-empty:first-child::before {
          color: rgb(71 85 105);
        }
        .composer-content .ProseMirror h2 {
          font-family: Fraunces, serif;
          font-size: 2.25rem;
          font-weight: 300;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .composer-content .ProseMirror h3 {
          font-family: Fraunces, serif;
          font-size: 1.75rem;
          font-weight: 300;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .composer-content .ProseMirror p {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .composer-content .ProseMirror blockquote {
          border-left: 2px solid rgb(203 213 225);
          padding-left: 1.5rem;
          font-style: italic;
          color: rgb(71 85 105);
          margin: 2rem 0;
        }
        .dark .composer-content .ProseMirror blockquote {
          border-left: 2px solid rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.8);
        }
        .composer-content .ProseMirror a {
          color: rgb(15 23 42);
          border-bottom: 1px solid rgb(148 163 184);
          text-decoration: none;
        }
        .dark .composer-content .ProseMirror a {
          color: #f5f2ec;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        .composer-content .ProseMirror a:hover {
          border-bottom-color: rgb(15 23 42);
        }
        .dark .composer-content .ProseMirror a:hover {
          border-bottom-color: #f5f2ec;
        }
        .composer-content .ProseMirror ul,
        .composer-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .composer-content .ProseMirror li {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 0.5rem;
        }
        .composer-content .ProseMirror strong {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
