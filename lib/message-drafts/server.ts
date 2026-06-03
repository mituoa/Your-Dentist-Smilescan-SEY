import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { isLikelyMissingDbRelationError } from "@/lib/supabase/postgrest-errors";
import type {
  MessageDraftCreatedByKind,
  MessageDraftRow,
  MessageDraftStatus,
} from "@/lib/queries/message-drafts";

export const MESSAGE_DRAFT_BODY_MAX_LENGTH = 20_000;

export type MessageDraftMutationResult =
  | { ok: true; draft: MessageDraftRow }
  | { ok: false; error: string };

function logMessageDraftMutationFailure(scope: string, err: unknown) {
  const row = err as { code?: string; message?: string };
  const code =
    typeof row?.code === "string" && row.code.trim() !== "" ? row.code : "unknown";
  const message = typeof row?.message === "string" ? row.message : "";
  console.error(`[message-drafts] ${scope} code=${code}`, message || undefined);
}

function normalizeBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) return null;
  if (trimmed.length > MESSAGE_DRAFT_BODY_MAX_LENGTH) return null;
  return trimmed;
}

async function assertSubmissionInWorkspace(
  submissionId: string,
  workspaceId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id")
    .eq("id", submissionId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    logMessageDraftMutationFailure("assertSubmissionInWorkspace", error);
    return false;
  }

  return Boolean(data?.id);
}

async function loadDraftInWorkspace(
  draftId: string,
  workspaceId: string
): Promise<MessageDraftRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message_drafts")
    .select(
      "id, workspace_id, submission_id, body, status, created_by_kind, created_by_user_id, approved_at, approved_by, sent_at, created_at, updated_at"
    )
    .eq("id", draftId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    logMessageDraftMutationFailure("loadDraftInWorkspace", error);
    return null;
  }

  return data as MessageDraftRow | null;
}

/**
 * Neuen Antwortentwurf anlegen. Kein Versand.
 * `created_by_kind: "ai"` setzt `created_by_user_id` auf null (Assistenzschicht).
 */
export async function createMessageDraft(input: {
  submissionId: string;
  body: string;
  createdByKind: MessageDraftCreatedByKind;
}): Promise<MessageDraftMutationResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const body = normalizeBody(input.body);
  if (!body) {
    return { ok: false, error: "Der Entwurfstext fehlt oder ist zu lang." };
  }

  const workspaceId = workspace.workspace_id;
  const inWorkspace = await assertSubmissionInWorkspace(input.submissionId, workspaceId);
  if (!inWorkspace) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message_drafts")
    .insert({
      workspace_id: workspaceId,
      submission_id: input.submissionId,
      body,
      status: "draft" satisfies MessageDraftStatus,
      created_by_kind: input.createdByKind,
      created_by_user_id: input.createdByKind === "user" ? user.id : null,
    })
    .select(
      "id, workspace_id, submission_id, body, status, created_by_kind, created_by_user_id, approved_at, approved_by, sent_at, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    logMessageDraftMutationFailure("createMessageDraft", error);
    if (isLikelyMissingDbRelationError(error)) {
      return { ok: false, error: "Antwortentwürfe sind aktuell nicht verfügbar." };
    }
    return { ok: false, error: "Der Entwurf konnte nicht gespeichert werden." };
  }

  return { ok: true, draft: data as MessageDraftRow };
}

/** Entwurf bearbeiten — nur im Status `draft`. */
export async function updateMessageDraft(input: {
  draftId: string;
  body: string;
}): Promise<MessageDraftMutationResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const body = normalizeBody(input.body);
  if (!body) {
    return { ok: false, error: "Der Entwurfstext fehlt oder ist zu lang." };
  }

  const workspaceId = workspace.workspace_id;
  const existing = await loadDraftInWorkspace(input.draftId, workspaceId);
  if (!existing) {
    return { ok: false, error: "Entwurf nicht gefunden." };
  }
  if (existing.status !== "draft") {
    return {
      ok: false,
      error: "Nur Entwürfe im Bearbeitungsstatus können geändert werden.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message_drafts")
    .update({ body })
    .eq("id", input.draftId)
    .eq("workspace_id", workspaceId)
    .eq("status", "draft")
    .select(
      "id, workspace_id, submission_id, body, status, created_by_kind, created_by_user_id, approved_at, approved_by, sent_at, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    logMessageDraftMutationFailure("updateMessageDraft", error);
    return { ok: false, error: "Der Entwurf konnte nicht aktualisiert werden." };
  }

  return { ok: true, draft: data as MessageDraftRow };
}

/** Freigabe durch die Praxis (Arztrolle). */
export async function approveMessageDraft(input: {
  draftId: string;
}): Promise<MessageDraftMutationResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }
  if (workspace.role !== "doctor") {
    return { ok: false, error: "Die Freigabe ist nur für die ärztliche Rolle vorgesehen." };
  }

  const workspaceId = workspace.workspace_id;
  const existing = await loadDraftInWorkspace(input.draftId, workspaceId);
  if (!existing) {
    return { ok: false, error: "Entwurf nicht gefunden." };
  }
  if (existing.status !== "draft") {
    return { ok: false, error: "Dieser Entwurf wurde bereits freigegeben oder versendet." };
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message_drafts")
    .update({
      status: "approved",
      approved_at: now,
      approved_by: user.id,
    })
    .eq("id", input.draftId)
    .eq("workspace_id", workspaceId)
    .eq("status", "draft")
    .select(
      "id, workspace_id, submission_id, body, status, created_by_kind, created_by_user_id, approved_at, approved_by, sent_at, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    logMessageDraftMutationFailure("approveMessageDraft", error);
    return { ok: false, error: "Die Freigabe konnte nicht gespeichert werden." };
  }

  return { ok: true, draft: data as MessageDraftRow };
}

/**
 * Als versendet markieren — ohne E-Mail-Versand (nur Status für spätere Flows).
 * Erfordert vorherige Freigabe (`approved`).
 */
export async function markMessageDraftSent(input: {
  draftId: string;
}): Promise<MessageDraftMutationResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }
  if (workspace.role !== "doctor") {
    return {
      ok: false,
      error: "Das Markieren als versendet ist nur für die ärztliche Rolle vorgesehen.",
    };
  }

  const workspaceId = workspace.workspace_id;
  const existing = await loadDraftInWorkspace(input.draftId, workspaceId);
  if (!existing) {
    return { ok: false, error: "Entwurf nicht gefunden." };
  }
  if (existing.status !== "approved") {
    return {
      ok: false,
      error: "Nur freigegebene Entwürfe können als versendet markiert werden.",
    };
  }

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("message_drafts")
    .update({
      status: "sent",
      sent_at: now,
    })
    .eq("id", input.draftId)
    .eq("workspace_id", workspaceId)
    .eq("status", "approved")
    .select(
      "id, workspace_id, submission_id, body, status, created_by_kind, created_by_user_id, approved_at, approved_by, sent_at, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    logMessageDraftMutationFailure("markMessageDraftSent", error);
    return {
      ok: false,
      error: "Der Versandstatus konnte nicht gespeichert werden.",
    };
  }

  return { ok: true, draft: data as MessageDraftRow };
}
