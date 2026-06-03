import {
  resolveMessageDraftBadge,
  type MessageDraftListStatus,
} from "@/lib/message-drafts/list-status";
import { cn } from "@/lib/utils";

type MessageDraftStatusBadgeProps = {
  draftStatus: MessageDraftListStatus;
  readyForReview: boolean;
  className?: string;
};

export function MessageDraftStatusBadge({
  draftStatus,
  readyForReview,
  className,
}: MessageDraftStatusBadgeProps) {
  const badge = resolveMessageDraftBadge({ draftStatus, readyForReview });
  if (!badge) return null;

  return (
    <span
      className={cn("yd-message-draft-badge", `yd-message-draft-badge--${badge.variant}`, className)}
      title={badge.title}
    >
      {badge.label}
    </span>
  );
}
