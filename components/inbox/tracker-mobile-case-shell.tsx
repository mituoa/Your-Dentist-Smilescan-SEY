"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import type { TrackerActionItem } from "@/lib/inbox/build-tracker-decision";
import { cn } from "@/lib/utils";

type TrackerMobileCaseShellProps = {
  fallakte: React.ReactNode;
  assistent: React.ReactNode;
  actions: TrackerActionItem[];
  statusLabel: string;
  patientName: string;
  backHref: string;
};

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function TrackerMobileCaseShell({
  fallakte,
  assistent,
  actions,
  statusLabel,
  patientName,
  backHref,
}: TrackerMobileCaseShellProps) {
  const [pane, setPane] = useState<"fallakte" | "assistent">("fallakte");

  const primary = actions.find((a) => a.variant === "primary" && !a.disabled);

  const onPrimary = useCallback(() => {
    if (!primary) return;
    setPane("assistent");
    const anchor = primary.scrollTo;
    if (anchor) {
      requestAnimationFrame(() => scrollToAnchor(anchor));
    }
  }, [primary]);

  return (
    <div className="yd-tracker-mobile-case md:hidden">
      <header className="yd-tracker-mobile-case__top">
        <Link href={backHref} className="yd-tracker-mobile-case__back">
          ← Patienten
        </Link>
        <div className="yd-tracker-mobile-case__meta">
          <p className="yd-tracker-mobile-case__patient">{patientName}</p>
          <p className="yd-tracker-mobile-case__status">{statusLabel}</p>
        </div>
      </header>

      <div
        className={cn(
          "yd-tracker-mobile-case__pane",
          pane === "fallakte" && "yd-tracker-mobile-case__pane--active"
        )}
        role="tabpanel"
        aria-hidden={pane !== "fallakte"}
      >
        {fallakte}
      </div>

      <div
        className={cn(
          "yd-tracker-mobile-case__pane",
          pane === "assistent" && "yd-tracker-mobile-case__pane--active"
        )}
        role="tabpanel"
        aria-hidden={pane !== "assistent"}
      >
        {assistent}
      </div>

      <div className="yd-tracker-mobile-case__dock" role="region" aria-label="Fallaktionen">
        {primary && pane === "fallakte" ? (
          <button type="button" className="yd-tracker-mobile-case__primary" onClick={onPrimary}>
            {primary.label}
          </button>
        ) : null}

        <div className="yd-tracker-mobile-case__segments" role="tablist" aria-label="Fallansicht">
          <button
            type="button"
            role="tab"
            aria-selected={pane === "fallakte"}
            className={cn(
              "yd-tracker-mobile-case__segment",
              pane === "fallakte" && "yd-tracker-mobile-case__segment--active"
            )}
            onClick={() => setPane("fallakte")}
          >
            Fallakte
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pane === "assistent"}
            className={cn(
              "yd-tracker-mobile-case__segment",
              pane === "assistent" && "yd-tracker-mobile-case__segment--active"
            )}
            onClick={() => setPane("assistent")}
          >
            Assistent
          </button>
        </div>
      </div>
    </div>
  );
}

/** Desktop: unverändertes Zwei-Spalten-Layout. */
export function TrackerDesktopCaseLayout({
  fallakte,
  assistent,
}: {
  fallakte: React.ReactNode;
  assistent: React.ReactNode;
}) {
  return (
    <div className="yd-tracker-triage hidden md:flex">
      <div className="yd-tracker-triage__fallakte">{fallakte}</div>
      {assistent}
    </div>
  );
}
