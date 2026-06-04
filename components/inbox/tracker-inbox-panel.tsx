"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { TrackerInboxPulse } from "@/components/inbox/tracker-inbox-pulse";
import { TrackerInboxSearch } from "@/components/inbox/tracker-inbox-search";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { trackerInboxPriorityLabel } from "@/lib/inbox/build-tracker-workspace";
import { buildTrackerInboxPulse } from "@/lib/inbox/tracker-inbox-metrics";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  countByTrackerFilter,
  formatTrackerListDate,
  matchesTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  trackerInboxWorkType,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

type TrackerInboxPanelProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

export function TrackerInboxPanel({ items, showCreateCase = false }: TrackerInboxPanelProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();

  const enriched = useMemo(
    () => sortTrackerInboxItems(items as EnrichedSubmissionListItem[]),
    [items]
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

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const pulse = useMemo(() => buildTrackerInboxPulse(searchScoped), [searchScoped]);

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-v4-inbox yd-clinical-control flex h-full min-h-0 flex-col">
      <div className="yd-tracker-v4-inbox__toolbar">
        <div className="yd-tracker-v4-inbox__toolbar-head">
          <div className="min-w-0">
            <p className="yd-tracker-v4-inbox__eyebrow">Arbeitswarteschlange</p>
            <h2 className="yd-dash-section yd-tracker-v4-inbox__title">Praxis-Inbox</h2>
          </div>
          {showCreateCase ? (
            <Link href="/create-case?from=inbox" className="yd-tracker-v4-new-case">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Neuer Fall
            </Link>
          ) : null}
        </div>
        <TrackerInboxPulse
          metrics={pulse}
          activeFilter={filter}
          onSelect={setFilter}
        />
        <TrackerInboxSearch className="yd-tracker-search--inbox" />
        <div className="yd-tracker-filter-scroll">
          <div className="yd-tracker-filter-chips" role="tablist" aria-label="Praxis-Inbox filtern">
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
        className="yd-tracker-v4-inbox__list min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        aria-label="Arbeit in der Praxis-Inbox"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-8">
            <p className="yd-tracker-empty__text text-center">{emptyCopy}</p>
          </li>
        ) : (
          filtered.map((item) => {
            const isActive = pathname === `/inbox/${item.id}`;
            const work = trackerInboxWorkType(item);
            const patientName = item.patient_name?.trim() || "Unbekannter Patient";
            const concern =
              work.kind === "neue_anfrage"
                ? deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
                    maxLen: 56,
                    emptyLabel: "",
                  })
                : "";
            const contextLine = work.context || concern || null;
            const priority = trackerInboxPriorityLabel(item);
            const photoLabel =
              item.photo_count === 0
                ? "Keine Bilder"
                : item.photo_count === 1
                  ? "1 Bild"
                  : `${item.photo_count} Bilder`;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "yd-tracker-v4-inbox-card",
                    isActive && "yd-tracker-v4-inbox-card--active",
                    !item.seen_at && !isActive && "yd-tracker-v4-inbox-card--unseen"
                  )}
                  onClick={() => goToCase(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="yd-tracker-v4-inbox-card__main">
                    <span
                      className={cn(
                        "yd-tracker-v4-inbox-card__headline",
                        `yd-tracker-v4-inbox-card__headline--${work.kind}`
                      )}
                    >
                      {work.headline}
                    </span>
                    <span className="yd-tracker-v4-inbox-card__name">{patientName}</span>
                    {contextLine ? (
                      <span className="yd-tracker-v4-inbox-card__context">{contextLine}</span>
                    ) : null}
                  </div>
                  <div className="yd-tracker-v4-inbox-card__meta">
                    <span>{photoLabel}</span>
                    <span aria-hidden>·</span>
                    <span>{formatTrackerListDate(item.created_at)}</span>
                    {priority ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="yd-tracker-v4-inbox-card__priority">{priority}</span>
                      </>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
