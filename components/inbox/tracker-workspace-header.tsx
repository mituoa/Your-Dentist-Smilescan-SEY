import {
  trackerPriorityForRow,
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { cn } from "@/lib/utils";

type TrackerWorkspaceHeaderProps = {
  patientName: string;
  concern: string | null;
  status: TrackerStatusDisplay;
  statusRow: EnrichedSubmissionListItem;
};

/** Kompakter Arbeitskopf — wer wartet, kein Stammdaten-Grid. */
export function TrackerWorkspaceHeader({
  patientName,
  concern,
  status,
  statusRow,
}: TrackerWorkspaceHeaderProps) {
  const priority = trackerPriorityForRow(statusRow);

  return (
    <header className="yd-tracker-workspace-header">
      <div className="yd-tracker-workspace-header__main">
        <p className="yd-tracker-workspace-header__eyebrow">Aktueller Fall</p>
        <h2 className="yd-tracker-workspace-header__name">{patientName}</h2>
        {concern ? (
          <p className="yd-tracker-workspace-header__concern">{concern}</p>
        ) : null}
      </div>
      <div className="yd-tracker-workspace-header__badges">
        <span
          className={cn("yd-tracker-table__status", status.className)}
        >
          <span className="yd-tracker-table__status-dot" aria-hidden />
          {status.label}
        </span>
        <span className={cn("yd-tracker-inbox-card__priority", priority.className)}>
          {priority.label}
        </span>
      </div>
    </header>
  );
}
