"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { TrackerQueueShell } from "@/components/inbox/tracker-queue-shell";
import { matchesTrackerSearch, type EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";
import { buildDecisionKpis } from "@/lib/inbox/tracker-praxis-status";
import {
  buildDecisionCard,
  sortClinicalWorkQueue,
} from "@/lib/inbox/tracker-v12-presentational";
import type { SubmissionListItem } from "@/lib/queries/inbox";

const PAGE_SIZE = 12;

type TrackerPatientOverviewProps = {
  items: SubmissionListItem[];
  showCreateCase?: boolean;
};

/** Tracker — Operations Center (Entscheidungen). */
export function TrackerPatientOverview({
  items,
  showCreateCase = false,
}: TrackerPatientOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const [page, setPage] = useState(1);

  const enriched = useMemo(() => items as EnrichedSubmissionListItem[], [items]);

  const filteredItems = useMemo(() => {
    return enriched.filter((item) => matchesTrackerSearch(item, q));
  }, [enriched, q]);

  const decisions = useMemo(() => {
    return sortClinicalWorkQueue(filteredItems).map((item) =>
      buildDecisionCard(item)
    );
  }, [filteredItems]);

  const kpis = useMemo(() => buildDecisionKpis(filteredItems), [filteredItems]);
  const decisionCount = filteredItems.length;

  useEffect(() => {
    setPage(1);
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(decisions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageDecisions = decisions.slice(start, start + PAGE_SIZE);

  const openCase = (id: string) => {
    const href = q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`;
    router.push(href);
  };

  return (
    <TrackerQueueShell
      decisions={pageDecisions}
      kpis={kpis}
      decisionCount={decisionCount}
      showCreateCase={showCreateCase}
      emptyMessage={
        q
          ? "Keine Entscheidungen für diese Suche."
          : "Aktuell keine offenen Entscheidungen."
      }
      pageStart={decisions.length === 0 ? 0 : start + 1}
      pageEnd={Math.min(start + PAGE_SIZE, decisions.length)}
      totalCount={decisions.length}
      safePage={safePage}
      totalPages={totalPages}
      onOpen={openCase}
      onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
      onPageNext={() => setPage((p) => Math.min(totalPages, p + 1))}
    />
  );
}
