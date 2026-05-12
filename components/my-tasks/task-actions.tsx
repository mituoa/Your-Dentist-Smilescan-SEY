"use client";

/**
 * Primäraktionen auf der Aufgaben-Detailseite — **Punkt 1 (Zweck)** s. `my-tasks/[id]/page.tsx`: Einreichen und
 * ärztliche Prüfung, **ohne** Ticket-/Ops-Sprache; Labels orientieren an Praxisablauf, nicht an Helpdesk.
 *
 * **Punkt 2 (Status / Stabilität):** `useTransition` + **`fieldset disabled`** während Mutation — keine parallelen
 * Klicks; `aria-busy` auf dem Bereich; Abbrechen im Rückmelde-Formular während Pending gesperrt.
 *
 * **Punkt 4 (Aktionen):** Primär-CTAs ruhig (dezenter Schatten, `rounded-lg`), kein „Success-Theater“; Rückmeldung
 * klar vom Einreichen getrennt; s. `page.tsx` (Punkt 4).
 *
 * **Punkt 5 (Tot/Fake):** Kein künstlicher Erfolgs-Banner nach Aktionen — nur `router.refresh`; s. `page.tsx` (Punkt 5).
 *
 * **Punkt 8 (Error):** Server liefert nur **sachliche** deutsche Kurzmeldungen; **keine** Banner, eine Zeile unter
 * den Buttons (`aria-live="polite"`). Client: `try`/`catch` um Actions — **keine** rohen Exception-Strings; s.
 * `page.tsx` (Punkt 8).
 *
 * **Punkt 9 (Mobile):** Primär-CTAs `w-full` bis `sm`, `min-h-11`, `touch-manipulation`; Rückmelde-Textarea **16px**;
 * s. `page.tsx` (Punkt 9).
 *
 * **Punkt 11 (MVP):** Rückweisungs-UI sachlich (Begründung, kein „Team-Channel“-Ton); s. `page.tsx` (Punkt 11).
 */

import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  approveTask,
  rejectTask,
  submitTaskForReview,
} from "@/app/(protected)/my-tasks/actions";
import { taskMutationClientFailureMessage } from "@/lib/tasks/task-mutation-client-error";

interface TaskActionsProps {
  taskId: string;
  status: "open" | "pending_review" | "done";
  isDoctor: boolean;
  isMyTask: boolean;
  /** Ärztin hat die Aufgabe selbst angelegt — ein offener Schritt wird direkt abgeschlossen. */
  doctorSelfTask: boolean;
}

export function TaskActions({
  taskId,
  status,
  isDoctor,
  isMyTask,
  doctorSelfTask,
}: TaskActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "done") return null;

  const canSubmit = status === "open" && isMyTask;
  const canReview = status === "pending_review" && isDoctor;

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitTaskForReview(taskId);
        if (result.error) setError(result.error);
        else router.refresh();
      } catch (e) {
        setError(taskMutationClientFailureMessage(e));
      }
    });
  };

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await approveTask(taskId);
        if (result.error) setError(result.error);
        else router.refresh();
      } catch (e) {
        setError(taskMutationClientFailureMessage(e));
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError("Bitte geben Sie eine Begründung ein.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await rejectTask(taskId, rejectReason);
        if (result.error) setError(result.error);
        else {
          setRejectReason("");
          setShowReject(false);
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
      className="min-w-0 touch-manipulation space-y-3 border-0 p-0 sm:space-y-4 disabled:[&_textarea]:cursor-not-allowed disabled:[&_textarea]:opacity-60"
    >
      {canSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#2F80ED] px-5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-[rgba(43,111,232,0.12)] transition-colors hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.35)] focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
          ) : (
            <Check className="h-4 w-4" aria-hidden />
          )}
          {doctorSelfTask ? "Abschließen" : "Zur Bestätigung einreichen"}
        </button>
      )}

      {canReview && !showReject && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#2F80ED] px-5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-[rgba(43,111,232,0.12)] transition-colors hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.35)] focus-visible:ring-offset-2 disabled:opacity-50 sm:flex-1"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
            ) : (
              <Check className="h-4 w-4" aria-hidden />
            )}
            Erledigung bestätigen
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowReject(true);
            }}
            disabled={isPending}
            className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg border border-[rgba(15,23,42,0.1)] bg-white px-5 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:border-[rgba(15,23,42,0.14)] hover:bg-[#F8FAFC] hover:text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] disabled:opacity-50 sm:flex-1"
          >
            <X className="h-4 w-4" aria-hidden />
            Zurückweisen
          </button>
        </div>
      )}

      {canReview && showReject && (
        <div className="space-y-3 rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] p-4">
          <div className="text-sm font-medium leading-6 text-[#0F172A]">
            Begründung für die Rückweisung
          </div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Kurz beschreiben, was noch fehlt oder angepasst werden soll."
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-[rgba(15,23,42,0.1)] bg-white px-3 py-2 text-base leading-6 focus:outline-none focus:ring-2 focus:ring-[rgba(220,38,38,0.2)]"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
              className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm text-white transition-colors hover:bg-danger/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 sm:w-auto"
            >
              Rückweisung speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReject(false);
                setRejectReason("");
                setError(null);
              }}
              disabled={isPending}
              className="min-h-11 w-full touch-manipulation rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

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
