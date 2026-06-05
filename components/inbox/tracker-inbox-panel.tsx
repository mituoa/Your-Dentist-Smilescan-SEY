"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TrackerMobileInbox } from "@/components/inbox/tracker-mobile-inbox";
import { buildTrackerHeaderSummary } from "@/lib/inbox/tracker-header-summary";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
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

type TrackerInboxPanelProps = {
  items: SubmissionListItem[];
};

/** Desktop-Arbeitsliste — Handlungsbedarf vor Patient (klinische Triage). */
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
    <>
      <div className="md:hidden flex h-full min-h-0 flex-col">
        <TrackerMobileInbox items={items} />
      </div>
      <div className="yd-tracker-v4-inbox yd-tracker-v8-inbox yd-tracker-v9-inbox yd-tracker-v10-inbox yd-tracker-v12-inbox yd-tracker-v14-inbox yd-tracker-v15-inbox yd-tracker-v16-triage yd-clinical-control hidden h-full min-h-0 flex-col md:flex">
        <div className="yd-tracker-v4-inbox__toolbar yd-tracker-v8-inbox__toolbar">
          <div className="yd-tracker-v8-inbox__head yd-tracker-v16-inbox__head">
            <h2 className="yd-dash-section yd-tracker-v4-inbox__title yd-tracker-v16-inbox__title">
              {headerSummary.lead}
            </h2>
            <p className="yd-tracker-v16-inbox__breakdown">{headerSummary.breakdown}</p>
          </div>
          <div className="yd-tracker-filter-scroll">
            <div
              className="yd-tracker-filter-chips"
              role="tablist"
              aria-label="Arbeit in der Liste filtern"
            >
              {[...TRACKER_FILTER_CHIPS, ...optionalChips].map((chip) => {
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
          aria-label="Klinische Arbeitsliste"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-8">
              <p className="yd-tracker-empty__text text-center">{emptyCopy}</p>
            </li>
          ) : (
            filtered.map((item) => {
              const isActive = pathname === `/inbox/${item.id}`;
              const patientName = item.patient_name?.trim() || "Unbekannter Patient";
              const work = trackerInboxWorkType(item);
              const attention = trackerInboxAttentionTier(item);
              const timeLabel = formatTrackerRelativeIngress(item.created_at);
              const urgencyTier = inboxUrgencyVisualTier(item.urgency);

              return (
                <li key={item.id}>
                  <div
                    className={cn(
                      "yd-tracker-v4-inbox-card",
                      "yd-tracker-v8-inbox-card",
                      "yd-tracker-v10-inbox-card",
                      "yd-tracker-v12-inbox-card",
                      "yd-tracker-v14-inbox-card",
                      "yd-tracker-v15-inbox-card",
                      "yd-tracker-v16-inbox-card",
                      `yd-tracker-v15-inbox-card--urgency-${urgencyTier}`,
                      `yd-tracker-v16-inbox-card--attention-${attention}`,
                      isActive && "yd-tracker-v4-inbox-card--active",
                      isActive && "yd-tracker-v8-inbox-card--active",
                      isActive && "yd-tracker-v10-inbox-card--active",
                      isActive && "yd-tracker-v12-inbox-card--active"
                    )}
                  >
                    <div
                      role="button"
                      className="yd-tracker-v10-inbox-card__body yd-tracker-v12-inbox-card__body yd-tracker-v15-inbox-card__body yd-tracker-v16-inbox-card__body"
                      onClick={() => goToCase(item.id)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        goToCase(item.id);
                      }}
                      tabIndex={0}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span
                        className="yd-tracker-v15-inbox-card__urgency-rail"
                        aria-hidden
                      />
                      <span className="yd-tracker-v16-inbox-card__scan">
                        <span className="yd-tracker-v16-inbox-card__headline-row">
                          <span className="yd-tracker-v16-inbox-card__headline">
                            {work.headline}
                          </span>
                          <span className="yd-tracker-v16-inbox-card__time">{timeLabel}</span>
                        </span>
                        <span className="yd-tracker-v16-inbox-card__patient">{patientName}</span>
                        {work.context ? (
                          <span className="yd-tracker-v16-inbox-card__context" title={work.context}>
                            {work.context}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
}
