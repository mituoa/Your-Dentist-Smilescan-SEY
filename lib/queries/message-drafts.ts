import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  isLikelyMissingDbRelationError,
} from "@/lib/supabase/postgrest-errors";
import {
  mergeMessageDraftListStatus,
  type MessageDraftListStatus,
} from "@/lib/message-drafts/list-status";

export type MessageDraftStatus = "draft" | "approved" | "sent";
export type MessageDraftCreatedByKind = "ai" | "user";

export type MessageDraftRow = {
  id: string;
  workspace_id: string;
  submission_id: string;
  body: string;
  status: MessageDraftStatus;
  created_by_kind: MessageDraftCreatedByKind;
  created_by_user_id: string | null;
  approved_at: string | null;
  approved_by: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

const MESSAGE_DRAFT_SELECT = `
  id,
  workspace_id,
  submission_id,
  body,
  status,
  created_by_kind,
  created_by_user_id,
  approved_at,
  approved_by,
  sent_at,
  created_at,
  updated_at
`;

function logMessageDraftQueryFailure(scope: string, err: unknown) {
  const row = err as { code?: string; message?: string };
  const code =
    typeof row?.code === "string" && row.code.trim() !== "" ? row.code : "unknown";
  const message = typeof row?.message === "string" ? row.message : "";
  console.error(`[message-drafts] ${scope} code=${code}`, message || undefined);
}

export const getMessageDraftById = cache(
  async (
    draftId: string,
    workspaceId: string
  ): Promise<MessageDraftRow | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("message_drafts")
      .select(MESSAGE_DRAFT_SELECT)
      .eq("id", draftId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (error) {
      logMessageDraftQueryFailure("getMessageDraftById", error);
      return null;
    }

    return data as MessageDraftRow | null;
  }
);

export async function getMessageDraftsForSubmission(
  submissionId: string,
  workspaceId: string,
  options?: { limit?: number; status?: MessageDraftStatus }
): Promise<MessageDraftRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("message_drafts")
    .select(MESSAGE_DRAFT_SELECT)
    .eq("submission_id", submissionId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    logMessageDraftQueryFailure("getMessageDraftsForSubmission", error);
    return [];
  }

  return (data ?? []) as MessageDraftRow[];
}

export async function getLatestMessageDraftForSubmission(
  submissionId: string,
  workspaceId: string,
  status?: MessageDraftStatus
): Promise<MessageDraftRow | null> {
  const rows = await getMessageDraftsForSubmission(submissionId, workspaceId, {
    limit: 1,
    status,
  });
  return rows[0] ?? null;
}

export type MessageDraftDetailLoadResult =
  | { available: false }
  | {
      available: true;
      /** Bearbeitbarer Entwurf (status draft). */
      editableDraft: MessageDraftRow | null;
      /** Letzter freigegebener/versendeter Entwurf — nur Anzeige. */
      historyDraft: MessageDraftRow | null;
    };

/**
 * Fall-Detail: zuerst offener draft, sonst letzter approved/sent als Verlauf.
 * Bei fehlender Tabelle: available false (kein Crash).
 */
export async function loadMessageDraftDetailForSubmission(
  submissionId: string,
  workspaceId: string
): Promise<MessageDraftDetailLoadResult> {
  const supabase = await createClient();

  const draftRes = await supabase
    .from("message_drafts")
    .select(MESSAGE_DRAFT_SELECT)
    .eq("submission_id", submissionId)
    .eq("workspace_id", workspaceId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (draftRes.error) {
    if (isLikelyMissingDbRelationError(draftRes.error)) {
      return { available: false };
    }
    logMessageDraftQueryFailure("loadMessageDraftDetailForSubmission/draft", draftRes.error);
    return { available: true, editableDraft: null, historyDraft: null };
  }

  if (draftRes.data) {
    return {
      available: true,
      editableDraft: draftRes.data as MessageDraftRow,
      historyDraft: null,
    };
  }

  const historyRes = await supabase
    .from("message_drafts")
    .select(MESSAGE_DRAFT_SELECT)
    .eq("submission_id", submissionId)
    .eq("workspace_id", workspaceId)
    .in("status", ["approved", "sent"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historyRes.error) {
    if (isLikelyMissingDbRelationError(historyRes.error)) {
      return { available: false };
    }
    logMessageDraftQueryFailure("loadMessageDraftDetailForSubmission/history", historyRes.error);
    return { available: true, editableDraft: null, historyDraft: null };
  }

  return {
    available: true,
    editableDraft: null,
    historyDraft: (historyRes.data as MessageDraftRow | null) ?? null,
  };
}

const DRAFT_STATUS_SELECT = "submission_id, status";

export type MessageDraftStatusMapResult =
  | { available: true; statusBySubmissionId: Record<string, MessageDraftListStatus> }
  | { available: false };

const SUBMISSION_ID_BATCH = 120;

/**
 * Effizienter Listen-Load: eine Abfrage pro Batch, Aggregation draft > approved > sent.
 */
export async function getMessageDraftStatusMapForSubmissions(
  workspaceId: string,
  submissionIds: string[]
): Promise<MessageDraftStatusMapResult> {
  if (submissionIds.length === 0) {
    return { available: true, statusBySubmissionId: {} };
  }

  const supabase = await createClient();
  const statusBySubmissionId: Record<string, MessageDraftListStatus> = {};

  for (let i = 0; i < submissionIds.length; i += SUBMISSION_ID_BATCH) {
    const batch = submissionIds.slice(i, i + SUBMISSION_ID_BATCH);
    const { data, error } = await supabase
      .from("message_drafts")
      .select(DRAFT_STATUS_SELECT)
      .eq("workspace_id", workspaceId)
      .in("submission_id", batch);

    if (error) {
      if (isLikelyMissingDbRelationError(error)) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[message-drafts] message_drafts table missing — list badges skipped");
        }
        return { available: false };
      }
      logMessageDraftQueryFailure("getMessageDraftStatusMapForSubmissions", error);
      return { available: true, statusBySubmissionId };
    }

    for (const row of data ?? []) {
      const submissionId = row.submission_id as string;
      const status = row.status as MessageDraftListStatus;
      if (status !== "draft" && status !== "approved" && status !== "sent") {
        continue;
      }
      const current = statusBySubmissionId[submissionId] ?? "none";
      statusBySubmissionId[submissionId] = mergeMessageDraftListStatus(current, status);
    }
  }

  return { available: true, statusBySubmissionId };
}

export async function attachMessageDraftStatusToRows<T extends { id: string }>(
  workspaceId: string,
  rows: T[]
): Promise<Array<T & { message_draft_status: MessageDraftListStatus }>> {
  const mapResult = await getMessageDraftStatusMapForSubmissions(
    workspaceId,
    rows.map((r) => r.id)
  );

  if (!mapResult.available) {
    return rows.map((row) => ({ ...row, message_draft_status: "none" as const }));
  }

  return rows.map((row) => ({
    ...row,
    message_draft_status: mapResult.statusBySubmissionId[row.id] ?? "none",
  }));
}
