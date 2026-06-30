"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { TrackerInboxListRow } from "@/components/inbox/tracker-inbox-list-row";
import { TrackerMobileInbox } from "@/components/inbox/tracker-mobile-inbox";
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

type TrackerInboxPanelProps = {
  items: SubmissionListItem[];
};

function caseHref(id: string, q?: string | null): string {
  return q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
}

/** Desktop-Arbeitsliste — flache V8-Zeilen, Status in der Liste. */
export function TrackerInboxPanel({ items }: TrackerInboxPanelProps) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();
  const { mergeSeenState, markCaseOpened } = useTrackerInboxRead();

  const enriched = useMemo(
    () =>
      sortTrackerInboxItems(
        items.map((item) => mergeSeenState(item as EnrichedSubmissionListItem))
      ),
    [items, mergeSeenState]
  );

  const [filter, setFilter] = useState<TrackerInboxFilter>("all");
  const qLower = q?.toLowerCase() ?? "";

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
    <>
      <div className="md:hidden flex h-full min-h-0 flex-1 flex-col">
        <TrackerMobileInbox items={items} />
      </div>
      <div className="yd-tracker-v4-inbox yd-tracker-v8-inbox yd-clinical-control hidden h-full min-h-0 flex-col md:flex">
        <div className="yd-tracker-v4-inbox__toolbar yd-tracker-v8-inbox__toolbar">
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
          className="yd-tracker-v4-inbox__list yd-tracker-v8-inbox__list min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
          aria-label="Klinische Arbeitsliste"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-8">
              <p className="yd-tracker-empty__text text-center">{emptyCopy}</p>
            </li>
          ) : (
            filtered.map((item) => {
              const isActive = pathname === `/inbox/${item.id}`;

              return (
                <li key={item.id}>
                  <TrackerInboxListRow
                    item={item}
                    href={caseHref(item.id, q)}
                    isActive={isActive}
                    onOpen={() => markCaseOpened(item.id)}
                  />
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
}
