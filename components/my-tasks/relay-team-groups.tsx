"use client";

import type { RelayPracticeGroup, RelayPracticeGroupId } from "@/lib/relay/relay-practice-groups";
import { cn } from "@/lib/utils";

type RelayTeamGroupsProps = {
  groups: RelayPracticeGroup[];
  selectedId: RelayPracticeGroupId | null;
  onSelect: (id: RelayPracticeGroupId | null) => void;
};

/** Team-Übersicht — Medical Blue, keine KPI-Kacheln. */
export function RelayTeamGroups({ groups, selectedId, onSelect }: RelayTeamGroupsProps) {
  return (
    <section className="yd-relay-v4-team" aria-label="Team-Bereiche">
      <p className="yd-relay-v4-team__title">Team</p>
      <ul className="yd-relay-v4-team__list">
        {groups.map((group) => {
          const active = selectedId === group.id;
          return (
            <li key={group.id}>
              <button
                type="button"
                className={cn("yd-relay-v4-team__item", active && "yd-relay-v4-team__item--active")}
                onClick={() => onSelect(active ? null : group.id)}
              >
                <span className="yd-relay-v4-team__label">{group.label}</span>
                <span className="yd-relay-v4-team__count">
                  {group.count === 1 ? "1 offene Aufgabe" : `${group.count} offene Aufgaben`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
