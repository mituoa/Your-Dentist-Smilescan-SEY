"use client";

import { Check, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  markSubmissionUnseen,
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

type TrackerInboxListStatusMenuProps = {
  submissionId: string;
  status: InboxPracticeStatusId;
  seenAt?: string | null;
  className?: string;
};

/** Dezentes Status-Menü für die Patientenliste — Indikator + Popover. */
export function TrackerInboxListStatusMenu({
  submissionId,
  status,
  seenAt,
  className,
}: TrackerInboxListStatusMenuProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayStatus = displayPracticeStatusForCase(status);
  const statusLabel = enterpriseStatusLabel(displayStatus);
  const canMarkUnread = Boolean(seenAt);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const run = (fn: () => Promise<{ error?: string; success?: boolean } | void>) => {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  const applyStatus = (next: InboxPracticeStatusValue) => {
    if (next === displayStatus) {
      setOpen(false);
      return;
    }
    run(() => updateSubmissionPracticeStatus(submissionId, next));
  };

  const markUnread = () => {
    if (!canMarkUnread) return;
    run(() => markSubmissionUnseen(submissionId));
  };

  return (
    <div
      ref={rootRef}
      className={cn("yd-tracker-list-status-menu", className)}
      aria-busy={pending}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <span
        className={cn(
          "yd-tracker-list-status-menu__dot",
          `yd-tracker-list-status-menu__dot--${displayStatus}`
        )}
        title={statusLabel}
        aria-label={`Status: ${statusLabel}`}
      />
      <button
        type="button"
        className={cn(
          "yd-tracker-list-status-menu__trigger",
          open && "yd-tracker-list-status-menu__trigger--open",
          pending && "yd-tracker-list-status-menu__trigger--pending"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Status ändern"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="yd-tracker-list-status-menu__icon" strokeWidth={2} aria-hidden />
      </button>

      {open ? (
        <div className="yd-tracker-list-status-menu__popover" role="menu" aria-label="Fallstatus">
          <p className="yd-tracker-list-status-menu__popover-label">Status</p>
          <ul className="yd-tracker-list-status-menu__options">
            {TRACKER_ENTERPRISE_STATUS_OPTIONS.map((opt) => {
              const isActive = opt.id === displayStatus;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    className={cn(
                      "yd-tracker-list-status-menu__option",
                      isActive && "yd-tracker-list-status-menu__option--active"
                    )}
                    disabled={pending}
                    onClick={() => applyStatus(opt.id)}
                  >
                    <span
                      className={cn(
                        "yd-tracker-list-status-menu__option-dot",
                        `yd-tracker-list-status-menu__option-dot--${opt.id}`
                      )}
                      aria-hidden
                    />
                    <span className="yd-tracker-list-status-menu__option-label">{opt.label}</span>
                    {isActive ? (
                      <Check className="yd-tracker-list-status-menu__check" strokeWidth={2.25} aria-hidden />
                    ) : (
                      <span className="yd-tracker-list-status-menu__check-placeholder" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {canMarkUnread ? (
            <>
              <div className="yd-tracker-list-status-menu__divider" role="separator" />
              <button
                type="button"
                role="menuitem"
                className="yd-tracker-list-status-menu__secondary"
                disabled={pending}
                onClick={markUnread}
              >
                Als ungelesen markieren
              </button>
            </>
          ) : null}
          {error ? (
            <p className="yd-tracker-list-status-menu__error" role="status" aria-live="polite">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
