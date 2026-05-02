"use client";

import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addTaskComment } from "@/app/(protected)/my-tasks/actions";

interface CommentFormProps {
  taskId: string;
}

export function CommentForm({ taskId }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await addTaskComment(taskId, content);
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Kommentar für Team oder Arzt eingeben…"
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-md border border-border bg-surface-card px-3 py-2 text-sm leading-6 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium tabular-nums text-text-tertiary">
          {content.length}/2000
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-cream transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Kommentar senden
        </button>
      </div>
      {error && <p className="text-sm leading-5 text-danger">{error}</p>}
    </div>
  );
}
