"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  updateSubmissionPracticeStatus,
  type InboxPracticeStatusValue,
} from "@/app/(protected)/inbox/[id]/actions";
import {
  INBOX_PRACTICE_STATUS_OPTIONS,
  type InboxPracticeStatusId,
} from "@/lib/inbox/tracker-v9-clinical";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { cn } from "@/lib/utils";

type TrackerInboxStatusPillProps = {
  submissionId: string;
  status: InboxPracticeStatusId;
  messageDraftStatus: MessageDraftListStatus;
};

/** V10 — Dezente Segment-Auswahl für den Praxisstatus. */
export function TrackerInboxStatusPill({
  submissionId,
  status,
  messageDraftStatus,
}: TrackerInboxStatusPillProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canMarkFreigegeben = messageDraftStatus === "sent";

  const label =
    INBOX_PRACTICE_STATUS_OPTIONS.find((o) => o.id === status)?.label ?? status;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const apply = (next: InboxPracticeStatusValue) => {
    if (pending) return;
    if (next === status) {
      setOpen(false);
      return;
    }
    if (next === "freigegeben" && !canMarkFreigegeben) {
      setError("Erst nach versendeter Antwort möglich.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateSubmissionPracticeStatus(submissionId, next);
      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <div
      ref={rootRef}
      className="yd-tracker-v10-inbox-status"
      aria-busy={pending}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          "yd-tracker-v10-inbox-status__trigger",
          `yd-tracker-v10-inbox-status__trigger--${status}`,
          open && "yd-tracker-v10-inbox-status__trigger--open",
          pending && "yd-tracker-v10-inbox-status__trigger--pending"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        {pending ? "…" : label}
      </button>
      {open ? (
        <div
          className="yd-tracker-v10-inbox-status__segments"
          role="listbox"
          aria-label="Praxisstatus"
        >
          {INBOX_PRACTICE_STATUS_OPTIONS.map((opt) => {
            const disabledFreigegeben =
              opt.id === "freigegeben" && !canMarkFreigegeben;
            const isActive = opt.id === status;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={cn(
                  "yd-tracker-v10-inbox-status__segment",
                  isActive && "yd-tracker-v10-inbox-status__segment--active",
                  disabledFreigegeben && "yd-tracker-v10-inbox-status__segment--disabled"
                )}
                disabled={pending || disabledFreigegeben}
                title={
                  disabledFreigegeben
                    ? "Erst nach versendeter Antwort möglich."
                    : undefined
                }
                onClick={() => apply(opt.id)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {error ? (
        <p className="yd-tracker-v10-inbox-status__error" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}
