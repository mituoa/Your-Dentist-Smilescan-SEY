"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/auth-helpers";

export type PracticeCaseUrgency = "not_urgent" | "this_week" | "today" | null;

export async function createPracticeCase(input: {
  patientName: string;
  patientBirthDate: string | null;
  patientExternalId: string | null;
  patientNotes: string | null;
  urgency: PracticeCaseUrgency;
  isDraft: boolean;
  tempStoragePaths: string[];
}): Promise<{ error?: string; submissionId?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { error: "Workspace nicht gefunden." };
  }

  const workspaceId = workspace.workspace_id;
  const nameTrim = input.patientName.trim();
  const notesTrim = (input.patientNotes || "").trim() || null;
  const extIdTrim = (input.patientExternalId || "").trim() || null;

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

  const { data: inserted, error: insertError } = await supabase
    .from("submissions")
    .insert({
      workspace_id: workspaceId,
      patient_name: nameTrim || null,
      patient_email: null,
      patient_phone: null,
      patient_notes: notesTrim,
      patient_birth_date: birth,
      patient_external_id: extIdTrim,
      urgency: input.urgency,
      is_draft: input.isDraft,
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    console.error("[createPracticeCase] insert", insertError);
    const msg = (insertError?.message ?? "").toLowerCase();
    const code = insertError?.code;
    const looksLikeMissingCaseColumns =
      code === "42703" ||
      (msg.includes("column") &&
        (msg.includes("patient_birth_date") ||
          msg.includes("patient_external_id") ||
          msg.includes("urgency") ||
          msg.includes("is_draft")));
    return {
      error: looksLikeMissingCaseColumns
        ? "Die Datenbank-Tabelle „submissions“ hat noch nicht alle Felder für „Neuer Fall“. Bitte Migration 023 auf dieser Datenbank ausführen (Spalten Geburtsdatum, Patienten-ID, Dringlichkeit, Entwurf)."
        : "Fall konnte nicht gespeichert werden.",
    };
  }

  const submissionId = inserted.id as string;
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

  return { submissionId };
}
