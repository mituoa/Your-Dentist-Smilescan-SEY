"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { TrackerInboxSearch } from "@/components/inbox/tracker-inbox-search";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  TRACKER_FILTER_EMPTY,
  countByTrackerFilter,
  matchesTrackerSearch,
  sortTrackerInboxItems,
  trackerPriorityForRow,
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import {
  formatTrackerCardIntakeTime,
  sumOpenTasks,
  trackerCardSignalLines,
  trackerPhotoIntakeLabel,
} from "@/lib/inbox/tracker-presentational";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

type TrackerInboxListProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

const KPI_DEFS = [
  { id: "new_submissions" as const, label: "Neue Eingänge" },
  { id: "approval_pending" as const, label: "Freigaben" },
  { id: "follow_up" as const, label: "Nachsorgen" },
  { id: "open_tasks" as const, label: "Offene Aufgaben" },
];

export function TrackerInboxList({ items, showCreateCase = false }: TrackerInboxListProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const enriched = useMemo(
    () => sortTrackerInboxItems(items as EnrichedSubmissionListItem[]),
    [items]
  );

  const filtered = useMemo(
    () => enriched.filter((item) => matchesTrackerSearch(item, q)),
    [enriched, q]
  );

  const kpis = useMemo(
    () =>
      KPI_DEFS.map((def) => ({
        ...def,
        value:
          def.id === "open_tasks"
            ? sumOpenTasks(enriched)
            : countByTrackerFilter(enriched, def.id),
      })),
    [enriched]
  );

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const emptyCopy = q ? "Keine Treffer." : TRACKER_FILTER_EMPTY.all;

  return (
    <aside className="yd-tracker-inbox" aria-label="Heute zu prüfen">
      <header className="yd-tracker-inbox__head">
        <div className="yd-tracker-inbox__head-row">
          <h2 className="yd-tracker-inbox__title">Heute zu prüfen</h2>
          {showCreateCase ? (
            <Link href="/create-case?from=inbox" className="yd-tracker-inbox__new-case">
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Fall
            </Link>
          ) : null}
        </div>
        <div className="yd-tracker-inbox__kpis" role="list" aria-label="Überblick">
          {kpis.map((kpi) => (
            <span key={kpi.id} className="yd-tracker-inbox__kpi" role="listitem">
              <span className="yd-tracker-inbox__kpi-value">{kpi.value}</span>
              <span className="yd-tracker-inbox__kpi-label">{kpi.label}</span>
            </span>
          ))}
        </div>
        <TrackerInboxSearch className="yd-tracker-search--inbox" />
      </header>

      <div className="yd-tracker-inbox__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {filtered.length === 0 ? (
          <p className="yd-tracker-inbox__empty">{emptyCopy}</p>
        ) : (
          <ul className="yd-tracker-inbox__cards">
            {filtered.map((item) => {
              const isActive = pathname === `/inbox/${item.id}`;
              const status = trackerStatusForRow(item);
              const priority = trackerPriorityForRow(item);
              const name = item.patient_name?.trim() || "Unbekannter Patient";
              const concern = deriveSubmissionIssueShortLine(
                item.patient_notes,
                item.patient_name,
                { maxLen: 72, emptyLabel: "Anliegen offen" }
              );
              const signals = trackerCardSignalLines(item);
              const photos = item.photo_count ?? 0;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "yd-tracker-case-card",
                      isActive && "yd-tracker-case-card--active",
                      !item.seen_at && !isActive && "yd-tracker-case-card--fresh"
                    )}
                    onClick={() => goToCase(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="yd-tracker-case-card__top">
                      <span className="yd-tracker-case-card__name">{name}</span>
                      <span
                        className={cn(
                          "yd-tracker-case-card__status",
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="yd-tracker-case-card__concern">{concern}</p>
                    <p className="yd-tracker-case-card__photos">
                      {trackerPhotoIntakeLabel(photos)}
                    </p>
                    <p className="yd-tracker-case-card__time">
                      {formatTrackerCardIntakeTime(item.created_at)}
                    </p>
                    {signals.length > 0 ? (
                      <ul className="yd-tracker-case-card__signals">
                        {signals.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    <span className={cn("yd-tracker-case-card__priority", priority.className)}>
                      {priority.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
