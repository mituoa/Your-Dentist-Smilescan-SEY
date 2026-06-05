"use client";

import { RelayDecisionsView } from "@/components/my-tasks/relay-decisions-view";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
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
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
}

/** Relay — Entscheidungszentrum (ersetzt CRM-/Tabellen-Workspace). */
export function RelayWorkspaceView({
  basePath,
  isDoctor,
  columns,
  assignableMembers,
  submissionDraftStatus = {},
}: RelayWorkspaceViewProps) {
  return (
    <RelayDecisionsView
      basePath={basePath}
      isDoctor={isDoctor}
      columns={columns}
      assignableMembers={assignableMembers}
      submissionDraftStatus={submissionDraftStatus}
    />
  );
}
