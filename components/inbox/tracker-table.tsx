"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

import { TrackerAssistBadge } from "@/components/inbox/tracker-assist-badge";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  buildTrackerAssistHints,
  countByTrackerFilter,
  intakeChannelLabel,
  matchesTrackerFilter,
  matchesTrackerSearch,
  photoTrailSummary,
  sortTrackerInboxItems,
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type TrackerTableProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

function TrackerRowContent({
  item,
  concern,
  isActive,
}: {
  item: EnrichedSubmissionListItem;
  concern: string;
  isActive: boolean;
}) {
  const status = trackerStatusForRow(item);
  const assistHints = buildTrackerAssistHints(item);
  const photoLine = photoTrailSummary(item);
  const intakeLabel = intakeChannelLabel(item.intake_channel);

  return (
    <>
      <div className="yd-tracker-row__main">
        <span className="yd-tracker-table__avatar" aria-hidden>
          {initials(item.patient_name)}
        </span>
        <div className="min-w-0 flex-1">
          <span className="yd-tracker-table__patient-name">
            {item.patient_name?.trim() || "Unbekannter Patient"}
          </span>
          <span className="yd-tracker-table__concern-inline">{concern}</span>
          {photoLine ? (
            <span className="yd-tracker-table__photo-line">{photoLine}</span>
          ) : null}
        </div>
      </div>
      <div className="yd-tracker-row__meta">
        <span className="yd-tracker-table__intake-pill">{intakeLabel}</span>
        <div className="yd-tracker-row__assist">
          {assistHints.map((hint) => (
            <TrackerAssistBadge key={hint.id} hint={hint} />
          ))}
        </div>
        <span className={cn("yd-tracker-table__status", status.className)}>{status.label}</span>
        <span
          className={cn(
            "yd-tracker-row__action",
            isActive && "yd-tracker-row__action--active"
          )}
        >
          Fall öffnen
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        </span>
      </div>
    </>
  );
}

export function TrackerTable({ items, showCreateCase = false }: TrackerTableProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();

  const enriched = useMemo(
    () => sortTrackerInboxItems(items as EnrichedSubmissionListItem[]),
    [items]
  );

  const [filter, setFilter] = useState<TrackerInboxFilter>("all");
  const [page, setPage] = useState(1);

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
    setPage(1);
  }, [qLower, filter]);

  useEffect(() => {
    if (filter === "all") return;
    if (countByTrackerFilter(searchScoped, filter) === 0) {
      setFilter("all");
    }
  }, [searchScoped, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const emptyCopy =
    filter === "all" && q
      ? "Keine Treffer für diese Suche."
      : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-tracker-table-card flex h-full min-h-0 flex-col">
      <div className="yd-tracker-table-toolbar">
        <div className="min-w-0">
          <h2 className="yd-tracker-table-toolbar__title">Praxis-Inbox</h2>
        </div>
        {showCreateCase ? (
          <Link href="/create-case?from=inbox" className="yd-tracker-new-case-btn">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Neuer Fall
          </Link>
        ) : null}
      </div>

      <div className="yd-tracker-filter-scroll">
        <div className="yd-tracker-filter-chips" role="tablist" aria-label="Inbox filtern">
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
                onClick={() => {
                  setFilter(chip.id);
                  setPage(1);
                }}
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

      <div className="yd-tracker-list-body min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {pageItems.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] leading-relaxed text-[#64748B]">
            {emptyCopy}
          </p>
        ) : (
          <>
            <div className="yd-tracker-mobile-list md:hidden">
              {pageItems.map((item) => {
                const isActive = pathname === `/inbox/${item.id}`;
                const concern = deriveSubmissionIssueShortLine(
                  item.patient_notes,
                  item.patient_name,
                  { maxLen: 72, emptyLabel: "Ohne Angabe" }
                );
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "yd-tracker-mobile-card",
                      isActive && "yd-tracker-mobile-card--active"
                    )}
                    onClick={() => goToCase(item.id)}
                  >
                    <TrackerRowContent item={item} concern={concern} isActive={isActive} />
                  </button>
                );
              })}
            </div>

            <table className="yd-tracker-table max-md:hidden">
              <thead>
                <tr>
                  <th scope="col">Patient / Anliegen</th>
                  <th scope="col">Eingang</th>
                  <th scope="col">Assistenz</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const isActive = pathname === `/inbox/${item.id}`;
                  const concern = deriveSubmissionIssueShortLine(
                    item.patient_notes,
                    item.patient_name,
                    { maxLen: 64, emptyLabel: "Ohne Angabe" }
                  );
                  const status = trackerStatusForRow(item);
                  const assistHints = buildTrackerAssistHints(item);
                  const photoLine = photoTrailSummary(item);

                  return (
                    <tr
                      key={item.id}
                      className={cn(isActive && "yd-tracker-table__row--active")}
                      onClick={() => goToCase(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToCase(item.id);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <td>
                        <div className="yd-tracker-table__patient">
                          <span className="yd-tracker-table__avatar" aria-hidden>
                            {initials(item.patient_name)}
                          </span>
                          <div className="min-w-0">
                            <span className="yd-tracker-table__patient-name">
                              {item.patient_name?.trim() || "Unbekannter Patient"}
                            </span>
                            <span className="yd-tracker-table__concern">{concern}</span>
                            {photoLine ? (
                              <span className="yd-tracker-table__photo-line">{photoLine}</span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="yd-tracker-table__intake-pill">
                          {intakeChannelLabel(item.intake_channel)}
                        </span>
                      </td>
                      <td>
                        <div className="yd-tracker-row__assist yd-tracker-row__assist--table">
                          {assistHints.map((hint) => (
                            <TrackerAssistBadge key={hint.id} hint={hint} />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={cn("yd-tracker-table__status", status.className)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="yd-tracker-row__action">
                          Fall öffnen
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="yd-tracker-table-footer">
        <p className="yd-tracker-table-footer__meta">
          {filtered.length === 0
            ? "Keine Einträge"
            : `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} von ${filtered.length}`}
        </p>
        {filtered.length > PAGE_SIZE ? (
          <div className="yd-tracker-table-pagination">
            <button
              type="button"
              className="yd-tracker-table-pagination__btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Zurück
            </button>
            <button
              type="button"
              className="yd-tracker-table-pagination__btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Weiter
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
