"use client";

import Link from "next/link";

import { TrackerInboxListStatusMenu } from "@/components/inbox/tracker-inbox-list-status-menu";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { displayPracticeStatusForCase } from "@/lib/inbox/tracker-enterprise-status";
import {
  trackerInboxReadState,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import { formatTrackerRelativeIngress } from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

type TrackerMobileInboxRowProps = {
  item: EnrichedSubmissionListItem;
  href: string;
  isActive: boolean;
  onOpen: () => void;
};

/** Flache Mobile-Zeile — eine Fläche, kein Kästchen im Kästchen. */
export function TrackerMobileInboxRow({
  item,
  href,
  isActive,
  onOpen,
}: TrackerMobileInboxRowProps) {
  const patientName = item.patient_name?.trim() || "Unbekannter Patient";
  const readState = trackerInboxReadState(item);
  const timeLabel = formatTrackerRelativeIngress(item.created_at);
  const preview = deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
    maxLen: 72,
    emptyLabel: "",
  });
  const practiceStatus = displayPracticeStatusForCase(item.practice_status);
  const isUnread = readState !== "read";

  return (
    <div
      className={cn(
        "yd-tracker-mobile-row",
        isActive && "yd-tracker-mobile-row--active",
        readState === "new_submission" && "yd-tracker-mobile-row--fresh",
        readState === "marked_unread" && "yd-tracker-mobile-row--unread"
      )}
    >
      <Link
        href={href}
        prefetch={false}
        scroll={false}
        className="yd-tracker-mobile-row__main"
        aria-current={isActive ? "page" : undefined}
        onClick={onOpen}
      >
        {isUnread ? (
          <span
            className={cn(
              "yd-tracker-mobile-row__pip",
              readState === "new_submission" && "yd-tracker-mobile-row__pip--new"
            )}
            aria-hidden
          />
        ) : (
          <span className="yd-tracker-mobile-row__pip yd-tracker-mobile-row__pip--read" aria-hidden />
        )}
        <span className="yd-tracker-mobile-row__copy">
          <span
            className={cn(
              "yd-tracker-mobile-row__name",
              isUnread && "yd-tracker-mobile-row__name--unread"
            )}
          >
            {patientName}
          </span>
          {preview ? (
            <span className="yd-tracker-mobile-row__preview">{preview}</span>
          ) : null}
        </span>
        <span className="yd-tracker-mobile-row__time">{timeLabel}</span>
      </Link>
      <TrackerInboxListStatusMenu
        submissionId={item.id}
        status={practiceStatus}
        seenAt={item.seen_at}
        className="yd-tracker-mobile-row__status"
      />
    </div>
  );
}
