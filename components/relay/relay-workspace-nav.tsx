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

export function RelayWorkspaceNav({ snapshot, active, onSelect }: Props) {
  const total = relayTotalOpenCount(snapshot);

  return (
    <nav className="rw-nav" aria-label="Arbeitsbereiche">
      <p className="rw-nav__total">
        <span className="rw-nav__total-num">{total}</span>
        <span className="rw-nav__total-label">offen</span>
      </p>
      <ul className="rw-nav__list">
        {RELAY_WORK_AREAS.map((area) => {
          const count = relayWorkAreaCount(snapshot, area.id);
          const isActive = area.id === active;
          return (
            <li key={area.id}>
              <button
                type="button"
                className={cn("rw-nav__item", isActive && "rw-nav__item--active")}
                onClick={() => onSelect(area.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="rw-nav__label">{area.title}</span>
                <span className="rw-nav__count">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
