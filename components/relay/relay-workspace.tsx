"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayWorkContextPanel } from "@/components/relay/relay-work-context-panel";
import { RelayWorkInventoryList } from "@/components/relay/relay-work-inventory-list";
import { RelayWorkspaceNav } from "@/components/relay/relay-workspace-nav";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { buildRelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import {
  parseRelayWorkArea,
  relayWorkAreaConfig,
  relayWorkAreaRows,
  type RelayWorkAreaId,
} from "@/lib/relay/relay-work-areas";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  isDoctor: boolean;
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

function findTask(columns: Props["columns"], id: string) {
  return [...columns.open, ...columns.pending].find((t) => t.id === id);
}

function findJournal(journals: JournalEntry[], rowId: string) {
  const id = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  return id ? journals.find((j) => j.id === id) : undefined;
}

function findConversation(conversations: RelayConversationRow[], rowId: string) {
  const id = rowId.startsWith("msg-") ? rowId.slice("msg-".length) : null;
  return id ? conversations.find((c) => c.id === id) : undefined;
}

/** Relay — Kontext · Inventar · Fokus (Referenz-Arbeitslogik). */
export function RelayWorkspace({
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations,
  journalDrafts,
  submissionDraftStatus = {},
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const activeArea = parseRelayWorkArea(searchParams.get("bereich"));
  const selectedRowId = searchParams.get("item");

  const snapshot = useMemo(
    () =>
      buildRelayPracticeSnapshot({
        open: columns.open,
        pending: columns.pending,
        members: assignableMembers,
        draftBySubmissionId: submissionDraftStatus,
        conversations,
        journalDrafts,
        isDoctor,
        userId,
        basePath: "/relay",
      }),
    [
      columns.open,
      columns.pending,
      assignableMembers,
      submissionDraftStatus,
      conversations,
      journalDrafts,
      isDoctor,
      userId,
    ]
  );

  const areaRows = relayWorkAreaRows(snapshot, activeArea);

  const effectiveRowId = useMemo(() => {
    if (selectedRowId && areaRows.some((r) => r.id === selectedRowId)) return selectedRowId;
    if (!isMobile && areaRows[0]) return areaRows[0].id;
    return null;
  }, [selectedRowId, areaRows, isMobile]);

  const selectedRow = effectiveRowId ? areaRows.find((r) => r.id === effectiveRowId) ?? null : null;
  const selectedTask = selectedRow?.kind === "task" ? findTask(columns, selectedRow.id) : undefined;
  const selectedJournal = selectedRow ? findJournal(journalDrafts, selectedRow.id) : undefined;
  const selectedConversation = selectedRow ? findConversation(conversations, selectedRow.id) : undefined;
  const messageDraftStatus =
    selectedTask?.submission_id
      ? submissionDraftStatus[selectedTask.submission_id] ?? "none"
      : "none";

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.replace(`/relay?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (isMobile) return;
    if (areaRows.length === 0) return;
    if (selectedRowId && areaRows.some((r) => r.id === selectedRowId)) return;
    replaceParams((p) => {
      p.set("bereich", activeArea);
      p.set("item", areaRows[0]!.id);
    });
  }, [isMobile, activeArea, areaRows, selectedRowId, replaceParams]);

  const openArea = (areaId: RelayWorkAreaId) => {
    const rows = relayWorkAreaRows(snapshot, areaId);
    replaceParams((p) => {
      p.set("bereich", areaId);
      if (!isMobile && rows[0]) p.set("item", rows[0].id);
      else p.delete("item");
    });
  };

  const selectRow = (rowId: string) => {
    replaceParams((p) => {
      p.set("bereich", activeArea);
      p.set("item", rowId);
    });
  };

  const showCtx = Boolean(effectiveRowId);
  const showInv = !isMobile || !showCtx;
  const showNav = !isMobile || !showCtx;

  return (
    <div className="relay-ws">
      <RelayCommandTaskPrefill />
      <div className={cn("relay-ws__grid", showCtx && isMobile && "relay-ws__grid--detail")}>
        <aside className={cn("relay-ws__nav", !showNav && "max-md:hidden")}>
          <RelayWorkspaceNav snapshot={snapshot} active={activeArea} onSelect={openArea} />
        </aside>
        <section className={cn("relay-ws__inv", !showInv && "max-md:hidden")}>
          <RelayWorkInventoryList
            areaTitle={relayWorkAreaConfig(activeArea).title}
            rows={areaRows}
            selectedId={effectiveRowId}
            onSelect={selectRow}
          />
        </section>
        <section className={cn("relay-ws__ctx", !showCtx && "max-md:hidden")}>
          <RelayWorkContextPanel
            row={selectedRow}
            areaId={activeArea}
            task={selectedTask}
            journal={selectedJournal}
            conversation={selectedConversation}
            isDoctor={isDoctor}
            userId={userId}
            messageDraftStatus={messageDraftStatus}
            onOpenMessage={(id) => {
              replaceParams((p) => {
                p.set("bereich", activeArea);
                p.set("item", `msg-${id}`);
              });
            }}
          />
        </section>
      </div>
    </div>
  );
}
