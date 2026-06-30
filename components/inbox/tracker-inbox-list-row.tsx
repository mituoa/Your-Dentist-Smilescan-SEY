"use client";

import Link from "next/link";

import { TrackerInboxListStatusMenu } from "@/components/inbox/tracker-inbox-list-status-menu";
import { displayPracticeStatusForCase } from "@/lib/inbox/tracker-enterprise-status";
import {
  formatTrackerListDate,
  trackerInboxReadState,
  trackerInboxWorkType,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import { cn } from "@/lib/utils";

type TrackerInboxListRowProps = {
  item: EnrichedSubmissionListItem;
  href: string;
  isActive: boolean;
  onOpen: () => void;
};

/** Flache Tracker-Zeile — eine Oberfläche wie V8, Status-Menü seitlich. */
export function TrackerInboxListRow({
  item,
  href,
  isActive,
  onOpen,
}: TrackerInboxListRowProps) {
  const patientName = item.patient_name?.trim() || "Unbekannter Patient";
  const readState = trackerInboxReadState(item);
  const work = trackerInboxWorkType(item);
  const practiceStatus = displayPracticeStatusForCase(item.practice_status);
  const isUnread = readState !== "read";
  const photoLabel =
    item.photo_count === 0
      ? "Keine Bilder"
      : item.photo_count === 1
        ? "1 Bild"
        : `${item.photo_count} Bilder`;

  return (
    <div
      className={cn(
        "yd-tracker-inbox-list-row",
        isActive && "yd-tracker-inbox-list-row--active",
        isUnread && !isActive && "yd-tracker-inbox-list-row--unread",
        readState === "new_submission" && "yd-tracker-inbox-list-row--fresh"
      )}
    >
      <Link
        href={href}
        prefetch={false}
        scroll={false}
        className="yd-tracker-inbox-list-row__tap"
        aria-current={isActive ? "page" : undefined}
        onClick={onOpen}
      >
        <div className="yd-tracker-v4-inbox-card__main yd-tracker-v8-inbox-card__main">
          <span className="yd-tracker-v8-inbox-card__name">{patientName}</span>
          <span
            className={cn(
              "yd-tracker-v8-inbox-card__status",
              `yd-tracker-v8-inbox-card__status--${work.kind}`
            )}
          >
            {work.headline}
          </span>
        </div>
        <div className="yd-tracker-v4-inbox-card__meta">
          <span>{formatTrackerListDate(item.created_at)}</span>
          <span aria-hidden> · </span>
          <span>{photoLabel}</span>
        </div>
      </Link>
      <TrackerInboxListStatusMenu
        submissionId={item.id}
        status={practiceStatus}
        seenAt={item.seen_at}
        className="yd-tracker-inbox-list-row__status"
      />
    </div>
  );
}
