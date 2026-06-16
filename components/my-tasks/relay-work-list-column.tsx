"use client";

import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import { RelayPremiumEmpty } from "@/components/my-tasks/relay-premium-empty";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type RelayWorkListColumnProps = {
  groupByTeam?: boolean;
  rows: RelayWorkRow[];
  selectedId: string | null;
  emptyTitle: string;
  emptyBody: string;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  isDoctor?: boolean;
  onMessageCreated?: () => void;
  onSelect: (rowId: string) => void;
};

function groupRowsByLabel(rows: RelayWorkRow[]): { label: string; rows: RelayWorkRow[] }[] {
  const order: string[] = [];
  const map = new Map<string, RelayWorkRow[]>();
  for (const row of rows) {
    const label = row.groupLabel?.trim() || "Team";
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(row);
  }
  return order.map((label) => ({ label, rows: map.get(label)! }));
}

function WorkRow({
  row,
  active,
  onSelect,
}: {
  row: RelayWorkRow;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const typeName = row.workTypeLabel ?? row.typeLabel;
  const showStatusMark =
    row.isCritical ||
    row.statusLabel.toLowerCase().includes("freigabe") ||
    row.statusLabel.toLowerCase().includes("entscheidung") ||
    row.statusLabel.toLowerCase().includes("wartet");

  const waitMeta = row.waitingLabel ?? row.timeLabel;
  const routeMeta = `${row.fromLabel} → ${row.toLabel}`;

  return (
    <li className="yd-relay-v8-row-wrap">
      <button
        type="button"
        className={cn(
          "yd-relay-v6-row yd-relay-v8-row",
          active && "yd-relay-v8-row--active",
          row.isCritical && "yd-relay-v6-row--urgent"
        )}
        onClick={() => onSelect(row.id)}
        aria-label={[typeName, routeMeta, waitMeta].filter(Boolean).join(", ")}
      >
        <span className="yd-relay-v8-row__type">
          {showStatusMark ? <span className="yd-relay-v8-row__status-mark" aria-hidden /> : null}
          {typeName}
        </span>
        <span className="yd-relay-v8-row__route">{routeMeta}</span>
        {waitMeta ? <span className="yd-relay-v8-row__time">{waitMeta}</span> : null}
      </button>
    </li>
  );
}

/** Linke Spalte — echte Arbeitsobjekte. */
export function RelayWorkListColumn({
  groupByTeam = false,
  rows,
  selectedId,
  emptyTitle,
  emptyBody,
  assignableMembers,
  currentUserId,
  isDoctor = false,
  onMessageCreated,
  onSelect,
}: RelayWorkListColumnProps) {
  const workRows = rows.filter((r) => !r.isGhost);

  return (
    <div className="yd-relay-v6-list flex min-h-0 flex-1 flex-col">
      <div className="yd-relay-v6-list__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {workRows.length === 0 ? (
          <div className="yd-relay-v6-list__empty">
            <RelayPremiumEmpty variant="inline" title={emptyTitle} text={emptyBody} />
            <RelayCreateMenu
              placement="inline"
              assignableMembers={assignableMembers}
              currentUserId={currentUserId}
              isDoctor={isDoctor}
              onMessageCreated={onMessageCreated}
            />
          </div>
        ) : groupByTeam ? (
          <ul className="yd-relay-v6-list__groups">
            {groupRowsByLabel(workRows).map((group) => (
              <li key={group.label} className="yd-relay-v6-list__group">
                <p className="yd-relay-v6-list__group-label">{group.label}</p>
                <ul className="yd-relay-v6-list__items">
                  {group.rows.map((row) => (
                    <WorkRow
                      key={row.id}
                      row={row}
                      active={row.id === selectedId}
                      onSelect={onSelect}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="yd-relay-v6-list__items">
            {workRows.map((row) => (
              <WorkRow
                key={row.id}
                row={row}
                active={row.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
