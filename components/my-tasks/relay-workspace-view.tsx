"use client";

import { RelayDecisionsView } from "@/components/my-tasks/relay-decisions-view";
import { RelayPracticeCentralView } from "@/components/my-tasks/relay-practice-central-view";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { JournalEntry } from "@/lib/types/journal-entry";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";

/** Mirrors `TaskCounts` from task-counts (client-safe). */
export interface RelayTaskCounts {
  open: number;
  pending: number;
  done: number;
}

type BoardColumns = {
  open: MyTask[];
  pending: MyTask[];
  done: MyTask[];
};

interface RelayWorkspaceViewProps {
  basePath: "/my-tasks" | "/relay";
  userId: string;
  userEmail: string | null;
  isDoctor: boolean;
  columns: BoardColumns;
  counts: RelayTaskCounts;
  assignableMembers: AssignableMember[];
  conversations?: RelayConversationRow[];
  journalDrafts?: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
}

/** Relay — operative Praxiszentrale. */
export function RelayWorkspaceView({
  basePath,
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations = [],
  journalDrafts = [],
  submissionDraftStatus = {},
}: RelayWorkspaceViewProps) {
  if (basePath === "/relay") {
    return (
      <RelayPracticeCentralView
        userId={userId}
        isDoctor={isDoctor}
        columns={columns}
        assignableMembers={assignableMembers}
        conversations={conversations}
        journalDrafts={journalDrafts}
        submissionDraftStatus={submissionDraftStatus}
      />
    );
  }

  return (
    <RelayDecisionsView
      basePath={basePath}
      userId={userId}
      isDoctor={isDoctor}
      columns={columns}
      assignableMembers={assignableMembers}
      conversations={conversations}
      journalDrafts={journalDrafts}
      submissionDraftStatus={submissionDraftStatus}
    />
  );
}
