import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isLikelyMissingDbRelationError } from "@/lib/supabase/postgrest-errors";
import type { PhotoDocumentationHint } from "@/lib/inbox/tracker-inbox-logic";
import type { SubmissionListItem } from "@/lib/queries/inbox";

function logInboxEnrichmentFailure(scope: string, err: unknown): void {
  const row = err as { code?: string };
  const code = typeof row?.code === "string" ? row.code : "unknown";
  console.error(`[inbox-enrichment] ${scope} code=${code}`);
}

const SUBMISSION_BATCH = 120;

function dayKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function relativeDayLabel(dayKeyStr: string, index: number, total: number): string {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (dayKeyStr === todayKey) return "Heute";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dayKeyStr === yesterday.toISOString().slice(0, 10)) return "Gestern";
  if (total <= 4) return `Tag ${index + 1}`;
  const d = new Date(`${dayKeyStr}T12:00:00Z`);
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function buildPhotoHintFromTimestamps(
  timestamps: string[],
  linkedSubmissionCount: number
): PhotoDocumentationHint | null {
  if (timestamps.length === 0) return null;

  const keys = [...new Set(timestamps.map(dayKey).filter((k): k is string => Boolean(k)))].sort();
  const dayLabels = keys.map((k, i) => relativeDayLabel(k, i, keys.length));

  if (linkedSubmissionCount > 1) {
    return {
      kind: "linked",
      photoCount: timestamps.length,
      dayCount: keys.length,
      dayLabels,
      linkedSubmissionCount,
    };
  }

  if (timestamps.length >= 2 && keys.length >= 2) {
    return {
      kind: "timeline",
      photoCount: timestamps.length,
      dayCount: keys.length,
      dayLabels,
      linkedSubmissionCount: 1,
    };
  }

  return {
    kind: "single",
    photoCount: timestamps.length,
    dayCount: keys.length || 1,
    dayLabels: [],
    linkedSubmissionCount: 1,
  };
}

export async function attachInboxListEnrichment(
  workspaceId: string,
  items: SubmissionListItem[]
): Promise<
  Array<
    SubmissionListItem & {
      open_task_count: number;
      photo_documentation: PhotoDocumentationHint | null;
    }
  >
> {
  if (items.length === 0) return [];

  const supabase = await createClient();
  const submissionIds = items.map((i) => i.id);

  const openTaskCount = new Map<string, number>();
  const photoTimestampsBySubmission = new Map<string, string[]>();

  for (let i = 0; i < submissionIds.length; i += SUBMISSION_BATCH) {
    const batch = submissionIds.slice(i, i + SUBMISSION_BATCH);

    const [tasksRes, photosRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("submission_id")
        .eq("workspace_id", workspaceId)
        .eq("status", "open")
        .in("submission_id", batch),
      supabase
        .from("submission_photos")
        .select("submission_id, created_at")
        .in("submission_id", batch),
    ]);

    if (tasksRes.error) {
      if (!isLikelyMissingDbRelationError(tasksRes.error)) {
        logInboxEnrichmentFailure("open tasks batch", tasksRes.error);
      }
    } else {
      for (const row of tasksRes.data ?? []) {
        const sid = row.submission_id as string;
        openTaskCount.set(sid, (openTaskCount.get(sid) ?? 0) + 1);
      }
    }

    if (photosRes.error) {
      if (!isLikelyMissingDbRelationError(photosRes.error)) {
        logInboxEnrichmentFailure("submission_photos batch", photosRes.error);
      }
    } else {
      for (const row of photosRes.data ?? []) {
        const sid = row.submission_id as string;
        const ts = row.created_at as string;
        const list = photoTimestampsBySubmission.get(sid) ?? [];
        list.push(ts);
        photoTimestampsBySubmission.set(sid, list);
      }
    }
  }

  const externalIds = [
    ...new Set(
      items
        .map((i) => i.patient_external_id?.trim())
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const linkedCountByExternalId = new Map<string, number>();
  const linkedPhotoTimestampsByExternalId = new Map<string, string[]>();

  if (externalIds.length > 0) {
    const { data: linkedRows } = await supabase
      .from("submissions")
      .select("id, patient_external_id")
      .eq("workspace_id", workspaceId)
      .in("patient_external_id", externalIds);

    const idsByExt = new Map<string, string[]>();
    for (const row of linkedRows ?? []) {
      const ext = (row.patient_external_id as string)?.trim();
      if (!ext) continue;
      const list = idsByExt.get(ext) ?? [];
      list.push(row.id as string);
      idsByExt.set(ext, list);
      linkedCountByExternalId.set(ext, list.length);
    }

    for (const ext of externalIds) {
      const ids = idsByExt.get(ext) ?? [];
      if (ids.length < 2) continue;
      const stamps: string[] = [];
      for (const sid of ids) {
        stamps.push(...(photoTimestampsBySubmission.get(sid) ?? []));
      }
      if (stamps.length > 0) {
        linkedPhotoTimestampsByExternalId.set(ext, stamps);
      }
    }
  }

  return items.map((item) => {
    const ext = item.patient_external_id?.trim();
    const linkedCount = ext ? (linkedCountByExternalId.get(ext) ?? 1) : 1;
    const stamps =
      ext && linkedCount > 1 && linkedPhotoTimestampsByExternalId.has(ext)
        ? linkedPhotoTimestampsByExternalId.get(ext)!
        : photoTimestampsBySubmission.get(item.id) ?? [];

    return {
      ...item,
      open_task_count: openTaskCount.get(item.id) ?? 0,
      photo_documentation: buildPhotoHintFromTimestamps(stamps, linkedCount),
    };
  });
}
