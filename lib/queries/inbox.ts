import { createClient } from "@/lib/supabase/server";

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

export async function getInboxSubmissions(
  workspaceId: string,
  searchQuery?: string
): Promise<SubmissionListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("submissions")
    .select(
      "id, patient_name, patient_email, patient_notes, patient_birth_date, patient_external_id, urgency, is_draft, created_at, seen_at, submission_photos(count)"
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    query = query.or(`patient_name.ilike.%${q}%,patient_email.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[inbox] getInboxSubmissions failed:", error);
    return [];
  }

  return (data || []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    patient_name: s.patient_name as string | null,
    patient_email: s.patient_email as string | null,
    patient_notes: (s.patient_notes as string | null) ?? null,
    patient_birth_date: (s.patient_birth_date as string | null) ?? null,
    patient_external_id: (s.patient_external_id as string | null) ?? null,
    urgency: (s.urgency as string | null) ?? null,
    is_draft: Boolean(s.is_draft),
    created_at: s.created_at as string,
    seen_at: s.seen_at as string | null,
    photo_count:
      (s.submission_photos as { count: number }[] | undefined)?.[0]?.count || 0,
  }));
}
