"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { buildTrackerHeaderSummary } from "@/lib/inbox/tracker-header-summary";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  TRACKER_FILTER_HINTS,
  TRACKER_OPTIONAL_FILTER_CHIPS,
  countByTrackerFilter,
  inboxUrgencyVisualTier,
  matchesTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  trackerInboxAttentionTier,
  trackerInboxWorkType,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import { formatTrackerRelativeIngress } from "@/lib/inbox/tracker-v9-clinical";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

type TrackerMobileInboxProps = {
  items: SubmissionListItem[];
};

function caseHref(id: string, q?: string | null): string {
  return q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
}

/** Mobile Tracker-Liste — Desktop-V16-Karten, Tap öffnet Vollbild-Fall. */
export function TrackerMobileInbox({ items }: TrackerMobileInboxProps) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();
  const qLower = q?.toLowerCase() ?? "";

  const enriched = useMemo(
    () => sortTrackerInboxItems(items as EnrichedSubmissionListItem[]),
    [items]
  );

  const [filter, setFilter] = useState<TrackerInboxFilter>("all");

  const searchScoped = useMemo(
    () => enriched.filter((item) => matchesTrackerSearch(item, qLower)),
    [enriched, qLower]
  );

  const filtered = useMemo(
    () => searchScoped.filter((item) => matchesTrackerFilter(item, filter)),
    [searchScoped, filter]
  );

  const headerSummary = useMemo(
    () => buildTrackerHeaderSummary(searchScoped),
    [searchScoped]
  );

  const optionalChips = useMemo(
    () =>
      TRACKER_OPTIONAL_FILTER_CHIPS.filter(
        (chip) => countByTrackerFilter(searchScoped, chip.id) > 0
      ),
    [searchScoped]
  );

  useEffect(() => {
    setFilter("all");
  }, [qLower]);

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-mobile-inbox flex h-full min-h-0 flex-1 flex-col">
      <header className="yd-tracker-mobile-inbox__head shrink-0">
        <h1 className="yd-tracker-mobile-inbox__title">{headerSummary.lead}</h1>
        <p className="yd-tracker-mobile-inbox__lead">{headerSummary.breakdown}</p>
      </header>

      <div className="yd-tracker-mobile-inbox__filters shrink-0">
        <div className="yd-tracker-filter-scroll">
          <div
            className="yd-tracker-filter-chips"
            role="tablist"
            aria-label="Arbeit in der Liste filtern"
          >
            {[...TRACKER_FILTER_CHIPS, ...optionalChips].map((chip) => {
              const count = countByTrackerFilter(searchScoped, chip.id);
              const active = filter === chip.id;
              const hint = TRACKER_FILTER_HINTS[chip.id];
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={hint}
                  aria-description={hint}
                  className={cn("yd-tracker-filter-chip", active && "yd-tracker-filter-chip--active")}
                  onClick={() => setFilter(chip.id)}
                >
                  <span>{chip.label}</span>
                  <span
                    className={cn(
                      "yd-tracker-filter-chip__count",
                      count === 0 && "yd-tracker-filter-chip__count--zero"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ul
        className="yd-tracker-mobile-inbox__list min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        aria-label="Patientenfälle"
      >
        {filtered.length === 0 ? (
          <li className="yd-tracker-mobile-inbox__empty">{emptyCopy}</li>
        ) : (
          filtered.map((item) => {
            const isActive = pathname === `/inbox/${item.id}`;
            const isFresh = !item.seen_at && !item.is_draft;
            const patientName = item.patient_name?.trim() || "Unbekannter Patient";
            const work = trackerInboxWorkType(item);
            const attention = trackerInboxAttentionTier(item);
            const timeLabel = formatTrackerRelativeIngress(item.created_at);
            const urgencyTier = inboxUrgencyVisualTier(item.urgency);
            const href = caseHref(item.id, q);

            return (
              <li key={item.id} className="yd-tracker-mobile-inbox__item">
                <Link
                  href={href}
                  className={cn(
                    "yd-tracker-v4-inbox-card",
                    "yd-tracker-v8-inbox-card",
                    "yd-tracker-v10-inbox-card",
                    "yd-tracker-v12-inbox-card",
                    "yd-tracker-v14-inbox-card",
                    "yd-tracker-v15-inbox-card",
                    "yd-tracker-v16-inbox-card",
                    "yd-tracker-mobile-inbox-card",
                    `yd-tracker-v15-inbox-card--urgency-${urgencyTier}`,
                    `yd-tracker-v16-inbox-card--attention-${attention}`,
                    isFresh && "yd-tracker-v15-inbox-card--fresh",
                    isActive && "yd-tracker-v4-inbox-card--active",
                    isActive && "yd-tracker-v8-inbox-card--active",
                    isActive && "yd-tracker-v10-inbox-card--active",
                    isActive && "yd-tracker-v12-inbox-card--active"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="yd-tracker-v10-inbox-card__body yd-tracker-v12-inbox-card__body yd-tracker-v15-inbox-card__body yd-tracker-v16-inbox-card__body">
                    <span className="yd-tracker-v15-inbox-card__urgency-rail" aria-hidden />
                    <span className="yd-tracker-v16-inbox-card__scan">
                      <span className="yd-tracker-v16-inbox-card__headline-row">
                        <span className="yd-tracker-v16-inbox-card__headline">{work.headline}</span>
                        {isFresh ? (
                          <span className="yd-tracker-v14-inbox-card__fresh-badge" aria-label="Neu">
                            Neu
                          </span>
                        ) : null}
                        <span className="yd-tracker-v16-inbox-card__time">{timeLabel}</span>
                      </span>
                      <span className="yd-tracker-v16-inbox-card__patient">{patientName}</span>
                      {work.context ? (
                        <span className="yd-tracker-v16-inbox-card__context" title={work.context}>
                          {work.context}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

}
