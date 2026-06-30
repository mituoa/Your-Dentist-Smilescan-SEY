"use client";

import { TrackerInboxListStatusMenu } from "@/components/inbox/tracker-inbox-list-status-menu";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  trackerInboxReadState,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import { formatTrackerRelativeIngress } from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

type TrackerInboxListCardContentProps = {
  item: EnrichedSubmissionListItem;
  className?: string;
  /** Status-Menü separat neben der Karte rendern (Mobile). */
  showStatusMenu?: boolean;
};

/** Inhalt einer Tracker-Listenkarte — Name, Anliegen-Vorschau (grau), dezentes Status-Menü. */
export function TrackerInboxListCardContent({
  item,
  className,
  showStatusMenu = true,
}: TrackerInboxListCardContentProps) {
  const patientName = item.patient_name?.trim() || "Unbekannter Patient";
  const readState = trackerInboxReadState(item);
  const timeLabel = formatTrackerRelativeIngress(item.created_at);
  const preview = deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
    maxLen: 96,
    emptyLabel: "",
  });

  return (
    <>
      <span className={cn("yd-tracker-v16-inbox-card__scan", className)}>
        <span className="yd-tracker-v16-inbox-card__headline-row">
          <span className="yd-tracker-v16-inbox-card__patient-wrap">
            {readState !== "read" ? (
              <span
                className={cn(
                  "yd-tracker-v16-unread-pip",
                  readState === "new_submission" && "yd-tracker-v16-unread-pip--new"
                )}
                aria-label={
                  readState === "new_submission" ? "Neue Einsendung" : "Ungelesen"
                }
              />
            ) : null}
            <span
              className={cn(
                "yd-tracker-v16-inbox-card__patient",
                readState !== "read" && "yd-tracker-v16-inbox-card__patient--unread"
              )}
            >
              {patientName}
            </span>
          </span>
          <span className="yd-tracker-v16-inbox-card__headline-actions">
            <span className="yd-tracker-v16-inbox-card__time">{timeLabel}</span>
            {showStatusMenu ? (
              <TrackerInboxListStatusMenu
                submissionId={item.id}
                status={item.practice_status}
                seenAt={item.seen_at}
              />
            ) : null}
          </span>
        </span>
        {preview ? (
          <span className="yd-tracker-v16-inbox-card__preview">{preview}</span>
        ) : null}
      </span>
    </>
  );
}
