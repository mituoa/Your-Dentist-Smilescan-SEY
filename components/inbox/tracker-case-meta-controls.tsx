"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { markSubmissionUnseen } from "@/app/(protected)/inbox/[id]/actions";
import { TrackerInboxStatusPill } from "@/components/inbox/tracker-inbox-status-pill";
import { displayPracticeStatusForCase } from "@/lib/inbox/tracker-enterprise-status";
import { cn } from "@/lib/utils";

type TrackerCaseMetaControlsProps = {
  submissionId: string;
  practiceStatus: string | null;
  seenAt: string | null;
  className?: string;
};

/** Status und Lesemarkierung — ohne Layout-Wechsel im Workspace. */
export function TrackerCaseMetaControls({
  submissionId,
  practiceStatus,
  seenAt,
  className,
}: TrackerCaseMetaControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const status = displayPracticeStatusForCase(practiceStatus);

  const markUnread = () => {
    if (pending || !seenAt) return;
    startTransition(async () => {
      await markSubmissionUnseen(submissionId);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "yd-tracker-case-meta flex flex-wrap items-center gap-2",
        className
      )}
      aria-busy={pending}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
        Status
      </span>
      <TrackerInboxStatusPill submissionId={submissionId} status={status} />
      {seenAt ? (
        <button
          type="button"
          className="yd-tracker-case-meta__read-btn text-[12px] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-50"
          disabled={pending}
          onClick={markUnread}
        >
          Als ungelesen markieren
        </button>
      ) : (
        <span className="yd-tracker-v14-inbox-card__fresh-badge" aria-label="Neu">
          Neu
        </span>
      )}
    </div>
  );
}
