"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { TrackerInboxSearch } from "@/components/inbox/tracker-inbox-search";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  TRACKER_FILTER_EXTENDED,
  countByTrackerFilter,
  formatPatientAgeYears,
  formatTrackerCaseRef,
  matchesTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function patientSubline(item: EnrichedSubmissionListItem): string {
  const email = item.patient_email?.trim();
  if (email) return email;
  return deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
    maxLen: 48,
    emptyLabel: "Ohne Angabe",
  });
}

type TrackerTableProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

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
    <div className="yd-tracker-table-card yd-clinical-control flex h-full min-h-0 flex-col">
      <div className="yd-tracker-table-toolbar">
        <div className="yd-tracker-table-toolbar__head">
          <h2 className="yd-tracker-table-toolbar__title">Patienten</h2>
          {showCreateCase ? (
            <Link href="/create-case?from=inbox" className="yd-tracker-new-case-btn">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Neuer Fall
            </Link>
          ) : null}
        </div>
        <TrackerInboxSearch />
        <div className="yd-tracker-table-toolbar__filters">
          <div className="yd-tracker-primary-filters" role="tablist" aria-label="Schnellfilter">
            {TRACKER_FILTER_CHIPS.map((chip) => {
              const count = countByTrackerFilter(searchScoped, chip.id);
              const active = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "yd-tracker-primary-filter",
                    active && "yd-tracker-primary-filter--active"
                  )}
                  onClick={() => {
                    setFilter(chip.id);
                    setPage(1);
                  }}
                >
                  {chip.label}
                  <span className="yd-tracker-primary-filter__count">{count}</span>
                </button>
              );
            })}
          </div>
          <label className="yd-tracker-filter-more-wrap">
            <span className="sr-only">Weitere Filter</span>
            <select
              className="yd-tracker-filter-more"
              value={TRACKER_FILTER_EXTENDED.some((x) => x.id === filter) ? filter : ""}
              onChange={(e) => {
                const v = e.target.value as TrackerInboxFilter;
                if (v) {
                  setFilter(v);
                  setPage(1);
                }
              }}
              aria-label="Weitere Filter"
            >
              <option value="">Mehr …</option>
              {TRACKER_FILTER_EXTENDED.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({countByTrackerFilter(searchScoped, opt.id)})
                </option>
              ))}
            </select>
          </label>
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
                const status = trackerStatusForRow(item);
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
                    <div className="yd-tracker-mobile-card__row">
                      <span className="yd-tracker-table__avatar" aria-hidden>
                        {initials(item.patient_name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="yd-tracker-table__patient-name">
                          {item.patient_name?.trim() || "Unbekannter Patient"}
                        </span>
                        <span className="yd-tracker-table__patient-email">
                          {patientSubline(item)}
                        </span>
                      </div>
                      <span className={cn("yd-tracker-table__status", status.className)}>
                        <span className="yd-tracker-table__status-dot" aria-hidden />
                        {status.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <table className="yd-tracker-table max-md:hidden">
              <thead>
                <tr>
                  <th scope="col">Fall-Nr.</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Alter</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const isActive = pathname === `/inbox/${item.id}`;
                  const status = trackerStatusForRow(item);
                  const age = formatPatientAgeYears(item.patient_birth_date);

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
                        <span className="yd-tracker-table__case-id">
                          {formatTrackerCaseRef(item.id, item.patient_external_id)}
                        </span>
                      </td>
                      <td>
                        <div className="yd-tracker-table__patient">
                          <span className="yd-tracker-table__avatar" aria-hidden>
                            {initials(item.patient_name)}
                          </span>
                          <div className="yd-tracker-table__patient-text">
                            <span className="yd-tracker-table__patient-name">
                              {item.patient_name?.trim() || "Unbekannter Patient"}
                            </span>
                            <span className="yd-tracker-table__patient-email">
                              {patientSubline(item)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="yd-tracker-table__age">{age ?? "—"}</span>
                      </td>
                      <td>
                        <span className={cn("yd-tracker-table__status", status.className)}>
                          <span className="yd-tracker-table__status-dot" aria-hidden />
                          {status.label}
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
            ? ""
            : `Einträge ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} von ${filtered.length}`}
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
            <span className="yd-tracker-table-pagination__page" aria-current="page">
              {safePage} / {totalPages}
            </span>
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
