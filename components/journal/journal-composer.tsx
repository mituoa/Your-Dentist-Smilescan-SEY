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
import type { JournalEntry } from "@/lib/queries/journal";

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
          placeholder: "Schreiben Sie Ihre Geschichte…",
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

  const performSave = useCallback(async () => {
    setSaveStatus("saving");
    setSaveError(null);
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
    } else {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
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
    setIsPending(true);
    await performSave();
    const result = await publishArticle(article.id);
    setIsPending(false);
    if (result.error) {
      setSaveError(result.error);
      setSaveStatus("error");
    } else {
      router.refresh();
    }
  };

  const handleUnpublish = async () => {
    setIsPending(true);
    const result = await unpublishArticle(article.id);
    setIsPending(false);
    if (!result.error) router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-white font-serif">
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

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-40">
        <div className="space-y-8 mb-12">
          <TopicSelector value={topic} onChange={setTopic} required />
          <CoverPhotoUpload coverUrl={coverUrl} onChange={setCoverUrl} />
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            maxLength={JOURNAL_LIMITS.title}
            className="w-full bg-transparent font-serif text-5xl md:text-6xl font-light leading-tight tracking-tight outline-none placeholder:text-white/20 border-none p-0"
          />
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2">
            {title.length}/{JOURNAL_LIMITS.title}
          </div>
        </div>

        <div className="mb-12">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Kurzbeschreibung (erscheint in Artikel-Vorschauen)"
            maxLength={JOURNAL_LIMITS.excerpt}
            rows={2}
            className="w-full bg-transparent font-serif text-xl italic text-white/70 leading-relaxed outline-none placeholder:text-white/20 border-none p-0 resize-none"
          />
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2">
            {excerpt.length}/{JOURNAL_LIMITS.excerpt}
          </div>
        </div>

        <hr className="border-white/10 mb-12" />

        <div className="composer-content">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .composer-content .ProseMirror {
          color: #f5f2ec;
        }
        .composer-content .ProseMirror p.is-editor-empty:first-child::before {
          color: rgba(255, 255, 255, 0.2);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
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
          border-left: 2px solid rgba(255, 255, 255, 0.3);
          padding-left: 1.5rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
          margin: 2rem 0;
        }
        .composer-content .ProseMirror a {
          color: #f5f2ec;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          text-decoration: none;
        }
        .composer-content .ProseMirror a:hover {
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
