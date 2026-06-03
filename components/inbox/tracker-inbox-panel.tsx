"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { TrackerInboxSearch } from "@/components/inbox/tracker-inbox-search";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { trackerInboxPriorityLabel } from "@/lib/inbox/build-tracker-workspace";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  countByTrackerFilter,
  formatTrackerListDate,
  matchesTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

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

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-v4-inbox yd-clinical-control flex h-full min-h-0 flex-col">
      <div className="yd-tracker-v4-inbox__toolbar">
        <div className="yd-tracker-v4-inbox__toolbar-head">
          <div className="min-w-0">
            <h2 className="yd-dash-section text-[1rem] md:text-[1.0625rem]">Praxis-Inbox</h2>
            <p className="mt-0.5 text-[12px] font-medium text-[#64748B]">
              Was jetzt bearbeitet werden soll
            </p>
          </div>
          {showCreateCase ? (
            <Link href="/create-case?from=inbox" className="yd-tracker-v4-new-case">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Neuer Fall
            </Link>
          ) : null}
        </div>
        <TrackerInboxSearch />
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
        aria-label="Patienten in der Praxis-Inbox"
      >
        {filtered.length === 0 ? (
          <li className="px-4 py-12 text-center text-[14px] leading-relaxed text-[#64748B]">
            {emptyCopy}
          </li>
        ) : (
          filtered.map((item) => {
            const isActive = pathname === `/inbox/${item.id}`;
            const status = trackerStatusForRow(item);
            const concern = deriveSubmissionIssueShortLine(
              item.patient_notes,
              item.patient_name,
              { maxLen: 64, emptyLabel: "Anliegen offen" }
            );
            const priority = trackerInboxPriorityLabel(item);
            const photoLabel =
              item.photo_count === 0
                ? "Keine Fotos"
                : item.photo_count === 1
                  ? "1 Foto"
                  : `${item.photo_count} Fotos`;

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
                  <div className="yd-tracker-v4-inbox-card__row">
                    <span className="yd-tracker-v4-inbox-card__avatar" aria-hidden>
                      {initials(item.patient_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="yd-tracker-v4-inbox-card__name">
                        {item.patient_name?.trim() || "Unbekannter Patient"}
                      </span>
                      <span className="yd-tracker-v4-inbox-card__concern">{concern}</span>
                    </div>
                    <span
                      className={cn(
                        "yd-tracker-v4-status",
                        "yd-tracker-table__status",
                        status.className
                      )}
                    >
                      <span className="yd-tracker-v4-status__dot" aria-hidden />
                      {status.label}
                    </span>
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
