"use client";

import type { RelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import {
  RELAY_WORK_AREAS,
  relayTotalOpenCount,
  relayWorkAreaCount,
  type RelayWorkAreaId,
} from "@/lib/relay/relay-work-areas";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: RelayPracticeSnapshot;
  active: RelayWorkAreaId;
  onSelect: (areaId: RelayWorkAreaId) => void;
};

export function RelayWorkAreaNav({ snapshot, active, onSelect }: Props) {
  const total = relayTotalOpenCount(snapshot);

  return (
    <nav className="yd-relay-cw__nav" aria-label="Arbeitsbereiche">
      <div className="yd-relay-cw__nav-section">Arbeitsbereiche</div>
      <ul className="yd-relay-cw__nav-list">
        {RELAY_WORK_AREAS.map((area) => {
          const count = relayWorkAreaCount(snapshot, area.id);
          const isActive = area.id === active;
          return (
            <li key={area.id}>
              <button
                type="button"
                className={cn("yd-relay-cw__nav-item", isActive && "yd-relay-cw__nav-item--active")}
                onClick={() => onSelect(area.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="yd-relay-cw__nav-label">{area.title}</span>
                {count > 0 ? <span className="yd-relay-cw__nav-count">{count}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="yd-relay-cw__nav-footer">
        <span className="yd-relay-cw__nav-footer-num">{total}</span>
        <span className="yd-relay-cw__nav-footer-label">gesamt offen</span>
      </div>
    </nav>
  );
}
