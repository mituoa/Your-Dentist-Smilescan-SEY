"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TrackerInboxStatusPill } from "@/components/inbox/tracker-inbox-status-pill";
import { deriveSubmissionConcernDisplay } from "@/lib/inbox/derive-submission-issue-short-line";
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
import {
  formatTrackerRelativeIngress,
  resolveInboxPracticeStatus,
} from "@/lib/inbox/tracker-v9-clinical";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

type TrackerInboxPanelProps = {
  items: SubmissionListItem[];
};

/** V9 — Arbeitsliste: Name · Anliegen · Zeit · Status-Pill. */
export function TrackerInboxPanel({ items }: TrackerInboxPanelProps) {
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

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-v4-inbox yd-tracker-v8-inbox yd-tracker-v9-inbox yd-tracker-v10-inbox yd-tracker-v12-inbox yd-tracker-v14-inbox yd-clinical-control flex h-full min-h-0 flex-col">
      <div className="yd-tracker-v4-inbox__toolbar yd-tracker-v8-inbox__toolbar">
        <div className="yd-tracker-v8-inbox__head">
          <p className="yd-tracker-v4-inbox__eyebrow">Arbeitsliste</p>
          <h2 className="yd-dash-section yd-tracker-v4-inbox__title">Praxis-Inbox</h2>
        </div>
        <div className="yd-tracker-filter-scroll">
          <div className="yd-tracker-filter-chips" role="tablist" aria-label="Arbeit in der Inbox filtern">
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
        className="yd-tracker-v4-inbox__list yd-tracker-v8-inbox__list yd-tracker-v9-inbox__list yd-tracker-v10-inbox__list yd-tracker-v12-inbox__list min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        aria-label="Arbeit in der Praxis-Inbox"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-8">
            <p className="yd-tracker-empty__text text-center">{emptyCopy}</p>
          </li>
        ) : (
          filtered.map((item) => {
            const isActive = pathname === `/inbox/${item.id}`;
            const patientName = item.patient_name?.trim() || "Unbekannter Patient";
            const concern = deriveSubmissionConcernDisplay(
              item.patient_notes,
              item.patient_name,
              "Anliegen ohne Kurztext"
            );
            const concernTitle = item.patient_notes?.trim() || concern;
            const practiceStatus = resolveInboxPracticeStatus(item);
            const timeLabel = formatTrackerRelativeIngress(item.created_at);

            return (
              <li key={item.id}>
                <div
                  className={cn(
                    "yd-tracker-v4-inbox-card",
                    "yd-tracker-v8-inbox-card",
                    "yd-tracker-v9-inbox-card",
                    "yd-tracker-v10-inbox-card",
                    "yd-tracker-v12-inbox-card",
                    "yd-tracker-v14-inbox-card",
                    isActive && "yd-tracker-v4-inbox-card--active",
                    isActive && "yd-tracker-v8-inbox-card--active",
                    isActive && "yd-tracker-v10-inbox-card--active",
                    isActive && "yd-tracker-v12-inbox-card--active",
                    !item.seen_at && !isActive && "yd-tracker-v4-inbox-card--unseen"
                  )}
                >
                  <button
                    type="button"
                    className="yd-tracker-v10-inbox-card__body yd-tracker-v12-inbox-card__body"
                    onClick={() => goToCase(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="yd-tracker-v10-inbox-card__text yd-tracker-v12-inbox-card__text">
                      <span
                        className="yd-tracker-v10-inbox-card__name yd-tracker-v12-inbox-card__name"
                        title={patientName}
                      >
                        {patientName}
                      </span>
                      <span
                        className="yd-tracker-v10-inbox-card__concern yd-tracker-v12-inbox-card__concern yd-tracker-v14-inbox-card__concern"
                        title={concernTitle}
                      >
                        {concern}
                      </span>
                      <span className="yd-tracker-v10-inbox-card__time yd-tracker-v12-inbox-card__time">
                        {timeLabel}
                      </span>
                    </div>
                  </button>
                  <TrackerInboxStatusPill
                    submissionId={item.id}
                    status={practiceStatus}
                  />
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
