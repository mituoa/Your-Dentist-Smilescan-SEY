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
        placeholder="Kommentar hinzufügen…"
        rows={3}
        maxLength={2000}
        className="w-full px-3 py-2 bg-surface-card border border-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">{content.length}/2000</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded text-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Senden
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
