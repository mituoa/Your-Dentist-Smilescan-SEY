"use client";

import type { RelayPracticeSection } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type RelaySectionNavProps = {
  sections: {
    id: RelayPracticeSection;
    title: string;
    count: number;
  }[];
  active: RelayPracticeSection;
  onSelect: (section: RelayPracticeSection) => void;
  className?: string;
};

/** V6 — horizontale Bereichsnavigation, keine Karten. */
export function RelaySectionNav({ sections, active, onSelect, className }: RelaySectionNavProps) {
  return (
    <nav className={cn("yd-relay-v6-nav", className)} role="tablist" aria-label="Relay-Bereiche">
      {sections.map((section) => {
        const isActive = section.id === active;
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn("yd-relay-v6-nav__item", isActive && "yd-relay-v6-nav__item--active")}
            onClick={() => onSelect(section.id)}
          >
            <span className="yd-relay-v6-nav__label">{section.title}</span>
            <span
              className={cn(
                "yd-relay-v6-nav__count",
                section.count === 0 && "yd-relay-v6-nav__count--zero"
              )}
            >
              {section.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
