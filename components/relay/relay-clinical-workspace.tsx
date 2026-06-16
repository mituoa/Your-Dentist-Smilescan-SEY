"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayActiveWorkPanel } from "@/components/relay/relay-active-work-panel";
import { RelayReferenceBoard } from "@/components/relay/relay-reference-board";
import { RelayReferenceSidebar } from "@/components/relay/relay-reference-sidebar";
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
  columns: {
    open: MyTask[];
    pending: MyTask[];
    done: MyTask[];
  };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

function findTask(columns: Props["columns"], id: string): MyTask | undefined {
  return [...columns.open, ...columns.pending].find((t) => t.id === id);
}

function findJournal(journalDrafts: JournalEntry[], rowId: string): JournalEntry | undefined {
  const journalId = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  if (!journalId) return undefined;
  return journalDrafts.find((j) => j.id === journalId);
}

function findConversation(
  conversations: RelayConversationRow[],
  rowId: string
): RelayConversationRow | undefined {
  const msgId = rowId.startsWith("msg-") ? rowId.slice("msg-".length) : null;
  if (!msgId) return undefined;
  return conversations.find((c) => c.id === msgId);
}

export function RelayClinicalWorkspace({
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

  const areaConfig = relayWorkAreaConfig(activeArea);
  const activeRows = relayWorkAreaRows(snapshot, activeArea);

  const effectiveRowId = useMemo(() => {
    if (selectedRowId && activeRows.some((r) => r.id === selectedRowId)) return selectedRowId;
    if (!isMobile && activeRows[0]) return activeRows[0].id;
    return null;
  }, [selectedRowId, activeRows, isMobile]);

  const selectedRow = effectiveRowId
    ? activeRows.find((r) => r.id === effectiveRowId) ?? null
    : null;

  const selectedTask =
    selectedRow?.kind === "task" ? findTask(columns, selectedRow.id) : undefined;
  const selectedJournal =
    selectedRow?.kind === "journal" ? findJournal(journalDrafts, selectedRow.id) : undefined;
  const selectedConversation =
    selectedRow?.kind === "message"
      ? findConversation(conversations, selectedRow.id)
      : undefined;

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
    if (activeRows.length === 0) return;
    if (selectedRowId && activeRows.some((r) => r.id === selectedRowId)) return;
    replaceParams((params) => {
      params.set("bereich", activeArea);
      params.set("item", activeRows[0]!.id);
    });
  }, [isMobile, activeArea, activeRows, selectedRowId, replaceParams]);

  const openArea = (areaId: RelayWorkAreaId) => {
    const rows = relayWorkAreaRows(snapshot, areaId);
    replaceParams((params) => {
      params.set("bereich", areaId);
      params.delete("gruppe");
      params.delete("conversation");
      if (!isMobile && rows[0]) params.set("item", rows[0].id);
      else params.delete("item");
    });
  };

  const selectRow = (rowId: string) => {
    replaceParams((params) => {
      params.set("bereich", activeArea);
      params.set("item", rowId);
    });
  };

  const showPanel = Boolean(effectiveRowId);
  const showBoard = !isMobile || !showPanel;
  const showSidebar = !isMobile || !showPanel;

  return (
    <div className="yd-relay-cw flex min-h-0 flex-1 flex-col">
      <RelayCommandTaskPrefill />

      <div
        className={cn(
          "yd-relay-cw__shell min-h-0 flex-1",
          showPanel && isMobile && "yd-relay-cw__shell--detail"
        )}
      >
        <div className={cn(!showSidebar && "max-md:hidden")}>
          <RelayReferenceSidebar
            snapshot={snapshot}
            active={activeArea}
            onSelect={openArea}
          />
        </div>

        <div className={cn("yd-relay-cw__board-wrap", !showBoard && "max-md:hidden")}>
          <RelayReferenceBoard
            areaTitle={areaConfig.title}
            rows={activeRows}
            selectedId={effectiveRowId}
            assignableMembers={assignableMembers}
            currentUserId={userId}
            isDoctor={isDoctor}
            onSelect={selectRow}
          />
        </div>

        <div className={cn("yd-relay-cw__panel-wrap", !showPanel && "max-md:hidden")}>
          <RelayActiveWorkPanel
            row={selectedRow}
            areaId={activeArea}
            task={selectedTask}
            journal={selectedJournal}
            conversation={selectedConversation}
            isDoctor={isDoctor}
            userId={userId}
            messageDraftStatus={messageDraftStatus}
            onBack={() =>
              replaceParams((params) => {
                params.delete("item");
              })
            }
            onOpenMessage={(id) => {
              replaceParams((params) => {
                params.set("bereich", activeArea);
                params.set("item", `msg-${id}`);
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
