"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { InboxSearchFigma } from "@/components/inbox/inbox-search-figma";
import { TrackerDecisionCard } from "@/components/inbox/tracker-decision-card";
import { TrackerDecisionHero } from "@/components/inbox/tracker-decision-hero";
import { TrackerDecisionKpis } from "@/components/inbox/tracker-decision-kpis";
import type { TrackerDecisionKpi } from "@/lib/inbox/tracker-praxis-status";
import { formatDecisionHero } from "@/lib/inbox/tracker-praxis-status";
import type { DecisionCardModel } from "@/lib/inbox/tracker-v12-presentational";

type TrackerQueueShellProps = {
  decisions: DecisionCardModel[];
  kpis: TrackerDecisionKpi[];
  decisionCount: number;
  showCreateCase?: boolean;
  emptyMessage?: string;
  pageStart: number;
  pageEnd: number;
  totalCount: number;
  safePage: number;
  totalPages: number;
  onOpen: (id: string) => void;
  onPagePrev: () => void;
  onPageNext: () => void;
};

/**
 * Tracker — Operations Center: Entscheidungen, nicht Patientenliste.
 */
export function TrackerQueueShell({
  decisions,
  kpis,
  decisionCount,
  showCreateCase = false,
  emptyMessage = "Keine offenen Entscheidungen.",
  pageStart,
  pageEnd,
  totalCount,
  safePage,
  totalPages,
  onOpen,
  onPagePrev,
  onPageNext,
}: TrackerQueueShellProps) {
  return (
    <div className="yd-tq-workspace yd-tq-workspace--decisions">
      <header className="yd-tq-header">
        <div className="yd-tq-header__copy">
          <h1 className="yd-tq-header__title">Tracker</h1>
        </div>
        <div className="yd-tq-header__tools">
          <div className="yd-tq-header__search">
            <InboxSearchFigma
              inputPlaceholder="Entscheidungen durchsuchen …"
              searchAriaLabel="Offene Entscheidungen durchsuchen"
            />
          </div>
          {showCreateCase ? (
            <Link href="/create-case?from=inbox" className="yd-tq-header__cta">
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Neuer Fall
            </Link>
          ) : null}
        </div>
      </header>

      <div className="yd-tq-decision-center">
        <TrackerDecisionHero headline={formatDecisionHero(decisionCount)} />
        <TrackerDecisionKpis kpis={kpis} />

        <section
          className="yd-tq-decision-queue"
          aria-labelledby="yd-tq-decision-queue-title"
        >
          <h2 id="yd-tq-decision-queue-title" className="yd-tq-decision-queue__title">
            Offene Entscheidungen
          </h2>

          {decisions.length === 0 ? (
            <div className="yd-tq-decision-queue__empty">
              <p>{emptyMessage}</p>
              <p className="yd-tq-decision-queue__empty-hint">
                Neue Einsendungen und Freigaben erscheinen hier automatisch.
              </p>
            </div>
          ) : (
            <div className="yd-tq-decision-queue__list" role="list">
              {decisions.map((decision) => (
                <TrackerDecisionCard
                  key={decision.id}
                  decision={decision}
                  onOpen={() => onOpen(decision.id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <footer className="yd-tq-decision-queue__footer">
              <span>
                {pageStart}–{pageEnd} von {totalCount}
              </span>
              <div className="yd-tq-decision-queue__pager">
                <button type="button" disabled={safePage <= 1} onClick={onPagePrev}>
                  Zurück
                </button>
                <span>
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={onPageNext}
                >
                  Weiter
                </button>
              </div>
            </footer>
          ) : null}
        </section>
      </div>
    </div>
  );
}
