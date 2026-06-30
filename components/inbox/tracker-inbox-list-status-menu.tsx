"use client";

import { Check, MoreHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import {
  markSubmissionUnseen,
  updateSubmissionPracticeStatus,
  type InboxPracticeStatusValue,
} from "@/app/(protected)/inbox/[id]/actions";
import { useTrackerInboxRead } from "@/components/inbox/tracker-inbox-read-context";
import {
  TRACKER_LIST_STATUS_OPTIONS,
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
  showStatusLabel?: boolean;
};

function usePopoverPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>
) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const menuHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight;
      const width = 216;

      setStyle({
        position: "fixed",
        left: Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8),
        top: openUp ? rect.top - 8 : rect.bottom + 6,
        transform: openUp ? "translateY(-100%)" : undefined,
        zIndex: 10050,
        minWidth: "13.5rem",
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  return style;
}

/** Dezentes Status-Menü für die Patientenliste — Popover per Portal (Mobile-safe). */
export function TrackerInboxListStatusMenu({
  submissionId,
  status,
  seenAt,
  className,
  showStatusLabel = false,
}: TrackerInboxListStatusMenuProps) {
  const router = useRouter();
  const { markCaseUnread } = useTrackerInboxRead();
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<InboxPracticeStatusId>(status);
  const popoverStyle = usePopoverPosition(open, rootRef);

  const displayStatus = displayPracticeStatusForCase(localStatus);
  const statusLabel = enterpriseStatusLabel(displayStatus);
  const canMarkUnread = Boolean(seenAt);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown, true);
    }, 0);

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
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
    const previous = displayStatus;
    setLocalStatus(next);
    run(async () => {
      const res = await updateSubmissionPracticeStatus(submissionId, next);
      if (res.error) {
        setLocalStatus(previous);
      }
      return res;
    });
  };

  const markUnread = () => {
    if (!canMarkUnread) return;
    run(async () => {
      const res = await markSubmissionUnseen(submissionId);
      if (!res.error) {
        markCaseUnread(submissionId);
      }
      return res;
    });
  };

  const toggleOpen = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setOpen((v) => !v);
  };

  const popover =
    open && typeof document !== "undefined" ? (
      <div
        ref={popoverRef}
        className="yd-tracker-list-status-menu__popover yd-tracker-list-status-menu__popover--portal"
        style={popoverStyle}
        role="menu"
        aria-label="Fallstatus"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="yd-tracker-list-status-menu__popover-label">Status</p>
        <ul className="yd-tracker-list-status-menu__options">
          {TRACKER_LIST_STATUS_OPTIONS.map((opt) => {
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
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    applyStatus(opt.id);
                  }}
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
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                markUnread();
              }}
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
    ) : null;

  return (
    <div
      ref={rootRef}
      className={cn("yd-tracker-list-status-menu", className)}
      aria-busy={pending}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
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
          showStatusLabel && "yd-tracker-list-status-menu__trigger--labeled",
          open && "yd-tracker-list-status-menu__trigger--open",
          pending && "yd-tracker-list-status-menu__trigger--pending"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Status ändern: ${statusLabel}`}
        disabled={pending}
        onClick={toggleOpen}
      >
        {showStatusLabel ? (
          <span className="yd-tracker-list-status-menu__trigger-label">{statusLabel}</span>
        ) : null}
        <MoreHorizontal className="yd-tracker-list-status-menu__icon" strokeWidth={2} aria-hidden />
      </button>
      {popover ? createPortal(popover, document.body) : null}
    </div>
  );
}
