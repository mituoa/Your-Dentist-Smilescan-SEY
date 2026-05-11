import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isLikelyMissingDbColumnError } from "@/lib/supabase/postgrest-errors";

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
  "created_at",
  "seen_at",
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

function mapInboxRow(
  s: Record<string, unknown>,
  defaultsForMissingCaseFields: boolean
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
  };
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
  defaultsForMissingCaseFields: boolean
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
  const items = rows.map((row) => mapInboxRow(row, defaultsForMissingCaseFields));

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
    false
  );

  if (first.ok) return { ok: true, items: first.items };

  if (isLikelyMissingDbColumnError(first.err)) {
    console.warn(
      "[inbox] submissions case columns missing in DB — retrying list without migration-023 fields. Apply migration 023 for full fields."
    );
    const second = await fetchInboxRowsOnce(
      workspaceId,
      searchQuery,
      INBOX_SELECT_BASE,
      true
    );
    if (second.ok) return { ok: true, items: second.items };
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
