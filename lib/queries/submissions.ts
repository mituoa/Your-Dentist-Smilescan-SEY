import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeIntakeChannel,
  type IntakeChannel,
} from "@/lib/submissions/intake-channel";
import { isLikelyMissingDbColumnError } from "@/lib/supabase/postgrest-errors";
import { getCurrentWorkspace } from "@/lib/auth-helpers";

const SIGNED_PHOTO_URL_TTL_SEC = 3600;

const SUBMISSION_DETAIL_SELECT_FULL = `
      id, workspace_id, patient_name, patient_email, patient_phone, patient_notes,
      patient_birth_date, patient_external_id, urgency, is_draft, intake_channel,
      practice_status, photo_request_requested_at, follow_up_series_id,
      created_at, updated_at, seen_at, seen_by,
      submission_photos (id, storage_path, sort_order, created_at)
    `;

const SUBMISSION_DETAIL_SELECT_BASE = `
      id, workspace_id, patient_name, patient_email, patient_phone, patient_notes,
      created_at, updated_at, seen_at, seen_by,
      submission_photos (id, storage_path, sort_order, created_at)
    `;

export interface SubmissionDetail {
  id: string;
  workspace_id: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  patient_notes: string | null;
  patient_birth_date: string | null;
  patient_external_id: string | null;
  urgency: string | null;
  is_draft: boolean;
  intake_channel: IntakeChannel;
  created_at: string;
  updated_at: string;
  seen_at: string | null;
  seen_by: string | null;
  practice_status: string | null;
  photo_request_requested_at: string | null;
  follow_up_series_id: string | null;
  photos: Array<{
    id: string;
    storage_path: string;
    sort_order: number;
    created_at: string;
    signed_url: string | null;
  }>;
}

async function signSubmissionPhotos(
  sortedPhotos: Array<{
    id: string;
    storage_path: string;
    sort_order: number;
    created_at: string;
  }>
) {
  if (sortedPhotos.length === 0) return [];

  const admin = createAdminClient();
  const paths = sortedPhotos.map((photo) => photo.storage_path);
  const { data, error } = await admin.storage
    .from("submission-photos")
    .createSignedUrls(paths, SIGNED_PHOTO_URL_TTL_SEC);

  if (error || !data) {
    return sortedPhotos.map((photo) => ({
      id: photo.id,
      storage_path: photo.storage_path,
      sort_order: photo.sort_order,
      created_at: photo.created_at,
      signed_url: null,
    }));
  }

  const signedByPath = new Map<string, string | null>();
  for (const entry of data) {
    const url = entry.signedUrl ?? null;
    if (entry.path) signedByPath.set(entry.path, url);
    if (entry.path && !entry.path.startsWith("/")) {
      signedByPath.set(`/${entry.path}`, url);
    }
  }

  return sortedPhotos.map((photo) => ({
    id: photo.id,
    storage_path: photo.storage_path,
    sort_order: photo.sort_order,
    created_at: photo.created_at,
    signed_url:
      signedByPath.get(photo.storage_path) ??
      signedByPath.get(photo.storage_path.replace(/^\//, "")) ??
      null,
  }));
}

async function getSubmissionByIdInner(
  submissionId: string,
  workspaceId: string
): Promise<SubmissionDetail | null> {
  const supabase = await createClient();

  let res = await supabase
    .from("submissions")
    .select(SUBMISSION_DETAIL_SELECT_FULL)
    .eq("id", submissionId)
    .eq("workspace_id", workspaceId)
    .single();

  let extendedCaseFields = true;
  let hasIntakeChannel = true;
  let hasTrackerBackboneFields = true;
  if (res.error && isLikelyMissingDbColumnError(res.error)) {
    const errMsg = (res.error.message ?? "").toLowerCase();
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
        "[submissions] detail: tracker backbone columns missing — retrying without migration-038 fields."
      );
      hasTrackerBackboneFields = false;
      const withoutBackbone = SUBMISSION_DETAIL_SELECT_FULL.replace(
        /, practice_status, photo_request_requested_at, follow_up_series_id/g,
        ""
      );
      res = await supabase
        .from("submissions")
        .select(withoutBackbone)
        .eq("id", submissionId)
        .eq("workspace_id", workspaceId)
        .single();
    }

    const errMsgAfterBackbone = (res.error?.message ?? "").toLowerCase();
    const intakeOnlyMissing =
      res.error &&
      isLikelyMissingDbColumnError(res.error) &&
      errMsgAfterBackbone.includes("intake_channel") &&
      !errMsgAfterBackbone.includes("patient_birth_date") &&
      !errMsgAfterBackbone.includes("patient_external_id") &&
      !errMsgAfterBackbone.includes("is_draft") &&
      !errMsgAfterBackbone.includes("urgency");

    if (intakeOnlyMissing) {
      console.warn(
        "[submissions] detail: intake_channel missing — retrying without migration-036 field."
      );
      hasIntakeChannel = false;
      const withoutIntake = SUBMISSION_DETAIL_SELECT_FULL.replace(
        ", intake_channel",
        ""
      );
      res = await supabase
        .from("submissions")
        .select(withoutIntake)
        .eq("id", submissionId)
        .eq("workspace_id", workspaceId)
        .single();
    } else {
      console.warn(
        "[submissions] detail: case columns missing — retrying without migration-023 fields."
      );
      extendedCaseFields = false;
      hasIntakeChannel = false;
      res = await supabase
        .from("submissions")
        .select(SUBMISSION_DETAIL_SELECT_BASE)
        .eq("id", submissionId)
        .eq("workspace_id", workspaceId)
        .single();
    }
  }

  const { data, error } = res;
  if (error || !data) {
    const row = error as { code?: string; message?: string } | undefined;
    const code =
      typeof row?.code === "string" && row.code.trim() !== "" ? row.code : "unknown";
    console.error("[submissions] getSubmissionById failed", `code=${code}`);
    return null;
  }

  const sortedPhotos = (data.submission_photos || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order
  );

  const photos = await signSubmissionPhotos(sortedPhotos);

  return {
    id: data.id,
    workspace_id: data.workspace_id,
    patient_name: data.patient_name,
    patient_email: data.patient_email,
    patient_phone: data.patient_phone,
    patient_notes: data.patient_notes,
    patient_birth_date: extendedCaseFields
      ? ((data.patient_birth_date as string | null) ?? null)
      : null,
    patient_external_id: extendedCaseFields
      ? ((data.patient_external_id as string | null) ?? null)
      : null,
    urgency: extendedCaseFields ? ((data.urgency as string | null) ?? null) : null,
    is_draft: extendedCaseFields ? Boolean(data.is_draft) : false,
    intake_channel: hasIntakeChannel
      ? normalizeIntakeChannel(data.intake_channel)
      : "unknown",
    created_at: data.created_at,
    updated_at: data.updated_at as string,
    seen_at: data.seen_at,
    seen_by: data.seen_by,
    practice_status: hasTrackerBackboneFields
      ? ((data.practice_status as string | null) ?? "new")
      : "new",
    photo_request_requested_at: hasTrackerBackboneFields
      ? ((data.photo_request_requested_at as string | null) ?? null)
      : null,
    follow_up_series_id: hasTrackerBackboneFields
      ? ((data.follow_up_series_id as string | null) ?? null)
      : null,
    photos,
  };
}

/**
 * Lädt eine Submission für den **bekannten Workspace** (PostgREST + RLS).
 * `workspace_id` explizit im Query: konsistent mit App-Shell und kein Vertrauen nur auf URL-ID.
 * Gibt `null` bei „nicht gefunden“, RLS-Verweigerung oder technischem Fehler — Aufrufer nutzen das
 * meist als `notFound()` (s. `/inbox/[id]` Punkt 2).
 */
export const getSubmissionById = cache(
  async (submissionId: string, workspaceId: string): Promise<SubmissionDetail | null> => {
    return getSubmissionByIdInner(submissionId, workspaceId);
  }
);

export interface TaskItem {
  id: string;
  content: string;
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  specific_recipient_id: string | null;
  assignee_ids: string[];
  created_by: string;
  created_at: string;
  done_at: string | null;
  done_by: string | null;
  status: "open" | "pending_review" | "done";
}

/**
 * Aufgaben zu einer Submission, **zusätzlich** nach `workspace_id` des aktuellen Kontexts gefiltert
 * (Defense in Depth neben RLS).
 */
export async function getTasksForSubmission(
  submissionId: string
): Promise<TaskItem[]> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, content, recipient_type, specific_recipient_id, created_by, created_at, done_at, done_by, status, task_assignees(user_id)"
    )
    .eq("submission_id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .order("created_at", { ascending: false });

  if (error) {
    const row = error as { code?: string; message?: string };
    const code =
      typeof row?.code === "string" && row.code.trim() !== "" ? row.code : "unknown";
    console.error("[submissions] getTasksForSubmission failed", `code=${code}`);
    return [];
  }

  return (data || []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: row.id as string,
      content: row.content as string,
      recipient_type: row.recipient_type as TaskItem["recipient_type"],
      specific_recipient_id: (row.specific_recipient_id as string | null) ?? null,
      assignee_ids: (
        ((row.task_assignees as Array<{ user_id: string }> | null) || [])
          .map((assignee) => assignee.user_id)
          .filter((id): id is string => Boolean(id))
      ),
      created_by: row.created_by as string,
      created_at: row.created_at as string,
      done_at: (row.done_at as string | null) ?? null,
      done_by: (row.done_by as string | null) ?? null,
      status: (row.status as TaskItem["status"]) ?? "open",
    };
  });
}

export async function getProfileData(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_data")
    .select("display_name, practice_name, practice_phone, appointment_link")
    .eq("workspace_id", workspaceId)
    .single();
  return data;
}
