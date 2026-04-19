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
      setError("Begründung ist erforderlich.");
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
    <div className="space-y-3">
      {canSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded text-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Erledigt melden
        </button>
      )}

      {canReview && !showReject && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded text-sm hover:bg-brand/90 disabled:opacity-50"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary rounded text-sm hover:text-danger hover:border-danger disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Zurückweisen
          </button>
        </div>
      )}

      {canReview && showReject && (
        <div className="p-4 bg-surface-sunken border border-border rounded space-y-3">
          <div className="text-sm font-medium">Aufgabe zurückweisen</div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Begründung: warum ist die Aufgabe nicht erledigt?"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 bg-paper border border-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-danger/30"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-danger text-white rounded text-sm hover:bg-danger/90 disabled:opacity-50"
            >
              Zurückweisen bestätigen
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReject(false);
                setRejectReason("");
              }}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
