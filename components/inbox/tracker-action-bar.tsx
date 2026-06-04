"use client";

import Link from "next/link";

import type { TrackerActionItem } from "@/lib/inbox/build-tracker-decision";
import { cn } from "@/lib/utils";

type TrackerActionBarProps = {
  actions: TrackerActionItem[];
};

function handleScrollTo(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function TrackerActionBar({ actions }: TrackerActionBarProps) {
  return (
    <div className="yd-tracker-assistent-actions" role="toolbar" aria-label="Nächste Schritte">
      <div className="yd-tracker-assistent-actions__inner">
        {actions.map((action) => {
          const className = cn(
            "yd-tracker-assistent-actions__btn",
            action.variant === "primary" && "yd-tracker-assistent-actions__btn--primary",
            action.disabled && "yd-tracker-assistent-actions__btn--disabled"
          );

          if (action.href && !action.disabled) {
            return (
              <Link
                key={action.id}
                href={action.href}
                className={className}
                title={action.title}
              >
                {action.label}
              </Link>
            );
          }

          if (action.scrollTo && !action.disabled) {
            return (
              <button
                key={action.id}
                type="button"
                className={className}
                title={action.title}
                onClick={() => handleScrollTo(action.scrollTo!)}
              >
                {action.label}
              </button>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              className={className}
              disabled={action.disabled}
              title={action.title}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
