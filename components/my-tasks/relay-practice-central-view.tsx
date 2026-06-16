"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelaySectionNav } from "@/components/my-tasks/relay-section-nav";
import { RelayTrackerShell } from "@/components/my-tasks/relay-tracker-shell";
import {
  RelayWorkActionsPanel,
  RelayWorkContextPanel,
} from "@/components/my-tasks/relay-work-detail-panel";
import { RelayWorkListColumn } from "@/components/my-tasks/relay-work-list-column";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  buildRelayPracticeSnapshot,
  parseRelayPracticeSection,
  relaySectionCount,
  relaySectionRows,
  type RelayPracticeSection,
} from "@/lib/relay/build-relay-practice-snapshot";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

type RelayPracticeCentralViewProps = {
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

type SectionConfig = {
  id: RelayPracticeSection;
  title: string;
  panelTitle: string;
  emptyTitle: string;
  emptyBody: string;
};

const SECTIONS: SectionConfig[] = [
  {
    id: "attention",
    title: "Wartet auf mich",
    panelTitle: "Wartet auf mich",
    emptyTitle: "Keine offenen Entscheidungen.",
    emptyBody: "Freigaben, Patientenantworten und Entscheidungen erscheinen gemischt, sobald Sie gebraucht werden.",
  },
  {
    id: "practice",
    title: "Zu erledigen",
    panelTitle: "Zu erledigen",
    emptyTitle: "Alle Aufgaben erledigt.",
    emptyBody: "Persönliche Praxisarbeit erscheint hier, sobald sie ansteht.",
  },
  {
    id: "teamwork",
    title: "Team wartet",
    panelTitle: "Team wartet",
    emptyTitle: "Kein Team wartet.",
    emptyBody: "Übergaben und Blockaden erscheinen hier, sobald das Team auf die Praxis wartet.",
  },
  {
    id: "patient_waiting",
    title: "Patient wartet",
    panelTitle: "Patient wartet",
    emptyTitle: "Kein Patient wartet.",
    emptyBody: "Patientenfälle und Antworten erscheinen hier, sobald die Praxis handeln muss.",
  },
  {
    id: "routines",
    title: "Routinen",
    panelTitle: "Routinen",
    emptyTitle: "Keine Routinen offen.",
    emptyBody: "Wiederkehrende Praxisarbeit erscheint hier nach Rhythmus.",
  },
];

function findTaskById(columns: RelayPracticeCentralViewProps["columns"], id: string): MyTask | undefined {
  return [...columns.open, ...columns.pending].find((t) => t.id === id);
}

function findJournalByRowId(journalDrafts: JournalEntry[], rowId: string): JournalEntry | undefined {
  const journalId = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  if (!journalId) return undefined;
  return journalDrafts.find((j) => j.id === journalId);
}

function findConversationByRowId(
  conversations: RelayConversationRow[],
  rowId: string
): RelayConversationRow | undefined {
  const msgId = rowId.startsWith("msg-") ? rowId.slice("msg-".length) : null;
  if (!msgId) return undefined;
  return conversations.find((c) => c.id === msgId);
}

export function RelayPracticeCentralView({
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations,
  journalDrafts,
  submissionDraftStatus = {},
}: RelayPracticeCentralViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const activeSection = parseRelayPracticeSection(searchParams.get("bereich"));
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

  const activeConfig = SECTIONS.find((s) => s.id === activeSection)!;
  const activeRows = relaySectionRows(snapshot, activeSection);
  const selectedRow = selectedRowId
    ? activeRows.find((r) => r.id === selectedRowId) ?? null
    : null;

  const selectedTask =
    selectedRow?.kind === "task" ? findTaskById(columns, selectedRow.id) : undefined;
  const selectedJournal =
    selectedRow?.kind === "journal" ? findJournalByRowId(journalDrafts, selectedRow.id) : undefined;
  const selectedConversation =
    selectedRow?.kind === "message" ? findConversationByRowId(conversations, selectedRow.id) : undefined;

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
      params.set("bereich", activeSection);
      params.set("item", activeRows[0]!.id);
    });
  }, [isMobile, activeSection, activeRows, selectedRowId, replaceParams]);

  const openSection = (section: RelayPracticeSection) => {
    const rows = relaySectionRows(snapshot, section);
    replaceParams((params) => {
      params.set("bereich", section);
      params.delete("gruppe");
      params.delete("conversation");
      if (!isMobile && rows[0]) params.set("item", rows[0].id);
      else params.delete("item");
    });
  };

  const selectRow = (rowId: string) => {
    replaceParams((params) => {
      params.set("bereich", activeSection);
      params.set("item", rowId);
    });
  };

  const sectionNavItems = useMemo(
    () =>
      SECTIONS.map((section) => ({
        id: section.id,
        title: section.title,
        count: relaySectionCount(snapshot, section.id),
      })),
    [snapshot]
  );

  const showWorkspace = Boolean(selectedRowId) || (!isMobile && activeRows.length > 0);

  const panelProps = {
    row: selectedRow,
    section: activeSection,
    sectionTitle: activeConfig.panelTitle,
    fallbackRows: activeRows,
    task: selectedTask,
    journal: selectedJournal,
    conversation: selectedConversation,
    isDoctor,
    userId,
    messageDraftStatus,
    onBack: () =>
      replaceParams((params) => {
        params.delete("item");
      }),
    onOpenMessage: (id: string) => {
      replaceParams((params) => {
        params.set("bereich", activeSection);
        params.set("item", `msg-${id}`);
      });
    },
  };

  return (
    <div className="yd-relay yd-relay-central yd-relay-v6 yd-relay-v7 yd-relay-v8 flex min-h-0 flex-1 flex-col" data-relay-ui="v8-dense">
      <RelayCommandTaskPrefill />

      <RelaySectionNav
        className="yd-relay-v6__nav"
        sections={sectionNavItems}
        active={activeSection}
        onSelect={openSection}
      />

      <RelayTrackerShell
        showWorkspace={showWorkspace}
        list={
          <RelayWorkListColumn
            groupByTeam={activeSection === "teamwork"}
            rows={activeRows}
            selectedId={selectedRowId}
            emptyTitle={activeConfig.emptyTitle}
            emptyBody={activeConfig.emptyBody}
            assignableMembers={assignableMembers}
            currentUserId={userId}
            isDoctor={isDoctor}
            onSelect={selectRow}
          />
        }
        context={<RelayWorkContextPanel {...panelProps} />}
        actions={<RelayWorkActionsPanel {...panelProps} />}
      />
    </div>
  );
}
