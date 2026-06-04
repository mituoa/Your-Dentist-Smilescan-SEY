"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { TrackerInboxSearch } from "@/components/inbox/tracker-inbox-search";
import {
  TRACKER_FILTER_EMPTY,
  formatTrackerListDate,
  sortTrackerInboxItems,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";
import {
  buildTrackerInboxQueueLine,
  buildTrackerInboxTabCounts,
  matchesTriageInboxTab,
  resolveYdCaseProductStatus,
} from "@/lib/inbox/tracker-product-status";
import type { SubmissionListItem } from "@/lib/queries/inbox";
import { cn } from "@/lib/utils";

const TRIAGE_INBOX_TABS: { id: TrackerInboxFilter; label: string }[] = [
  { id: "new_submissions", label: "Neue Anfragen" },
  { id: "follow_up", label: "Nachsorgen" },
  { id: "approval_pending", label: "Freigaben" },
];

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

  const [filter, setFilter] = useState<TrackerInboxFilter>("new_submissions");
  const qLower = q?.toLowerCase() ?? "";

  const searchScoped = useMemo(
    () =>
      enriched.filter((item) => {
        const haystack = [
          item.patient_name,
          item.patient_email,
          item.patient_notes,
          item.patient_external_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return !qLower || haystack.includes(qLower);
      }),
    [enriched, qLower]
  );

  const tabCounts = useMemo(
    () => buildTrackerInboxTabCounts(searchScoped),
    [searchScoped]
  );

  const queueLine = useMemo(() => buildTrackerInboxQueueLine(tabCounts), [tabCounts]);

  const filtered = useMemo(
    () => searchScoped.filter((item) => matchesTriageInboxTab(item, filter)),
    [searchScoped, filter]
  );

  useEffect(() => {
    setFilter("new_submissions");
  }, [qLower]);

  const goToCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  const emptyCopy = q ? "Keine Treffer für diese Suche." : TRACKER_FILTER_EMPTY[filter];

  return (
    <div className="yd-triage-inbox flex h-full min-h-0 flex-col">
      <div className="yd-triage-inbox__toolbar">
        <div className="yd-triage-inbox__toolbar-head">
          <h2 className="yd-triage-inbox__title">Praxis-Inbox</h2>
          {showCreateCase ? (
            <Link href="/create-case?from=inbox" className="yd-triage-inbox__new">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Fall
            </Link>
          ) : null}
        </div>
        <p className="yd-triage-inbox__queue">{queueLine}</p>
        <TrackerInboxSearch className="yd-tracker-search--inbox" />
        <div className="yd-triage-inbox__tabs" role="tablist" aria-label="Inbox-Bereiche">
          {TRIAGE_INBOX_TABS.map((tab) => {
            const active = filter === tab.id;
            const count = tabCounts[tab.id as keyof typeof tabCounts];
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn("yd-triage-inbox__tab", active && "yd-triage-inbox__tab--active")}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
                {count > 0 ? (
                  <span className="yd-triage-inbox__tab-count" aria-hidden>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <ul
        className="yd-triage-inbox__list min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        aria-label="Patientenliste"
      >
        {filtered.length === 0 ? (
          <li className="px-4 py-10">
            <p className="yd-triage-inbox__empty">{emptyCopy}</p>
          </li>
        ) : (
          filtered.map((item) => {
            const isActive = pathname === `/inbox/${item.id}`;
            const product = resolveYdCaseProductStatus(item);
            const name = item.patient_name?.trim() || "Unbekannter Patient";

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "yd-triage-inbox-row",
                    isActive && "yd-triage-inbox-row--active",
                    product.needsAttention && !isActive && "yd-triage-inbox-row--attention"
                  )}
                  onClick={() => goToCase(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="yd-triage-inbox-row__main">
                    <span className="yd-triage-inbox-row__name">{name}</span>
                    {product.needsAttention ? (
                      <span className="yd-triage-inbox-row__dot" aria-label="Benötigt Aufmerksamkeit" />
                    ) : null}
                  </span>
                  <span className="yd-triage-inbox-row__hint">{product.shortLabel}</span>
                  <span className="yd-triage-inbox-row__date">
                    {formatTrackerListDate(item.created_at)}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
