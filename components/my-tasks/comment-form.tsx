"use client";

/**
 * Kommentar-Eingabe — **Punkt 1:** ergänzende Notiz, kein Kanal-/Push-Ersatz; Zweck s. `my-tasks/[id]/page.tsx`.
 *
 * **Punkt 2 (Status / Stabilität):** `useTransition` + **`fieldset disabled`** während Speichern; `aria-busy`;
 * Fehler in `aria-live="polite"` — kein paralleles Absenden.
 *
 * **Punkt 4 (Aktionen):** Sekundär zu den Hauptaktionen — **Outline**-Button, ruhiger als Vollfläche; Spinner nur bei
 * `motion-safe`; s. `page.tsx` (Punkt 4).
 *
 * **Punkt 5 (Tot/Fake):** Kein Kanal-/Push-Ersatz, kein „Nachricht gesendet“-Theater — nur Speichern + Refresh; s.
 * `page.tsx` (Punkt 5).
 *
 * **Punkt 7 (Empty):** Platzhalter sachlich (**Dokumentation**), ohne Adressaten-/Chat-Routing; **kein** leerer
 * Motivations- oder „schreiben Sie zuerst“-Ton — s. `page.tsx` (Punkt 7).
 *
 * **Punkt 8 (Error):** Eine ruhige Fehlerzeile (`aria-live="polite"`), **kein** Banner; `try`/`catch` um die Action —
 * keine rohen Exception-Texte; s. `page.tsx` (Punkt 8).
 *
 * **Punkt 9 (Mobile):** Textarea **16px** (iOS), Button `min-h-11` + `touch-manipulation`, volle Breite bis `sm`; s.
 * `page.tsx` (Punkt 9).
 */

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addTaskComment } from "@/app/(protected)/my-tasks/actions";
import { taskMutationClientFailureMessage } from "@/lib/tasks/task-mutation-client-error";

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
      try {
        const result = await addTaskComment(taskId, content);
        if (result.error) {
          setError(result.error);
        } else {
          setContent("");
          router.refresh();
        }
      } catch (e) {
        setError(taskMutationClientFailureMessage(e));
      }
    });
  };

  return (
    <fieldset
      disabled={isPending}
      aria-busy={isPending}
      className="min-w-0 touch-manipulation space-y-2 border-0 p-0 disabled:[&_textarea]:cursor-not-allowed disabled:[&_textarea]:opacity-60"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Kurze Notiz zur Dokumentation …"
        rows={3}
        maxLength={2000}
        className="w-full resize-none rounded-md border border-border bg-surface-card px-3 py-2 text-base leading-6 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium tabular-nums text-text-tertiary">
          {content.length}/2000
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.22)] disabled:opacity-50 sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
          ) : null}
          Kommentar hinzufügen
        </button>
      </div>
      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? (
          <p className="text-sm font-normal leading-5 text-danger" role="status">
            {error}
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}
