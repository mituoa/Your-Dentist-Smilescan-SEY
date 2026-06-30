import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isLikelyMissingDbColumnError } from "@/lib/supabase/postgrest-errors";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { attachInboxListEnrichment } from "@/lib/inbox/attach-inbox-list-enrichment";
import type { PhotoDocumentationHint } from "@/lib/inbox/tracker-inbox-logic";
import { attachMessageDraftStatusToRows } from "@/lib/queries/message-drafts";
import {
  normalizeIntakeChannel,
  type IntakeChannel,
} from "@/lib/submissions/intake-channel";

/**
 * Posteingangsliste (`submissions`) für den **App-Workspace** (`getCurrentWorkspace`).
 * PostgREST filtert zusätzlich per RLS (`workspace_id = current_workspace_id()`); die explizite
 * `.eq("workspace_id", …)`-Filterung entspricht der Shell und verhindert Divergenz-Hinweise in Logs.
 *
 * **Security (Punkt 10):** RLS + App-`workspace_id`; Such-`q` wird für `.or(...ilike...)` bereinigt
 * (Länge, Zeichen die PostgREST/Wildcards verzerren). Logs nur mit `code`, keine Roh-`q` in DB-Logs.
 * DB-`current_workspace_id()` muss mit Migration **030** zur App-Regel passen.
 *
 * **MVP (Punkt 11):** Keine Pagination — alle passenden Zeilen einer Abfrage; bei sehr großen
 * Datenmengen späteres Produkt-Thema, nicht Pilot-Blocker.
 */

export interface SubmissionListItem {
  id: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_notes: string | null;
  patient_birth_date: string | null;
  patient_external_id: string | null;
  urgency: string | null;
  is_draft: boolean;
  created_at: string;
  seen_at: string | null;
  photo_count: number;
  /** Persistenter Antwortentwurf — `none` wenn Tabelle fehlt oder kein Entwurf. */
  message_draft_status: MessageDraftListStatus;
  /** Eingangskanal — `unknown` wenn Spalte in DB noch fehlt. */
  intake_channel: IntakeChannel;
  /** Offene Relay-Aufgaben zu diesem Fall. */
  open_task_count: number;
  /** Foto-Dokumentation innerhalb des Falls / per Patienten-ID. */
  photo_documentation: PhotoDocumentationHint | null;
  practice_status: string | null;
  photo_request_requested_at: string | null;
  follow_up_series_id: string | null;
}

export type InboxSubmissionsResult =
  | { ok: true; items: SubmissionListItem[] }
  | { ok: false };

/** Count of submissions not yet marked seen (same rule as dashboard unseen). */
export type UnseenCountResult = { ok: true; count: number } | { ok: false };

const INBOX_SELECT_WITH_CASE_FIELDS = [
  "id",
  "patient_name",
  "patient_email",
  "patient_notes",
  "patient_birth_date",
  "patient_external_id",
  "urgency",
  "is_draft",
  "intake_channel",
  "created_at",
  "seen_at",
  "practice_status",
  "photo_request_requested_at",
  "follow_up_series_id",
  "submission_photos(count)",
].join(", ");

/** Works on DBs that only ran migration 002 (no 023 case columns). */
const INBOX_SELECT_BASE = [
  "id",
  "patient_name",
  "patient_email",
  "patient_notes",
  "created_at",
  "seen_at",
  "submission_photos(count)",
].join(", ");

/** Ohne Migration 038 (practice_status / Foto-Nachforderung / Serie). */
const INBOX_SELECT_WITHOUT_BACKBONE = [
  "id",
  "patient_name",
  "patient_email",
  "patient_notes",
  "patient_birth_date",
  "patient_external_id",
  "urgency",
  "is_draft",
  "intake_channel",
  "created_at",
  "seen_at",
  "submission_photos(count)",
].join(", ");

function mapInboxRow(
  s: Record<string, unknown>,
  defaultsForMissingCaseFields: boolean,
  defaultsForMissingIntakeChannel: boolean
): SubmissionListItem {
  return {
    id: s.id as string,
    patient_name: s.patient_name as string | null,
    patient_email: s.patient_email as string | null,
    patient_notes: (s.patient_notes as string | null) ?? null,
    patient_birth_date: defaultsForMissingCaseFields
      ? null
      : ((s.patient_birth_date as string | null) ?? null),
    patient_external_id: defaultsForMissingCaseFields
      ? null
      : ((s.patient_external_id as string | null) ?? null),
    urgency: defaultsForMissingCaseFields
      ? null
      : ((s.urgency as string | null) ?? null),
    is_draft: defaultsForMissingCaseFields ? false : Boolean(s.is_draft),
    created_at: s.created_at as string,
    seen_at: s.seen_at as string | null,
    photo_count:
      (s.submission_photos as { count: number }[] | undefined)?.[0]?.count || 0,
    message_draft_status: "none",
    intake_channel: defaultsForMissingIntakeChannel
      ? "unknown"
      : normalizeIntakeChannel(s.intake_channel),
    open_task_count: 0,
    photo_documentation: null,
    practice_status: (s.practice_status as string | null) ?? "new",
    photo_request_requested_at:
      (s.photo_request_requested_at as string | null) ?? null,
    follow_up_series_id: (s.follow_up_series_id as string | null) ?? null,
  };
}

async function enrichInboxListItems(
  workspaceId: string,
  items: SubmissionListItem[]
): Promise<SubmissionListItem[]> {
  return attachInboxListEnrichment(workspaceId, items);
}

type FetchRowsResult =
  | { ok: true; items: SubmissionListItem[] }
  | { ok: false; err: { code?: string; message?: string } };

const MAX_INBOX_SEARCH_LEN = 200;

/**
 * PostgREST-`.or(...)` mit `ilike.%…%`: Zeichen entfernen, die Filter-Syntax oder Wildcards stören
 * (`%`, `_`, Komma, Klammern, Backslash). Kein Ersatz für RLS — nur stabile Oberfläche innerhalb
 * des Workspaces.
 */
function inboxSearchTokenForFilter(trimmed: string): string {
  return trimmed
    .replace(/\\/g, "")
    .replace(/%/g, "")
    .replace(/_/g, "")
    .replace(/,/g, "")
    .replace(/[()]/g, "")
    .slice(0, MAX_INBOX_SEARCH_LEN);
}

function logInboxQueryFailure(label: string, err: unknown): void {
  const code =
    err && typeof err === "object" && "code" in err && typeof (err as { code: unknown }).code === "string"
      ? (err as { code: string }).code
      : "unknown";
  console.error(`[inbox] ${label} code=${code}`);
}

async function fetchInboxRowsOnce(
  workspaceId: string,
  searchQuery: string | undefined,
  select: string,
  defaultsForMissingCaseFields: boolean,
  defaultsForMissingIntakeChannel: boolean
): Promise<FetchRowsResult> {
  const supabase = await createClient();

  let query = supabase
    .from("submissions")
    .select(select)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim()) {
    const token = inboxSearchTokenForFilter(searchQuery.trim());
    if (token) {
      query = query.or(`patient_name.ilike.%${token}%,patient_email.ilike.%${token}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, err: error };
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const items = rows.map((row) =>
    mapInboxRow(row, defaultsForMissingCaseFields, defaultsForMissingIntakeChannel)
  );

  return { ok: true, items };
}

async function getInboxSubmissionsInner(
  workspaceId: string,
  searchQuery?: string
): Promise<InboxSubmissionsResult> {
  const first = await fetchInboxRowsOnce(
    workspaceId,
    searchQuery,
    INBOX_SELECT_WITH_CASE_FIELDS,
    false,
    false
  );

  if (first.ok) {
    const withDrafts = await attachMessageDraftStatusToRows(workspaceId, first.items);
    const enriched = await enrichInboxListItems(workspaceId, withDrafts);
    return { ok: true, items: enriched };
  }

  if (isLikelyMissingDbColumnError(first.err)) {
    const errMsg = (first.err?.message ?? "").toLowerCase();
    const intakeOnlyMissing =
      errMsg.includes("intake_channel") &&
      !errMsg.includes("patient_birth_date") &&
      !errMsg.includes("patient_external_id") &&
      !errMsg.includes("is_draft") &&
      !errMsg.includes("urgency");

    if (intakeOnlyMissing) {
      console.warn(
        "[inbox] intake_channel missing — retrying list without migration-036 field."
      );
      const withoutIntake = INBOX_SELECT_WITH_CASE_FIELDS.split(", ")
        .filter((f) => f !== "intake_channel")
        .join(", ");
      const intakeRetry = await fetchInboxRowsOnce(
        workspaceId,
        searchQuery,
        withoutIntake,
        false,
        true
      );
      if (intakeRetry.ok) {
        const withDrafts = await attachMessageDraftStatusToRows(
          workspaceId,
          intakeRetry.items
        );
        const enriched = await enrichInboxListItems(workspaceId, withDrafts);
        return { ok: true, items: enriched };
      }
    }

    const backboneOnlyMissing =
      (errMsg.includes("practice_status") ||
        errMsg.includes("photo_request_requested_at") ||
        errMsg.includes("follow_up_series_id")) &&
      !errMsg.includes("patient_birth_date") &&
      !errMsg.includes("patient_external_id") &&
      !errMsg.includes("is_draft") &&
      !errMsg.includes("urgency") &&
      !errMsg.includes("intake_channel");

    if (backboneOnlyMissing) {
      console.warn(
        "[inbox] tracker backbone columns missing — retrying list without migration-038 fields."
      );
      const backboneRetry = await fetchInboxRowsOnce(
        workspaceId,
        searchQuery,
        INBOX_SELECT_WITHOUT_BACKBONE,
        false,
        errMsg.includes("intake_channel")
      );
      if (backboneRetry.ok) {
        const withDrafts = await attachMessageDraftStatusToRows(
          workspaceId,
          backboneRetry.items
        );
        const enriched = await enrichInboxListItems(workspaceId, withDrafts);
        return { ok: true, items: enriched };
      }
    }

    console.warn(
      "[inbox] submissions case columns missing in DB — retrying list without migration-023 fields. Apply migration 023 for full fields."
    );
    const second = await fetchInboxRowsOnce(
      workspaceId,
      searchQuery,
      INBOX_SELECT_BASE,
      true,
      true
    );
    if (second.ok) {
      const withDrafts = await attachMessageDraftStatusToRows(workspaceId, second.items);
      const enriched = await enrichInboxListItems(workspaceId, withDrafts);
      return { ok: true, items: enriched };
    }
    logInboxQueryFailure("getInboxSubmissions fallback failed", second.err);
    return { ok: false };
  }

  logInboxQueryFailure("getInboxSubmissions failed", first.err);
  return { ok: false };
}

/** Dedupe list fetch when Inbox layout + page run in the same request. */
export const getInboxSubmissions = cache(
  async (
    workspaceId: string,
    searchQuery?: string
  ): Promise<InboxSubmissionsResult> => {
    return getInboxSubmissionsInner(workspaceId, searchQuery);
  }
);

export const countUnseenInboxSubmissions = cache(
  async (workspaceId: string): Promise<UnseenCountResult> => {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("seen_at", null);

    if (error) {
      logInboxQueryFailure("countUnseenInboxSubmissions failed", error);
      return { ok: false };
    }

    return { ok: true, count: count ?? 0 };
  }
);

/** Offene Relay-Aufgaben zu einem Fall — leichtgewichtig statt voller Inbox-Liste. */
export const getOpenTaskCountForSubmission = cache(
  async (submissionId: string, workspaceId: string): Promise<number> => {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("submission_id", submissionId)
      .eq("status", "open");

    if (error) {
      logInboxQueryFailure("getOpenTaskCountForSubmission failed", error);
      return 0;
    }

    return count ?? 0;
  }
);
