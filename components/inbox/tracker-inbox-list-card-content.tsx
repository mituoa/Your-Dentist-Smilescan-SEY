"use client";

import { TrackerInboxListStatusMenu } from "@/components/inbox/tracker-inbox-list-status-menu";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { displayPracticeStatusForCase } from "@/lib/inbox/tracker-enterprise-status";
import {
  trackerInboxReadState,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import { formatTrackerRelativeIngress } from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

type TrackerInboxListCardContentProps = {
  item: EnrichedSubmissionListItem;
  className?: string;
};

/** Inhalt einer Tracker-Listenkarte — Name, Anliegen-Vorschau (grau), dezentes Status-Menü. */
export function TrackerInboxListCardContent({
  item,
  className,
}: TrackerInboxListCardContentProps) {
  const patientName = item.patient_name?.trim() || "Unbekannter Patient";
  const readState = trackerInboxReadState(item);
  const timeLabel = formatTrackerRelativeIngress(item.created_at);
  const preview = deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
    maxLen: 96,
    emptyLabel: "",
  });
  const practiceStatus = displayPracticeStatusForCase(item.practice_status);

  return (
    <>
      <span className="yd-tracker-v15-inbox-card__urgency-rail" aria-hidden />
      <span className={cn("yd-tracker-v16-inbox-card__scan", className)}>
        <span className="yd-tracker-v16-inbox-card__headline-row">
          <span
            className={cn(
              "yd-tracker-v16-inbox-card__patient",
              readState === "new_submission" && "yd-tracker-v16-inbox-card__patient--new"
            )}
          >
            {patientName}
          </span>
          {readState === "new_submission" ? (
            <span
              className="yd-tracker-v16-ingress-badge yd-tracker-v16-ingress-badge--new"
              aria-label="Neue Einsendung"
            >
              Neu
            </span>
          ) : null}
          {readState === "marked_unread" ? (
            <span
              className="yd-tracker-v16-ingress-badge yd-tracker-v16-ingress-badge--unread"
              aria-label="Ungelesen"
            >
              Ungelesen
            </span>
          ) : null}
          <span className="yd-tracker-v16-inbox-card__headline-actions">
            <span className="yd-tracker-v16-inbox-card__time">{timeLabel}</span>
            <TrackerInboxListStatusMenu
              submissionId={item.id}
              status={practiceStatus}
              seenAt={item.seen_at}
            />
          </span>
        </span>
        {preview ? (
          <span className="yd-tracker-v16-inbox-card__preview">{preview}</span>
        ) : null}
      </span>
    </>
  );
}
