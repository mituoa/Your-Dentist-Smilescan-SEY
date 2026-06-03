"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RelaySectionBoxProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
  noPadding?: boolean;
  /** Nur Inhalt — kein Box-Titel (z. B. Toolbar). */
  hideTitle?: boolean;
};

/** Einheitliche Relay-Box — gleiche Sprache wie Tracker V4 / Dashboard. */
export function RelaySectionBox({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  id,
  noPadding = false,
  hideTitle = false,
}: RelaySectionBoxProps) {
  return (
    <section
      id={id}
      className={cn("yd-relay-v4-box", className)}
      aria-labelledby={!hideTitle && id ? `${id}-title` : undefined}
    >
      {!hideTitle ? (
        <header className="yd-relay-v4-box__head">
          <div className="min-w-0">
            <h2 id={id ? `${id}-title` : undefined} className="yd-relay-v4-box__title">
              {title}
            </h2>
            {subtitle ? <p className="yd-relay-v4-box__subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div className="yd-relay-v4-box__action shrink-0">{action}</div> : null}
        </header>
      ) : action ? (
        <header className="yd-relay-v4-box__head yd-relay-v4-box__head--action-only">
          <div className="min-w-0 flex-1">{null}</div>
          <div className="yd-relay-v4-box__action shrink-0">{action}</div>
        </header>
      ) : null}
      <div className={cn("yd-relay-v4-box__body", noPadding && "yd-relay-v4-box__body--flush", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
