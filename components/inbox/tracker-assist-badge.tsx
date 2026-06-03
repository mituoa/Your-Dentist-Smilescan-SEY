import { cn } from "@/lib/utils";
import type { TrackerAssistHint } from "@/lib/inbox/tracker-inbox-logic";

type TrackerAssistBadgeProps = {
  hint: TrackerAssistHint;
  className?: string;
};

export function TrackerAssistBadge({ hint, className }: TrackerAssistBadgeProps) {
  return (
    <span
      className={cn(
        "yd-tracker-assist-badge",
        `yd-tracker-assist-badge--${hint.variant}`,
        className
      )}
    >
      {hint.label}
    </span>
  );
}
