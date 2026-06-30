"use server";

/**
 * Server Actions für `/create-case` — **Punkt 1 (Zweck)** s. `create-case/page.tsx`: Praxis-Fallerstellung, keine
 * CRM-/Ticket-Semantik. **`createPracticeCase`:** nur mit **Arztrolle** und gültigem Workspace; Upload-Pfade strikt
 * `workspaceId/temp/…`.
 *
 * **Punkt 2 (Status — final):** Defense-in-Depth **Rolle** (Arzt) parallel zur Page; kein Client-Trust. Nach Insert:
 * `revalidatePath` + strukturierte Fehler — keine Roh-DB-Strings an den Browser. **`deleteTempSubmissionPhotos`:**
 * bei abgebrochener Kette nur `workspaceId/temp/…` des eigenen Workspaces (kein Workflow-Engine-Overhead).
 *
 * **Punkt 8 (Error — final):** Nur **kurze, ruhige** deutschsprachige `error`-Strings; keine Storage-/Pfad-Details,
 * keine Roh-Postgres-Meldungen; Logging nur serverseitig. **`partialAttachments`:** Submission gespeichert, nicht alle
 * vorgesehenen Fotos vollständig übernommen — Nutzerhinweis über Inbox-Query (`CaseCreatedToast`), ohne Technik.
 *
 * **Punkt 3 (Supabase/Auth — final):** **`/api/upload`:** Praxis **Arzt + Session-Workspace**; Patienten-Pfad mit
 * **`doc_slug`** (Workspace serverseitig, Abgleich mit optionalem `workspace_id`). Temp-Pfade nur
 * **`filterTempPathsForWorkspace`**. **Submissions** per User-Client (RLS); **Storage-Move** Admin;
 * **`submission_photos`** per User-Insert + RLS **031**; authentifizierte **`submissions`**-Inserts ohne
 * Mitgliedschaft entfallen (**032**). Server-Logs ohne Storage-Pfad-Strings.
 *
 * **Punkt 10 (Security — final):** Page + Action **Arzt-only** (RLS **024** erlaubt Mitgliedern generell INSERT —
 * Arzt-Gate ist **serverseitig** in dieser Action). **Workspace** nur aus Session; **Temp-Pfade** strikt
 * `…/temp/<uuid>.<ext>` (kein Client-Pfad-Trust); **Feldgrenzen** + **Dringlichkeit** zur Laufzeit; **Geburtsdatum**
 * nur ISO `YYYY-MM-DD` oder leer; keine Roh-DB-/Pfad-Leaks im Client — s. `create-case/page.tsx`.
 *
 * **Punkt 11 (MVP — final):** **Kein** Workflow-/Intake-Overbuild: nur erlaubte Spalten, Entwurf vs. Speichern,
 * optionale Bilder; **kein** Autosave, **keine** KI-/Realtime-/CRM-Erweiterung in dieser Action — s. `page.tsx`.
 *
 * **Punkt 12 (Nice / Future / Non-MVP — final):** Action bleibt **schmal** — keine CRM-/Workflow-Felder oder -Zweige;
 * serverseitige Erweiterungen nur nach Produktentscheid und **`page.tsx` Punkt 12**.
 *
 * **Punkt 13 (Priorität — final):** P0 = Arzt/Workspace/Insert-/Pfad-Kette unangetastet regressionsfrei — s.
 * **`page.tsx` Punkt 13**; keine „schnellen“ Feature-Zweige ohne Beschluss.
 */

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { bootstrapSubmissionMessageDraftBestEffort } from "@/lib/care-center/bootstrap-submission-message-draft";
import { INTAKE_CHANNEL_PRACTICE_MANUAL } from "@/lib/submissions/intake-channel";
import { isLikelyMissingDbColumnError } from "@/lib/supabase/postgrest-errors";
import { MAX_PHOTOS } from "@/lib/upload/validation";

export type PracticeCaseUrgency = "not_urgent" | "this_week" | "today" | null;

const URGENCY_LABEL_DE: Record<NonNullable<PracticeCaseUrgency>, string> = {
  not_urgent: "Nicht dringend",
  this_week: "Diese Woche",
  today: "Heute",
};

/** Nur Objektschlüssel wie `POST /api/upload` (UUID + Extension aus `storageExtForValidatedImage`). */
const SAFE_TEMP_OBJECT_KEY =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|heic)$/i;

const PC_FIELD_LIMITS = {
  name: 500,
  notes: 20_000,
  email: 254,
  phone: 60,
  externalId: 200,
} as const;

function isAllowedPracticeCaseUrgency(u: unknown): u is PracticeCaseUrgency {
  return u === null || u === "not_urgent" || u === "this_week" || u === "today";
}

function isIsoDateOnly(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function practiceCaseFieldBoundsError(opts: {
  nameTrim: string;
  notesTrim: string | null;
  emailTrim: string | null;
  phoneTrim: string | null;
  extIdTrim: string | null;
}): string | null {
  if (opts.nameTrim.length > PC_FIELD_LIMITS.name) {
    return "Der Patientenname ist zu lang. Bitte kürzen Sie die Eingabe.";
  }
  const n = opts.notesTrim?.length ?? 0;
  if (n > PC_FIELD_LIMITS.notes) {
    return "Die Kurznotiz ist zu lang. Bitte kürzen Sie die Eingabe.";
  }
  const e = opts.emailTrim?.length ?? 0;
  if (e > PC_FIELD_LIMITS.email) {
    return "Die E-Mail-Adresse ist zu lang. Bitte kürzen Sie die Eingabe.";
  }
  const ph = opts.phoneTrim?.length ?? 0;
  if (ph > PC_FIELD_LIMITS.phone) {
    return "Die Telefonnummer ist zu lang. Bitte kürzen Sie die Eingabe.";
  }
  const x = opts.extIdTrim?.length ?? 0;
  if (x > PC_FIELD_LIMITS.externalId) {
    return "Die Patienten-ID ist zu lang. Bitte kürzen Sie die Eingabe.";
  }
  return null;
}

function looksLikeMissingCaseColumnsError(
  err: { message?: string; code?: string } | null
): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  const code = err.code;
  return (
    code === "42703" ||
    (msg.includes("column") &&
      (msg.includes("patient_birth_date") ||
        msg.includes("patient_external_id") ||
        msg.includes("urgency") ||
        msg.includes("is_draft")))
  );
}

function mergeCaseFieldsIntoNotes(
  baseNotes: string | null,
  opts: {
    birth: string | null;
    externalId: string | null;
    email: string | null;
    phone: string | null;
    urgency: PracticeCaseUrgency;
    isDraft: boolean;
  }
): string | null {
  const lines: string[] = [];
  const trimmed = (baseNotes || "").trim();
  if (trimmed) lines.push(trimmed);
  const meta: string[] = [];
  if (opts.birth) meta.push(`Geburtsdatum: ${opts.birth}`);
  if (opts.externalId) meta.push(`Patienten-ID: ${opts.externalId}`);
  if (opts.email) meta.push(`E-Mail: ${opts.email}`);
  if (opts.phone) meta.push(`Telefon: ${opts.phone}`);
  if (opts.urgency) {
    meta.push(`Dringlichkeit: ${URGENCY_LABEL_DE[opts.urgency]}`);
  }
  if (opts.isDraft) meta.push("Status: Entwurf");
  if (meta.length) {
    lines.push(`\n—\n${meta.join("\n")}`);
  }
  const out = lines.join("").trim();
  return out.length > 0 ? out : null;
}

/** Nur Pfade unter `workspaceId/temp/<uuid>.<ext>` — verhindert Löschen/Moves außerhalb des Temp-Präfixes und fremde Schlüssel. */
function tryGetAdminClient(): SupabaseClient | null {
  try {
    return createAdminClient();
  } catch (error) {
    console.error("[createPracticeCase] admin client unavailable", error);
    return null;
  }
}

function isRlsInsertDenial(
  err: { code?: string; message?: string } | null | undefined
): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  return err.code === "42501" || msg.includes("row-level security");
}

function userFacingSubmissionInsertError(
  err: { code?: string; message?: string } | null | undefined
): string {
  if (isRlsInsertDenial(err)) {
    return "Der Patientenfall konnte nicht gespeichert werden. Bitte laden Sie die Seite neu oder melden Sie sich erneut an.";
  }
  return "Die Speicherung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut.";
}

function safeRevalidateCreateCasePaths(submissionId: string): void {
  try {
    revalidatePath("/inbox", "layout");
    revalidatePath("/inbox", "page");
    revalidatePath(`/inbox/${submissionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/relay");
    revalidatePath("/create-case");
  } catch (error) {
    console.error("[createPracticeCase] revalidate failed", error);
  }
}

type PracticeSubmissionInsertInput = {
  workspaceId: string;
  nameTrim: string;
  notesTrim: string | null;
  extIdTrim: string | null;
  emailTrim: string | null;
  phoneTrim: string | null;
  birth: string | null;
  urgency: PracticeCaseUrgency;
  isDraft: boolean;
};

async function insertPracticeSubmissionRow(
  db: SupabaseClient,
  input: PracticeSubmissionInsertInput
): Promise<{ id: string } | { error: string }> {
  const {
    workspaceId,
    nameTrim,
    notesTrim,
    extIdTrim,
    emailTrim,
    phoneTrim,
    birth,
    urgency,
    isDraft,
  } = input;

  const caseInsertBase = {
    workspace_id: workspaceId,
    patient_name: nameTrim || null,
    patient_email: emailTrim,
    patient_phone: phoneTrim,
    patient_notes: notesTrim,
    patient_birth_date: birth,
    patient_external_id: extIdTrim,
    urgency,
    is_draft: isDraft,
  };

  let fullInsert = await db
    .from("submissions")
    .insert({
      ...caseInsertBase,
      intake_channel: INTAKE_CHANNEL_PRACTICE_MANUAL,
    })
    .select("id")
    .single();

  if (
    fullInsert.error &&
    isLikelyMissingDbColumnError(fullInsert.error) &&
    !looksLikeMissingCaseColumnsError(fullInsert.error)
  ) {
    fullInsert = await db
      .from("submissions")
      .insert(caseInsertBase)
      .select("id")
      .single();
  }

  if (!fullInsert.error && fullInsert.data?.id) {
    return { id: fullInsert.data.id as string };
  }

  if (
    fullInsert.error &&
    looksLikeMissingCaseColumnsError(fullInsert.error)
  ) {
    console.warn(
      "[createPracticeCase] DB ohne Migration-023-Felder — Fallback mit strukturierten Notizen."
    );
    const legacyNotes = mergeCaseFieldsIntoNotes(notesTrim, {
      birth,
      externalId: extIdTrim,
      email: emailTrim,
      phone: phoneTrim,
      urgency,
      isDraft,
    });
    const legacyBase = {
      workspace_id: workspaceId,
      patient_name: nameTrim || null,
      patient_email: emailTrim,
      patient_phone: phoneTrim,
      patient_notes: legacyNotes,
    };
    let legacy = await db
      .from("submissions")
      .insert({
        ...legacyBase,
        intake_channel: INTAKE_CHANNEL_PRACTICE_MANUAL,
      })
      .select("id")
      .single();
    if (legacy.error && isLikelyMissingDbColumnError(legacy.error)) {
      legacy = await db
        .from("submissions")
        .insert(legacyBase)
        .select("id")
        .single();
    }
    if (!legacy.error && legacy.data?.id) {
      return { id: legacy.data.id as string };
    }
    console.error(
      "[createPracticeCase] legacy insert",
      legacy.error?.code ?? "unknown"
    );
    return { error: userFacingSubmissionInsertError(legacy.error) };
  }

  console.error(
    "[createPracticeCase] insert",
    fullInsert.error?.code ?? "unknown"
  );
  return { error: userFacingSubmissionInsertError(fullInsert.error) };
}

function filterTempPathsForWorkspace(
  workspaceId: string,
  paths: string[]
): string[] {
  const prefix = `${workspaceId}/temp/`;
  const safe: string[] = [];
  for (const p of paths) {
    if (typeof p !== "string" || !p.startsWith(prefix) || p.includes("..")) {
      continue;
    }
    const rest = p.slice(prefix.length);
    if (!rest || rest.includes("/")) continue;
    if (!SAFE_TEMP_OBJECT_KEY.test(rest)) continue;
    safe.push(p);
  }
  return safe;
}

/**
 * Entfernt **temporäre** Objekte in `submission-photos` nach fehlgeschlagener Upload-/Speicher-Kette (z. B. Teil-Upload
 * oder Action-Fehler **vor** erfolgreichem Fall-Insert). Gleiche **Arzt-** und **Workspace-**-Prüfung wie
 * `createPracticeCase`.
 */
export async function deleteTempSubmissionPhotos(
  paths: string[]
): Promise<{ ok: true } | { error: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Workspace nicht gefunden." };
  }
  if (workspace.role !== "doctor") {
    return { error: "Dieser Schritt ist für Ihre Rolle nicht vorgesehen." };
  }
  const safe = filterTempPathsForWorkspace(workspace.workspace_id, paths);
  if (safe.length === 0) {
    return { ok: true };
  }
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.from("submission-photos").remove(safe);
    if (error) {
      console.error("[deleteTempSubmissionPhotos] storage remove failed");
      return { error: "Temporäre Uploads konnten nicht vollständig entfernt werden." };
    }
    return { ok: true };
  } catch (error) {
    console.error("[deleteTempSubmissionPhotos] admin client unavailable", error);
    return { ok: true };
  }
}

export async function createPracticeCase(input: {
  patientName: string;
  patientBirthDate: string | null;
  patientExternalId: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  patientNotes: string | null;
  urgency: PracticeCaseUrgency;
  isDraft: boolean;
  tempStoragePaths: string[];
}): Promise<{
  error?: string;
  submissionId?: string;
  partialAttachments?: boolean;
}> {
  try {
    return await createPracticeCaseInner(input);
  } catch (error) {
    console.error("[createPracticeCase] unexpected failure", error);
    return {
      error:
        "Die Speicherung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut.",
    };
  }
}

async function createPracticeCaseInner(input: {
  patientName: string;
  patientBirthDate: string | null;
  patientExternalId: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  patientNotes: string | null;
  urgency: PracticeCaseUrgency;
  isDraft: boolean;
  tempStoragePaths: string[];
}): Promise<{
  error?: string;
  submissionId?: string;
  partialAttachments?: boolean;
}> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Workspace nicht gefunden." };
  }

  if (workspace.role !== "doctor") {
    return {
      error: "Dieser Schritt ist für Ihre Rolle nicht vorgesehen.",
    };
  }

  const workspaceId = workspace.workspace_id;
  const nameTrim = input.patientName.trim();
  const notesTrim = (input.patientNotes || "").trim() || null;
  const extIdTrim = (input.patientExternalId || "").trim() || null;
  const emailTrim = (input.patientEmail || "").trim() || null;
  const phoneTrim = (input.patientPhone || "").trim() || null;

  if (!input.isDraft && !nameTrim) {
    return { error: "Bitte geben Sie den Namen des Patienten ein." };
  }

  if (!input.isDraft && !emailTrim) {
    return { error: "Bitte geben Sie die E-Mail-Adresse des Patienten ein." };
  }

  if (!input.isDraft && !phoneTrim) {
    return { error: "Bitte geben Sie die Telefonnummer des Patienten ein." };
  }

  if (input.isDraft && !nameTrim && !notesTrim) {
    return {
      error:
        "Bitte mindestens einen Patientennamen oder eine Kurznotiz ausfüllen, um einen Entwurf zu speichern.",
    };
  }

  if (!Array.isArray(input.tempStoragePaths)) {
    return {
      error:
        "Die Speicherung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut.",
    };
  }

  if (input.tempStoragePaths.length > MAX_PHOTOS) {
    return {
      error: "Zu viele Anlagen für einen Speichervorgang.",
    };
  }

  const boundsErr = practiceCaseFieldBoundsError({
    nameTrim,
    notesTrim,
    emailTrim,
    phoneTrim,
    extIdTrim,
  });
  if (boundsErr) {
    return { error: boundsErr };
  }

  if (!isAllowedPracticeCaseUrgency(input.urgency)) {
    return {
      error:
        "Die Speicherung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut.",
    };
  }

  const birth =
    input.patientBirthDate && input.patientBirthDate.trim().length > 0
      ? input.patientBirthDate.trim()
      : null;

  if (birth && !isIsoDateOnly(birth)) {
    return {
      error: "Bitte prüfen Sie das Geburtsdatum oder das Feld leeren.",
    };
  }

  const filteredPaths = filterTempPathsForWorkspace(
    workspaceId,
    input.tempStoragePaths
  );
  if (filteredPaths.length !== input.tempStoragePaths.length) {
    return {
      error:
        "Die ausgewählten Bilder passen nicht zum Speichervorgang. Bitte entfernen Sie die Anlagen und wählen Sie sie erneut, oder laden Sie die Seite neu.",
    };
  }
  const uniqueTempPaths = [...new Set(filteredPaths)];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const insertInput: PracticeSubmissionInsertInput = {
    workspaceId,
    nameTrim,
    notesTrim,
    extIdTrim,
    emailTrim,
    phoneTrim,
    birth,
    urgency: input.urgency,
    isDraft: input.isDraft,
  };

  const admin = tryGetAdminClient();
  let insertedRow: { id: string } | null = null;

  if (admin) {
    const adminInsert = await insertPracticeSubmissionRow(admin, insertInput);
    if ("id" in adminInsert) {
      insertedRow = adminInsert;
    }
  }

  if (!insertedRow) {
    const userInsert = await insertPracticeSubmissionRow(supabase, insertInput);
    if ("id" in userInsert) {
      insertedRow = userInsert;
    } else {
      if (!admin) {
        return {
          error:
            "Die Speicherung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut oder kontaktieren Sie den Support.",
        };
      }
      return { error: userInsert.error };
    }
  }

  const submissionId = insertedRow.id;
  let photosFullyApplied = 0;
  const photoDb = admin ?? supabase;

  if (uniqueTempPaths.length > 0) {
    if (!admin) {
      return {
        error:
          "Die Bilder konnten nicht gespeichert werden. Bitte versuchen Sie es ohne Anlagen erneut oder kontaktieren Sie den Support.",
      };
    }

    for (let i = 0; i < uniqueTempPaths.length; i++) {
      const tempPath = uniqueTempPaths[i];
      const fileName = tempPath.split("/").pop() || `photo-${i}.jpg`;
      const finalPath = `${workspaceId}/${submissionId}/${fileName}`;

      const { error: moveError } = await admin.storage
        .from("submission-photos")
        .move(tempPath, finalPath);

      if (moveError) {
        console.error("[createPracticeCase] storage move failed", { index: i });
        continue;
      }

      const sortOrder = photosFullyApplied;
      const { error: photoErr } = await photoDb.from("submission_photos").insert({
        submission_id: submissionId,
        storage_path: finalPath,
        sort_order: sortOrder,
      });
      if (photoErr) {
        console.error("[createPracticeCase] submission_photos insert failed", {
          index: i,
        });
        continue;
      }
      photosFullyApplied += 1;
    }
  }

  const partialAttachments =
    uniqueTempPaths.length > 0 &&
    photosFullyApplied < uniqueTempPaths.length;

  const { data: profileRow } = await supabase
    .from("profile_data")
    .select("practice_phone, appointment_link")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  await bootstrapSubmissionMessageDraftBestEffort({
    workspaceId,
    submissionId,
    patientName: nameTrim || "Patient",
    patientNotes: notesTrim,
    practicePhone: profileRow?.practice_phone?.trim() ?? "",
    appointmentUrl: profileRow?.appointment_link?.trim() ?? null,
    submissionUrgency: input.urgency,
    photoCount: photosFullyApplied,
  });

  /* Liste in inbox/layout.tsx muss neu geladen werden, nicht nur die Index-Seite */
  safeRevalidateCreateCasePaths(submissionId);

  return {
    submissionId,
    ...(partialAttachments ? { partialAttachments: true as const } : {}),
  };
}
