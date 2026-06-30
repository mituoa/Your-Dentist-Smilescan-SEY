"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { buildTerminOfferDraft } from "@/lib/clinical/message-templates";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { sendPatientOutboundMessage } from "@/lib/outbound-messages/send-to-patient";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  recipientIdsRequiringMembershipCheck,
  resolveTaskCreateAssignment,
} from "@/lib/tasks/resolve-task-create-assignment";
import { submitTaskForReview } from "@/app/(protected)/my-tasks/actions";
import { upsertTaskReceipts } from "@/lib/tasks/receipts";
import { resolveTaskDisplayTitle } from "@/lib/tasks/title";
import { submissionPhotoDownloadErrors } from "@/lib/inbox/submission-photo-download-errors";
import {
  normalizePracticeStatus,
  type PracticeStatusId,
} from "@/lib/practice-status";
import JSZip from "jszip";

/**
 * Server-Actions für `/inbox/[id]`. **Punkt 8 — Fehler:** Rückgaben mit `error` nutzen **nur**
 * feste deutsche Kurzmeldungen; niemals PostgREST-/Storage-Rohstrings in die UI. Technische
 * Details nur serverseitig über {@link logPostgrest}. ZIP-Meldungen: `lib/inbox/submission-photo-download-errors.ts`.
 * **Punkt 10:** `submitInboxTaskForReview` bindet Task an `submission_id` + Workspace vor Mutation;
 * Mail-Fehler in `createTask` ohne Exception-Details im Log.
 */
const MAX_ZIP_BYTES = 50 * 1024 * 1024;

/** Server-Logs: PostgREST-Code + Message, kein vollständiges Error-Objekt / keine Roh-SQL-Dumps. */
function logPostgrest(scope: string, err: unknown) {
  const row = err as { code?: string; message?: string };
  const code =
    typeof row?.code === "string" && row.code.trim() !== "" ? row.code : "unknown";
  const message = typeof row?.message === "string" ? row.message : "";
  console.error(`[${scope}] code=${code}`, message || undefined);
}

function formatSubmissionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "unknown-date";
  }
  return date.toISOString().slice(0, 10);
}

function transliterateGerman(input: string): string {
  return input
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function sanitizeNamePart(input: string): string {
  return transliterateGerman(input)
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toPatientSlug(patientName: string | null): string {
  const safe = sanitizeNamePart(patientName || "");
  if (!safe) return "Unbekannt-Patient";
  const parts = safe.split("-").filter(Boolean);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastName = parts.slice(1).join("-");
  return `${lastName}-${firstName}`;
}

function fileExtensionFromPath(path: string): string {
  const segment = path.split("/").pop() || "";
  const dotIndex = segment.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === segment.length - 1) return "jpg";
  return segment.slice(dotIndex + 1).toLowerCase();
}

function toBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

/** Markiert „gelesen“ nur für Submissions des **aktuellen App-Workspaces** (wie `updateSubmissionUrgency`). Idempotent bei wiederholtem Aufruf (`.is("seen_at", null)`). */
export async function markSubmissionSeen(submissionId: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Arbeitsbereich nicht gefunden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("submissions")
    .update({
      seen_at: now,
      seen_by: user.id,
      practice_status: "in_progress",
      updated_at: now,
    })
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .is("seen_at", null);

  if (error) {
    logPostgrest("markSubmissionSeen", error);
    return { error: "Status konnte nicht aktualisiert werden." };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  revalidatePath("/inbox", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

export type SubmissionUrgencyValue =
  | "today"
  | "within_24h"
  | "this_week"
  | "not_urgent";

export type InboxPracticeStatusValue = PracticeStatusId;

export async function updateSubmissionUrgency(
  submissionId: string,
  urgency: SubmissionUrgencyValue
) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Arbeitsbereich nicht gefunden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      urgency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    logPostgrest("updateSubmissionUrgency", error);
    return {
      error:
        "Dringlichkeit konnte gerade nicht gespeichert werden. Bitte erneut wählen.",
    };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  revalidatePath("/inbox", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Setzt einen Fall auf ungelesen — Praxisstatus bleibt (unterscheidbar von neuer Einsendung). */
export async function markSubmissionUnseen(submissionId: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Arbeitsbereich nicht gefunden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { error } = await supabase
    .from("submissions")
    .update({
      seen_at: null,
      seen_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    logPostgrest("markSubmissionUnseen", error);
    return { error: "Status konnte nicht aktualisiert werden." };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  revalidatePath("/inbox", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Persistenter Praxisstatus (`submissions.practice_status`). */
export async function updateSubmissionPracticeStatus(
  submissionId: string,
  status: InboxPracticeStatusValue
) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Arbeitsbereich nicht gefunden." };
  }

  if (!normalizePracticeStatus(status)) {
    return { error: "Ungültiger Status." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: row, error: fetchError } = await supabase
    .from("submissions")
    .select("seen_at")
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .maybeSingle();

  if (fetchError || !row) {
    logPostgrest("updateSubmissionPracticeStatus", fetchError);
    return { error: "Fall konnte nicht geladen werden." };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    practice_status: status,
    updated_at: now,
  };

  if (status === "new") {
    patch.seen_at = null;
    patch.seen_by = null;
  } else {
    patch.seen_at = row.seen_at ?? now;
    patch.seen_by = user.id;
    if (status === "watching") {
      patch.urgency = "not_urgent";
    }
  }

  const { error } = await supabase
    .from("submissions")
    .update(patch)
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    logPostgrest("updateSubmissionPracticeStatus", error);
    return { error: "Status konnte nicht gespeichert werden." };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  revalidatePath("/inbox", "layout");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createTask(formData: FormData) {
  const submissionId = formData.get("submission_id") as string;
  const title = ((formData.get("title") as string) || "").trim();
  const content = formData.get("content") as string;
  const priority = formData.get("is_important") === "true" ? "important" : "normal";
  const assignAllTeam = formData.get("assign_all_team") === "true";
  const assignToMe = formData.get("assign_to_me") === "true";
  const specificRecipientId =
    (formData.get("specific_recipient_id") as string | null) || null;
  const specificRecipientIds = Array.from(
    new Set(
      formData
        .getAll("specific_recipient_ids[]")
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );

  if (!submissionId || !content?.trim()) {
    return { error: "Bitte geben Sie eine Aufgabe ein." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet." };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Arbeitsbereich nicht gefunden." };

  const { data: ownedSubmission, error: ownedSubmissionError } = await supabase
    .from("submissions")
    .select("id")
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .maybeSingle();

  if (ownedSubmissionError || !ownedSubmission) {
    return { error: "Fall nicht gefunden oder kein Zugriff." };
  }

  const sortOrder = Date.now();
  if (assignAllTeam && specificRecipientIds.length > 0) {
    return { error: "Bitte wählen Sie entweder alle Mitarbeitenden oder konkrete Personen." };
  }

  const { count: otherMemberCount } = await supabase
    .from("workspace_members")
    .select("user_id", { count: "exact", head: true })
    .eq("workspace_id", workspace.workspace_id)
    .neq("user_id", user.id);

  const assignment = resolveTaskCreateAssignment({
    assignAllTeam,
    assignToMe,
    assignToDoctor: false,
    specificRecipientId,
    specificRecipientIds,
    creatorUserId: user.id,
    otherMemberCount: otherMemberCount ?? 0,
  });

  const {
    recipientType,
    assignAllTeam: effectiveAssignAllTeam,
    finalSpecificRecipientIds,
    specificRecipientIdForRow,
  } = assignment;

  const recipientIdsToVerify = recipientIdsRequiringMembershipCheck(
    finalSpecificRecipientIds,
    user.id
  );

  if (recipientType === "specific_person" && recipientIdsToVerify.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspace.workspace_id)
      .in("user_id", recipientIdsToVerify);
    if (memberError || !members || members.length !== recipientIdsToVerify.length) {
      return {
        error: "Ausgewählter Mitarbeitender ist in diesem Arbeitsbereich nicht verfügbar.",
      };
    }
  }

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspace.workspace_id,
      submission_id: submissionId,
      title: title.length > 0 ? title : null,
      content: content.trim(),
      priority,
      recipient_type: recipientType,
      specific_recipient_id: specificRecipientIdForRow,
      created_by: user.id,
      status: "open",
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    logPostgrest("createTask", error);
    return {
      error: "Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen.",
    };
  }

  const newTaskId = inserted?.id as string;

  if (!effectiveAssignAllTeam && finalSpecificRecipientIds.length > 0) {
    const assigneeRows = finalSpecificRecipientIds.map((id) => ({
      task_id: newTaskId,
      user_id: id,
    }));
    const { error: assigneeError } = await supabase
      .from("task_assignees")
      .insert(assigneeRows);
    if (assigneeError) {
      logPostgrest("createTask assignees", assigneeError);
      await supabase.from("tasks").delete().eq("id", newTaskId);
      return { error: "Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen." };
    }
  }

  try {
    const { buildTaskAssigned } = await import("@/lib/mail/task-notifications");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { getAppBaseUrl } = await import("@/lib/env");

    const admin = createAdminClient();
    const recipients: Array<{ userId: string; email: string }> = [];

    if (effectiveAssignAllTeam) {
      const { data: members } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspace.workspace_id)
        .neq("user_id", user.id);
      for (const m of members || []) {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        if (data?.user?.email) recipients.push({ userId: m.user_id, email: data.user.email });
      }
    } else if (finalSpecificRecipientIds.length > 0) {
      for (const recipientId of finalSpecificRecipientIds) {
        const { data } = await admin.auth.admin.getUserById(recipientId);
        if (data?.user?.email && data.user.id !== user.id) {
          recipients.push({ userId: recipientId, email: data.user.email });
        }
      }
    }

    const dedupedRecipients = Array.from(
      new Map(recipients.map((recipient) => [recipient.userId, recipient])).values()
    );
    const receiptRows: Array<{ userId: string; email?: string | null; messageId?: string | null }> = [];
    if (dedupedRecipients.length > 0) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${newTaskId}`;
      const mail = buildTaskAssigned({
        taskTitle: resolveTaskDisplayTitle(title, content.trim()),
        taskUrl,
        actorName: user.email || "Arzt",
        recipientEmail: dedupedRecipients[0]?.email || "",
      });
      for (const recipient of dedupedRecipients) {
        const result = await sendTransactionalMailBestEffort(
          { to: recipient.email, subject: mail.subject, text: mail.text, html: mail.html },
          "task_assigned"
        );
        receiptRows.push({
          userId: recipient.userId,
          email: recipient.email,
          messageId: result.messageId ?? null,
        });
      }
    }
    if (!effectiveAssignAllTeam) {
      const knownRecipientIds = new Set(receiptRows.map((row) => row.userId));
      for (const recipientId of finalSpecificRecipientIds) {
        if (!knownRecipientIds.has(recipientId)) {
          receiptRows.push({ userId: recipientId, email: null, messageId: null });
        }
      }
    }
    if (receiptRows.length > 0) {
      await upsertTaskReceipts(newTaskId, receiptRows);
    }
  } catch {
    console.error("[createTask mail] failed");
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  return { success: true };
}

/** Inbox: meldet Erledigung (ersetzt früheres direktes Abhaken). */
export async function submitInboxTaskForReview(
  taskId: string,
  submissionId: string
) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Arbeitsbereich nicht gefunden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: boundTask, error: lookupError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("submission_id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .maybeSingle();

  if (lookupError) {
    logPostgrest("submitInboxTaskForReview bind", lookupError);
  }
  if (!boundTask) {
    return { error: "Aufgabe nicht gefunden." };
  }

  const result = await submitTaskForReview(taskId);
  if (result.success) {
    revalidatePath(`/inbox/${submissionId}`);
  }
  return result;
}

/** @deprecated Nutzen Sie „Termin anbieten“ im Tracker — einheitlicher `outbound_messages`-Flow. */
export async function sendAppointmentLink(submissionId: string) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Arbeitsbereich nicht gefunden." };
  }

  const supabase = await createClient();
  const { data: submission, error: submissionLookupError } = await supabase
    .from("submissions")
    .select("patient_name, patient_email, urgency, workspace_id")
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (submissionLookupError || !submission) {
    return { error: "Fall nicht gefunden oder kein Zugriff." };
  }

  const { data: profile } = await supabase
    .from("profile_data")
    .select("practice_name, appointment_link, practice_phone")
    .eq("workspace_id", workspace.workspace_id)
    .single();

  const urgency =
    submission.urgency === "today" ||
    submission.urgency === "within_24h" ||
    submission.urgency === "this_week" ||
    submission.urgency === "not_urgent"
      ? submission.urgency
      : "this_week";

  const body = buildTerminOfferDraft({
    patientName: submission.patient_name?.trim() || "Patient",
    urgency,
    practicePhone: profile?.practice_phone?.trim() || "",
    appointmentUrl: profile?.appointment_link?.trim() ?? null,
  });

  const result = await sendPatientOutboundMessage({
    submissionId,
    body,
    messageKind: "appointment_offer",
    includeAppointmentLink: Boolean(profile?.appointment_link?.trim()),
    urgency,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  return { success: true, message: "Terminangebot wurde per E-Mail gesendet." };
}

/**
 * ZIP-Export für eine Submission im aktuellen Arbeitsbereich. **Punkt 8:** `error` ist immer eine
 * feste deutsche Kurzmeldung (keine Roh-PostgREST-/Storage-Texte für die UI). Texte zentral in
 * `lib/inbox/submission-photo-download-errors.ts` — dort bei neuen Fehlerfällen ergänzen.
 */
export async function downloadSubmissionPhotos(
  submissionId: string
): Promise<{ error?: string; zipBase64?: string; filename?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: submissionPhotoDownloadErrors.noWorkspace };
  }
  if (!["doctor", "team"].includes(workspace.role)) {
    return { error: submissionPhotoDownloadErrors.forbidden };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: submissionPhotoDownloadErrors.notSignedIn };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, workspace_id, patient_name, created_at")
    .eq("id", submissionId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (submissionError || !submission) {
    logPostgrest("downloadSubmissionPhotos submission", submissionError);
    return { error: submissionPhotoDownloadErrors.submissionNotFound };
  }

  const { data: photos, error: photosError } = await supabase
    .from("submission_photos")
    .select("id, storage_path, sort_order")
    .eq("submission_id", submissionId)
    .order("sort_order", { ascending: true });

  if (photosError) {
    logPostgrest("downloadSubmissionPhotos photos", photosError);
    return { error: submissionPhotoDownloadErrors.generic };
  }

  if (!photos || photos.length === 0) {
    return { error: submissionPhotoDownloadErrors.noPhotos };
  }

  const datePart = formatSubmissionDate(submission.created_at);
  const patientPart = toPatientSlug(submission.patient_name);
  const zipFilename = `${datePart}_${patientPart}.zip`;
  const zip = new JSZip();
  const admin = createAdminClient();

  let cumulativeBytes = 0;

  for (const [index, photo] of photos.entries()) {
    const { data, error } = await admin.storage
      .from("submission-photos")
      .download(photo.storage_path);

    if (error || !data) {
      logPostgrest("downloadSubmissionPhotos storage", error);
      return { error: submissionPhotoDownloadErrors.generic };
    }

    const arrayBuffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    cumulativeBytes += uint8.byteLength;
    if (cumulativeBytes > MAX_ZIP_BYTES) {
      return { error: submissionPhotoDownloadErrors.tooLarge };
    }

    const fileIndex = String(index + 1).padStart(2, "0");
    const ext = fileExtensionFromPath(photo.storage_path);
    const zipEntryName = `${datePart}_${patientPart}_${fileIndex}.${ext}`;
    zip.file(zipEntryName, uint8);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  if (zipBuffer.byteLength > MAX_ZIP_BYTES) {
    return { error: submissionPhotoDownloadErrors.tooLarge };
  }

  return {
    filename: zipFilename,
    zipBase64: toBase64(zipBuffer),
  };
}
