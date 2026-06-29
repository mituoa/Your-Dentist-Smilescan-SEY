"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { TrackerInboxSearch } from "@/components/inbox/tracker-inbox-search";
import { TrackerInboxListStatusMenu } from "@/components/inbox/tracker-inbox-list-status-menu";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { displayPracticeStatusForCase } from "@/lib/inbox/tracker-enterprise-status";
import {
  TRACKER_FILTER_CHIPS,
  TRACKER_FILTER_EMPTY,
  countByTrackerFilter,
  formatPatientAgeYears,
  formatTrackerCaseRef,
  matchesTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  trackerInboxReadState,
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

function formatBirthDe(value: string | null): string {
  if (!value) return "—";
  const part = value.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return "—";
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type TrackerPatientDirectoryProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

export function TrackerPatientDirectory({
  items,
  showCreateCase = false,
}: TrackerPatientDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim();
  const isFull = pathname === "/inbox";

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    setFilter("all");
    setPage(1);
  }, [qLower]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const emptyCopy =
    filter === "all" && q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  const rangeStart = filtered.length === 0 ? 0 : (Math.min(page, totalPages) - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(Math.min(page, totalPages) * PAGE_SIZE, filtered.length);

  return (
    <div
      className={cn(
        "yd-tracker-directory yd-clinical-control flex h-full min-h-0 flex-col",
        isFull && "yd-tracker-directory--full"
      )}
    >
      <header className="yd-tracker-directory__toolbar">
        <div className="yd-tracker-directory__toolbar-head">
          <div className="min-w-0">
            <h2 className="yd-tracker-directory__title">
              {isFull ? "Patienten" : "Übersicht"}
            </h2>
          </div>
          {showCreateCase && isFull ? (
            <Link href="/create-case?from=inbox" className="yd-tracker-directory__new-case">
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Neuer Fall
            </Link>
          ) : null}
        </div>

        {isFull ? (
          <div className="yd-tracker-directory__search-row">
            <TrackerInboxSearch className="yd-tracker-search--directory" />
          </div>
        ) : null}

        <div className="yd-tracker-filter-scroll">
          <div className="yd-tracker-filter-chips" role="tablist" aria-label="Patienten filtern">
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
      </header>

      <div className="yd-tracker-directory__body min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {filtered.length === 0 ? (
          <div className="yd-tracker-directory__empty">
            <p>{emptyCopy}</p>
          </div>
        ) : isFull ? (
          <div className="yd-tracker-directory__card-shell">
            <div className="yd-tracker-directory__card">
              <div className="yd-tracker-directory__table-wrap">
                <table className="yd-tracker-directory__table">
                  <thead>
                    <tr>
                      <th scope="col">Patient</th>
                      <th scope="col">Alter</th>
                      <th scope="col">Geburtsdatum</th>
                      <th scope="col">Patienten-ID</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item) => {
                      const isActive = pathname === `/inbox/${item.id}`;
                      const age = formatPatientAgeYears(item.patient_birth_date);
                      const patientId = formatTrackerCaseRef(item.id, item.patient_external_id);
                      const name = item.patient_name?.trim() || "Unbekannter Patient";
                      const preview = deriveSubmissionIssueShortLine(
                        item.patient_notes,
                        item.patient_name,
                        { maxLen: 72, emptyLabel: "" }
                      );
                      const practiceStatus = displayPracticeStatusForCase(item.practice_status);
                      const readState = trackerInboxReadState(item);

                      return (
                        <tr
                          key={item.id}
                          className={cn(
                            "yd-tracker-directory__row",
                            isActive && "yd-tracker-directory__row--active",
                            readState === "new_submission" &&
                              !isActive &&
                              "yd-tracker-directory__row--new",
                            readState === "marked_unread" &&
                              !isActive &&
                              "yd-tracker-directory__row--marked-unread"
                          )}
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
                            <div className="yd-tracker-directory__patient">
                              <span className="yd-tracker-directory__avatar" aria-hidden>
                                {initials(item.patient_name)}
                              </span>
                              <span className="yd-tracker-directory__patient-text">
                                <span className="yd-tracker-directory__name-row">
                                  {readState !== "read" ? (
                                    <span
                                      className={cn(
                                        "yd-tracker-v16-unread-pip",
                                        readState === "new_submission" &&
                                          "yd-tracker-v16-unread-pip--new"
                                      )}
                                      aria-hidden
                                    />
                                  ) : null}
                                  <span
                                    className={cn(
                                      "yd-tracker-directory__name",
                                      readState !== "read" && "yd-tracker-directory__name--unread"
                                    )}
                                  >
                                    {name}
                                  </span>
                                </span>
                                {preview ? (
                                  <span className="yd-tracker-directory__preview">{preview}</span>
                                ) : null}
                              </span>
                            </div>
                          </td>
                          <td className="yd-tracker-directory__cell-muted" data-label="Alter">
                            {age ?? "—"}
                          </td>
                          <td className="yd-tracker-directory__cell-muted" data-label="Geburtsdatum">
                            {formatBirthDe(item.patient_birth_date)}
                          </td>
                          <td data-label="Patienten-ID">
                            <span className="yd-tracker-directory__patient-id">{patientId}</span>
                          </td>
                          <td data-label="Status" onClick={(e) => e.stopPropagation()}>
                            <TrackerInboxListStatusMenu
                              submissionId={item.id}
                              status={practiceStatus}
                              seenAt={item.seen_at}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="yd-tracker-directory__footer">
                <p className="yd-tracker-directory__range">
                  {filtered.length === 0
                    ? "Keine Einträge"
                    : `Einträge ${rangeStart}–${rangeEnd} von ${filtered.length}`}
                </p>
                {totalPages > 1 ? (
                  <nav className="yd-tracker-directory__pagination" aria-label="Seiten">
                    <button
                      type="button"
                      className="yd-tracker-directory__page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Zurück
                    </button>
                    <ol className="yd-tracker-directory__page-list">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <li key={n}>
                          <button
                            type="button"
                            className={cn(
                              "yd-tracker-directory__page-num",
                              n === page && "yd-tracker-directory__page-num--active"
                            )}
                            aria-current={n === page ? "page" : undefined}
                            onClick={() => setPage(n)}
                          >
                            {n}
                          </button>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      className="yd-tracker-directory__page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Weiter
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </nav>
                ) : null}
              </footer>
            </div>
          </div>
        ) : (
          <ul className="yd-tracker-directory__sidebar-list" aria-label="Patienten">
            {filtered.map((item) => {
              const isActive = pathname === `/inbox/${item.id}`;
              const age = formatPatientAgeYears(item.patient_birth_date);
              const patientId = formatTrackerCaseRef(item.id, item.patient_external_id);
              const name = item.patient_name?.trim() || "Unbekannter Patient";
              const preview = deriveSubmissionIssueShortLine(
                item.patient_notes,
                item.patient_name,
                { maxLen: 72, emptyLabel: "" }
              );
              const practiceStatus = displayPracticeStatusForCase(item.practice_status);

              const readState = trackerInboxReadState(item);

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "yd-tracker-directory__sidebar-card",
                      isActive && "yd-tracker-directory__sidebar-card--active",
                      readState === "new_submission" &&
                        !isActive &&
                        "yd-tracker-directory__sidebar-card--new",
                      readState === "marked_unread" &&
                        !isActive &&
                        "yd-tracker-directory__sidebar-card--marked-unread"
                    )}
                    onClick={() => goToCase(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="yd-tracker-directory__avatar" aria-hidden>
                        {initials(item.patient_name)}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="yd-tracker-directory__name-row flex items-center gap-2">
                          {readState !== "read" ? (
                            <span
                              className={cn(
                                "yd-tracker-v16-unread-pip",
                                readState === "new_submission" && "yd-tracker-v16-unread-pip--new"
                              )}
                              aria-hidden
                            />
                          ) : null}
                          <span
                            className={cn(
                              "yd-tracker-directory__name block truncate",
                              readState !== "read" && "yd-tracker-directory__name--unread"
                            )}
                          >
                            {name}
                          </span>
                        </span>
                        {preview ? (
                          <span className="yd-tracker-directory__preview block truncate">
                            {preview}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <dl className="yd-tracker-directory__sidebar-meta">
                      <div>
                        <dt>Alter</dt>
                        <dd>{age ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Geb.</dt>
                        <dd>{formatBirthDe(item.patient_birth_date)}</dd>
                      </div>
                      <div>
                        <dt>ID</dt>
                        <dd>{patientId}</dd>
                      </div>
                    </dl>
                    <div
                      className="mt-2 flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <TrackerInboxListStatusMenu
                        submissionId={item.id}
                        status={practiceStatus}
                        seenAt={item.seen_at}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
