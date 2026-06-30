"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  updateSubmissionPracticeStatus,
  type InboxPracticeStatusValue,
} from "@/app/(protected)/inbox/[id]/actions";
import {
  TRACKER_ENTERPRISE_STATUS_OPTIONS,
  displayPracticeStatusForCase,
  enterpriseStatusLabel,
} from "@/lib/inbox/tracker-enterprise-status";
import type { InboxPracticeStatusId } from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

type TrackerInboxStatusPillProps = {
  submissionId: string;
  status: InboxPracticeStatusId;
  className?: string;
};

/** V10 — Dezente Segment-Auswahl für den Praxisstatus. */
export function TrackerInboxStatusPill({
  submissionId,
  status,
  className,
}: TrackerInboxStatusPillProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<InboxPracticeStatusId>(status);

  const displayStatus = displayPracticeStatusForCase(localStatus);
  const label = enterpriseStatusLabel(displayStatus);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

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
    if (next === displayStatus) {
      setOpen(false);
      return;
    }
    setError(null);
    const previous = displayStatus;
    setLocalStatus(next);
    startTransition(async () => {
      const res = await updateSubmissionPracticeStatus(submissionId, next);
      if (res.error) {
        setLocalStatus(previous);
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
      className={cn("yd-tracker-v10-inbox-status yd-tracker-v12-inbox-status", className)}
      aria-busy={pending}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          "yd-tracker-v10-inbox-status__trigger",
          `yd-tracker-v10-inbox-status__trigger--${displayStatus}`,
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
          aria-label="Fallstatus"
        >
          {TRACKER_ENTERPRISE_STATUS_OPTIONS.map((opt) => {
            const isActive = opt.id === displayStatus;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={cn(
                  "yd-tracker-v10-inbox-status__segment",
                  isActive && "yd-tracker-v10-inbox-status__segment--active"
                )}
                disabled={pending}
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
