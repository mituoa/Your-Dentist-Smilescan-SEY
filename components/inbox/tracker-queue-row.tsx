import type { QueueRowModel } from "@/lib/inbox/tracker-queue-presentational";
import { cn } from "@/lib/utils";

type TrackerQueueRowProps = {
  row: QueueRowModel;
  isActive?: boolean;
  onOpen: () => void;
};

/**
 * Eine Queue-Zeile — CSS-Grid, keine HTML-Tabelle.
 */
export function TrackerQueueRow({ row, isActive = false, onOpen }: TrackerQueueRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn("yd-tq-row", isActive && "yd-tq-row--active")}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="yd-tq-row__patient">
        <span className="yd-tq-row__avatar" aria-hidden>
          {initials(row.patientName)}
        </span>
        <div className="yd-tq-row__patient-text">
          <span className="yd-tq-row__name">{row.patientName}</span>
          {(row.ageLabel || row.birthLabel) && (
            <span className="yd-tq-row__demographics">
              {[row.ageLabel, row.birthLabel].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      </div>

      <div className="yd-tq-row__activity">{row.activityLabel}</div>

      <div className="yd-tq-row__falltyp">
        <span className="yd-tq-row__falltyp-primary">{row.falltypPrimary}</span>
        {row.falltypCategory ? (
          <span className="yd-tq-row__falltyp-category">{row.falltypCategory}</span>
        ) : null}
      </div>

      <div className="yd-tq-row__priority">
        <span
          className={cn(
            "yd-tq-row__priority-pill",
            `yd-tq-row__priority-pill--${row.priorityLevel}`
          )}
        >
          {row.priorityLabel}
        </span>
      </div>

      <div className="yd-tq-row__action">{row.actionLabel}</div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
