"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type DashboardProgressiveSectionProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  /** Mobile: section starts expanded when true */
  defaultOpen?: boolean;
  /** Mobile: always show content (core workspace depth) */
  mobileAlwaysOpen?: boolean;
};

/**
 * Desktop: children always visible.
 * Mobile: collapsible fold to reduce simultaneous information density.
 */
export function DashboardProgressiveSection({
  title,
  hint,
  children,
  defaultOpen = false,
  mobileAlwaysOpen = false,
}: DashboardProgressiveSectionProps) {
  return (
    <details
      className={`yd-dash-fold${mobileAlwaysOpen ? " yd-dash-fold--mobile-open" : ""}`}
      open={defaultOpen || mobileAlwaysOpen}
    >
      <summary className="yd-dash-fold__summary">
        <span className="min-w-0">
          <span className="yd-dash-fold__title block">{title}</span>
          {hint ? <span className="yd-dash-fold__hint mt-0.5 block">{hint}</span> : null}
        </span>
        <ChevronDown className="yd-dash-fold__chevron" strokeWidth={2} aria-hidden />
      </summary>
      <div className="yd-dash-fold__panel">{children}</div>
    </details>
  );
}
