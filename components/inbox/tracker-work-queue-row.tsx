import type { WorkQueueRowModel } from "@/lib/inbox/tracker-v12-presentational";
import { cn } from "@/lib/utils";

type TrackerWorkQueueRowProps = {
  row: WorkQueueRowModel;
  onOpen: () => void;
  /** Priorisierte Zeile — stärkere Arbeitshierarchie */
  variant?: "priority" | "queue";
};

/** Arbeits-Queue-Zeile — Arbeit primär, Patient sekundär. */
export function TrackerWorkQueueRow({
  row,
  onOpen,
  variant = "queue",
}: TrackerWorkQueueRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "yd-tq-work-row",
        `yd-tq-work-row--${row.accent}`,
        `yd-tq-work-row--status-${row.statusKind}`,
        variant === "priority" && "yd-tq-work-row--priority"
      )}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <span className="yd-tq-work-row__avatar" aria-hidden>
        {initials(row.patientName)}
      </span>

      <div className="yd-tq-work-row__main">
        <div className="yd-tq-work-row__workline">
          <span
            className={cn(
              "yd-tq-status yd-tq-status--headline",
              `yd-tq-status--${row.statusKind}`
            )}
          >
            {row.workHeadline}
          </span>
          {row.detailLine ? (
            <span className="yd-tq-work-row__work-detail">{row.detailLine}</span>
          ) : null}
        </div>
        <span className="yd-tq-work-row__patient">{row.patientName}</span>
        <span className="yd-tq-work-row__context">{row.contextLine}</span>
        <span className="yd-tq-work-row__signals">
          {row.ingressLine ? (
            <span className="yd-tq-work-row__ingress">{row.ingressLine}</span>
          ) : null}
          <span className="yd-tq-work-row__time">{row.timeLine}</span>
          {row.showPriority ? (
            <span
              className={cn(
                "yd-tq-work-row__priority",
                `yd-tq-work-row__priority--${row.priorityLevel}`
              )}
            >
              {row.priorityLabel}
            </span>
          ) : null}
        </span>
      </div>

      <div className="yd-tq-work-row__trail">
        <span className="yd-tq-work-row__action">{row.actionLabel}</span>
      </div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
