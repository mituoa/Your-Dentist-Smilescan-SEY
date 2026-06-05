"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buildTrackerHeaderSummary } from "@/lib/inbox/tracker-header-summary";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  TRACKER_FILTER_HINTS,
  TRACKER_OPTIONAL_FILTER_CHIPS,
  countByTrackerFilter,
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

/** Mobile-only — Triage: Handlungsbedarf vor Patient. */
export function TrackerMobileInbox({ items }: TrackerMobileInboxProps) {
  const router = useRouter();
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

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-mobile-inbox flex h-full min-h-0 flex-col">
      <header className="yd-tracker-mobile-inbox__head">
        <h1 className="yd-tracker-mobile-inbox__title">{headerSummary.lead}</h1>
        <p className="yd-tracker-mobile-inbox__lead">{headerSummary.breakdown}</p>
      </header>

      <div className="yd-tracker-mobile-inbox__filters" role="tablist" aria-label="Filter">
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
              className={cn(
                "yd-tracker-mobile-inbox__filter",
                active && "yd-tracker-mobile-inbox__filter--active"
              )}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
              {count > 0 ? (
                <span className="yd-tracker-mobile-inbox__filter-count">{count}</span>
              ) : null}
            </button>
          );
        })}
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
            const isFresh = !item.seen_at;
            const patientName = item.patient_name?.trim() || "Unbekannter Patient";
            const work = trackerInboxWorkType(item);
            const attention = trackerInboxAttentionTier(item);
            const timeLabel = formatTrackerRelativeIngress(item.created_at);

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "yd-tracker-mobile-inbox__row",
                    `yd-tracker-mobile-inbox__row--${attention}`,
                    isActive && "yd-tracker-mobile-inbox__row--active",
                    isFresh && "yd-tracker-mobile-inbox__row--fresh"
                  )}
                  onClick={() => goToCase(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="yd-tracker-mobile-inbox__row-top">
                    <span className="yd-tracker-mobile-inbox__headline">{work.headline}</span>
                    <span className="yd-tracker-mobile-inbox__date">{timeLabel}</span>
                  </span>
                  <span className="yd-tracker-mobile-inbox__name">{patientName}</span>
                  {work.context ? (
                    <span className="yd-tracker-mobile-inbox__subject">{work.context}</span>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
