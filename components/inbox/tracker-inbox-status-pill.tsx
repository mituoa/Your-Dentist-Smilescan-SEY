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
      setError("Freigegeben ist erst nach versendeter Patientenantwort möglich.");
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
      className="yd-tracker-v9-inbox-status"
      aria-busy={pending}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          "yd-tracker-v9-inbox-status__pill",
          `yd-tracker-v9-inbox-status__pill--${status}`,
          open && "yd-tracker-v9-inbox-status__pill--open",
          pending && "yd-tracker-v9-inbox-status__pill--pending"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="yd-tracker-v9-inbox-status__dot" aria-hidden />
        {pending ? "…" : label}
      </button>
      {open ? (
        <ul className="yd-tracker-v9-inbox-status__menu" role="listbox">
          {INBOX_PRACTICE_STATUS_OPTIONS.map((opt) => {
            const disabledFreigegeben =
              opt.id === "freigegeben" && !canMarkFreigegeben;
            return (
              <li key={opt.id} role="option" aria-selected={opt.id === status}>
                <button
                  type="button"
                  className={cn(
                    "yd-tracker-v9-inbox-status__option",
                    opt.id === status && "yd-tracker-v9-inbox-status__option--active",
                    disabledFreigegeben && "yd-tracker-v9-inbox-status__option--disabled"
                  )}
                  disabled={pending || disabledFreigegeben}
                  title={
                    disabledFreigegeben
                      ? "Erst nach versendeter Patientenantwort möglich."
                      : undefined
                  }
                  onClick={() => apply(opt.id)}
                >
                  <span
                    className={cn(
                      "yd-tracker-v9-inbox-status__dot",
                      `yd-tracker-v9-inbox-status__dot--${opt.id}`
                    )}
                    aria-hidden
                  />
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {error ? (
        <p className="yd-tracker-v9-inbox-status__error" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}
