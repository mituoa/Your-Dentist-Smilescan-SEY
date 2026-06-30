"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { TrackerInboxListRow } from "@/components/inbox/tracker-inbox-list-row";
import { useTrackerInboxRead } from "@/components/inbox/tracker-inbox-read-context";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  countByTrackerFilter,
  matchesTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

type TrackerMobileInboxProps = {
  items: SubmissionListItem[];
};

function caseHref(id: string, q?: string | null): string {
  return q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
}

/** Mobile Tracker-Liste — dieselbe flache Zeile wie Desktop. */
export function TrackerMobileInbox({ items }: TrackerMobileInboxProps) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();
  const qLower = q?.toLowerCase() ?? "";
  const { mergeSeenState, markCaseOpened } = useTrackerInboxRead();

  const enriched = useMemo(
    () =>
      sortTrackerInboxItems(
        items.map((item) => mergeSeenState(item as EnrichedSubmissionListItem))
      ),
    [items, mergeSeenState]
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

  useEffect(() => {
    setFilter("all");
  }, [qLower]);

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-mobile-inbox flex h-full min-h-0 flex-1 flex-col">
      <div className="yd-tracker-mobile-inbox__filters shrink-0">
        <div className="yd-tracker-filter-scroll">
          <div
            className="yd-tracker-filter-chips"
            role="tablist"
            aria-label="Arbeit in der Liste filtern"
          >
            {TRACKER_FILTER_CHIPS.map((chip) => {
              const count = countByTrackerFilter(searchScoped, chip.id);
              const active = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
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
            const href = caseHref(item.id, q);

            return (
              <li key={item.id} className="yd-tracker-mobile-inbox__item">
                <TrackerInboxListRow
                  item={item}
                  href={href}
                  isActive={isActive}
                  onOpen={() => markCaseOpened(item.id)}
                  showStatusLabel
                />
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
