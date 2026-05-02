"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  approveTask,
  rejectTask,
  submitTaskForReview,
} from "@/app/(protected)/my-tasks/actions";

interface TaskActionsProps {
  taskId: string;
  status: "open" | "pending_review" | "done";
  isDoctor: boolean;
  isMyTask: boolean;
}

export function TaskActions({
  taskId,
  status,
  isDoctor,
  isMyTask,
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
      const result = await submitTaskForReview(taskId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveTask(taskId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError("Bitte geben Sie eine Begründung ein.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectTask(taskId, rejectReason);
      if (result.error) setError(result.error);
      else {
        setRejectReason("");
        setShowReject(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {canSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm text-cream transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Als erledigt einreichen
        </button>
      )}

      {canReview && !showReject && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Bestätigen
          </button>
          <button
            type="button"
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm text-text-secondary transition-colors hover:border-danger hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Zurückweisen
          </button>
        </div>
      )}

      {canReview && showReject && (
        <div className="space-y-3 rounded-lg border border-border bg-surface-sunken p-4">
          <div className="text-sm font-semibold leading-6 text-text-primary">
            Aufgabe zurückweisen
          </div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Begründung: Warum ist die Aufgabe noch nicht erledigt?"
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-danger/30"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-danger px-4 py-2 text-sm text-white transition-colors hover:bg-danger/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
            >
              Zurückweisung senden
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReject(false);
                setRejectReason("");
              }}
              className="min-h-10 rounded-md px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm leading-5 text-danger">{error}</p>}
    </div>
  );
}
