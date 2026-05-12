"use server";

/**
 * Server Actions für `/create-case` — **Punkt 1 (Zweck)** s. `create-case/page.tsx`: Praxis-Fallerstellung, keine
 * CRM-/Ticket-Semantik. **`createPracticeCase`:** nur mit **Arztrolle** und gültigem Workspace; Upload-Pfade strikt
 * `workspaceId/temp/…`.
 */

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/auth-helpers";

export type PracticeCaseUrgency = "not_urgent" | "this_week" | "today" | null;

const URGENCY_LABEL_DE: Record<NonNullable<PracticeCaseUrgency>, string> = {
  not_urgent: "Nicht dringend",
  this_week: "Diese Woche",
  today: "Heute",
};

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
}): Promise<{ error?: string; submissionId?: string }> {
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

  if (input.isDraft && !nameTrim && !notesTrim) {
    return { error: "Bitte mindestens Namen oder Anliegen ausfüllen, um einen Entwurf zu speichern." };
  }

  for (const p of input.tempStoragePaths) {
    if (typeof p !== "string" || !p.startsWith(`${workspaceId}/temp/`)) {
      return { error: "Ungültige Upload-Pfade." };
    }
  }

  const birth =
    input.patientBirthDate && input.patientBirthDate.trim().length > 0
      ? input.patientBirthDate.trim()
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  let insertedRow: { id: string } | null = null;

  const fullInsert = await supabase
    .from("submissions")
    .insert({
      workspace_id: workspaceId,
      patient_name: nameTrim || null,
      patient_email: emailTrim,
      patient_phone: phoneTrim,
      patient_notes: notesTrim,
      patient_birth_date: birth,
      patient_external_id: extIdTrim,
      urgency: input.urgency,
      is_draft: input.isDraft,
    })
    .select("id")
    .single();

  if (fullInsert.error || !fullInsert.data?.id) {
    console.error("[createPracticeCase] insert", fullInsert.error);
    if (
      fullInsert.error &&
      looksLikeMissingCaseColumnsError(fullInsert.error)
    ) {
      console.warn(
        "[createPracticeCase] DB ohne Migration-023-Felder — Fallback mit strukturierten Notizen. Migration 023 ausführen, um Felder nativ zu speichern."
      );
      const legacyNotes = mergeCaseFieldsIntoNotes(notesTrim, {
        birth,
        externalId: extIdTrim,
        email: emailTrim,
        phone: phoneTrim,
        urgency: input.urgency,
        isDraft: input.isDraft,
      });
      const legacy = await supabase
        .from("submissions")
        .insert({
          workspace_id: workspaceId,
          patient_name: nameTrim || null,
          patient_email: emailTrim,
          patient_phone: phoneTrim,
          patient_notes: legacyNotes,
        })
        .select("id")
        .single();
      if (legacy.error || !legacy.data?.id) {
        console.error("[createPracticeCase] legacy insert", legacy.error);
        return { error: "Fall konnte momentan nicht erstellt werden." };
      }
      insertedRow = { id: legacy.data.id as string };
    } else {
      return { error: "Fall konnte momentan nicht erstellt werden." };
    }
  } else {
    insertedRow = { id: fullInsert.data.id as string };
  }

  const submissionId = insertedRow.id;
  const admin = createAdminClient();
  const finalPaths: string[] = [];

  for (let i = 0; i < input.tempStoragePaths.length; i++) {
    const tempPath = input.tempStoragePaths[i];
    const fileName = tempPath.split("/").pop() || `photo-${i}.jpg`;
    const finalPath = `${workspaceId}/${submissionId}/${fileName}`;

    const { error: moveError } = await admin.storage
      .from("submission-photos")
      .move(tempPath, finalPath);

    if (moveError) {
      console.error(`[createPracticeCase] move failed ${tempPath}`, moveError);
      continue;
    }

    const sortOrder = finalPaths.length;
    finalPaths.push(finalPath);

    const { error: photoErr } = await admin.from("submission_photos").insert({
      submission_id: submissionId,
      storage_path: finalPath,
      sort_order: sortOrder,
    });
    if (photoErr) {
      console.error("[createPracticeCase] submission_photos insert", photoErr);
    }
  }

  /* Liste in inbox/layout.tsx muss neu geladen werden, nicht nur die Index-Seite */
  revalidatePath("/inbox", "layout");
  revalidatePath("/inbox", "page");
  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/relay");
  revalidatePath("/create-case");

  return { submissionId };
}
