"use client";

import type { RelayWorkspaceArea } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type RelayAreaRailProps = {
  areas: { id: RelayWorkspaceArea; label: string; count: number }[];
  active: RelayWorkspaceArea;
  onSelect: (area: RelayWorkspaceArea) => void;
};

/** Linke Bereichsnavigation — kein Filter-Chaos oben. */
export function RelayAreaRail({ areas, active, onSelect }: RelayAreaRailProps) {
  return (
    <nav className="yd-relay-v4-rail" aria-label="Relay-Bereiche">
      <p className="yd-relay-v4-rail__title">Vorgänge</p>
      <ul className="yd-relay-v4-rail__list">
        {areas.map((area) => {
          const isActive = area.id === active;
          return (
            <li key={area.id}>
              <button
                type="button"
                className={cn("yd-relay-v4-rail__item", isActive && "yd-relay-v4-rail__item--active")}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(area.id)}
              >
                <span className="yd-relay-v4-rail__label">{area.label}</span>
                {area.count > 0 ? (
                  <span className="yd-relay-v4-rail__count">{area.count}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
