import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const SIGNED_PHOTO_URL_TTL_SEC = 3600;

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
  created_at: string;
  updated_at: string;
  seen_at: string | null;
  seen_by: string | null;
  photos: Array<{
    id: string;
    storage_path: string;
    sort_order: number;
    signed_url: string | null;
  }>;
}

export async function getSubmissionById(
  submissionId: string
): Promise<SubmissionDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id, workspace_id, patient_name, patient_email, patient_phone, patient_notes,
      patient_birth_date, patient_external_id, urgency, is_draft,
      created_at, updated_at, seen_at, seen_by,
      submission_photos (id, storage_path, sort_order)
    `
    )
    .eq("id", submissionId)
    .single();

  if (error) {
    console.error("[submissions] getSubmissionById failed:", error);
    return null;
  }

  const sortedPhotos = (data.submission_photos || []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order
  );

  const admin = createAdminClient();
  const photos = await Promise.all(
    sortedPhotos.map(
      async (photo: {
        id: string;
        storage_path: string;
        sort_order: number;
      }) => {
        const { data: signed } = await admin.storage
          .from("submission-photos")
          .createSignedUrl(photo.storage_path, SIGNED_PHOTO_URL_TTL_SEC);
        return {
          id: photo.id,
          storage_path: photo.storage_path,
          sort_order: photo.sort_order,
          signed_url: signed?.signedUrl ?? null,
        };
      }
    )
  );

  return {
    id: data.id,
    workspace_id: data.workspace_id,
    patient_name: data.patient_name,
    patient_email: data.patient_email,
    patient_phone: data.patient_phone,
    patient_notes: data.patient_notes,
    patient_birth_date: (data.patient_birth_date as string | null) ?? null,
    patient_external_id: (data.patient_external_id as string | null) ?? null,
    urgency: (data.urgency as string | null) ?? null,
    is_draft: Boolean(data.is_draft),
    created_at: data.created_at,
    updated_at: data.updated_at as string,
    seen_at: data.seen_at,
    seen_by: data.seen_by,
    photos,
  };
}

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

export async function getTasksForSubmission(
  submissionId: string
): Promise<TaskItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, content, recipient_type, specific_recipient_id, created_by, created_at, done_at, done_by, status, task_assignees(user_id)"
    )
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[submissions] getTasksForSubmission failed:", error);
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
    .select("display_name, practice_name, appointment_link")
    .eq("workspace_id", workspaceId)
    .single();
  return data;
}
