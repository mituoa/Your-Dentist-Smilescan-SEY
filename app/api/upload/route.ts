import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  resolveImageMimeForUpload,
  storageExtForValidatedImage,
  validatePhoto,
} from "@/lib/upload/validation";

/**
 * Temporäre Bilder für `submission-photos` (`…/temp/<uuid>.<ext>`).
 *
 * **Öffentlicher Patienten-Upload** (`/doc/.../upload`): Formular sendet **`doc_slug`** — Workspace-ID wird
 * **serverseitig** aus dem Slug aufgelöst (kein freies `workspace_id`-Trust).
 *
 * **Praxis `/create-case`:** eingeloggter **Arzt** — `workspace_id` nur aus {@link getCurrentWorkspace()}; optional
 * `workspace_id` im Formular nur zur **Abweichungsprüfung** gegen die Session.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { error: "Keine Datei übermittelt." },
        { status: 400 }
      );
    }

    const docSlugRaw = formData.get("doc_slug");
    const docSlug =
      typeof docSlugRaw === "string" ? docSlugRaw.trim() : "";

    const membership = await getCurrentWorkspace();

    let workspaceId: string;
    const admin = createAdminClient();

    if (docSlug.length > 0) {
      const { data: ws } = await admin
        .from("workspaces")
        .select("id")
        .eq("slug", docSlug)
        .maybeSingle();

      if (!ws?.id) {
        return NextResponse.json(
          { error: "Arbeitsbereich nicht gefunden." },
          { status: 404 }
        );
      }
      workspaceId = ws.id;

      const clientWorkspaceId = formData.get("workspace_id");
      if (
        typeof clientWorkspaceId === "string" &&
        clientWorkspaceId.length > 0 &&
        clientWorkspaceId !== workspaceId
      ) {
        console.warn("[api/upload] doc_slug vs workspace_id mismatch");
        return NextResponse.json(
          { error: "Einsendekontext stimmt nicht überein." },
          { status: 403 }
        );
      }
    } else if (membership?.role === "doctor") {
      workspaceId = membership.workspace_id;
      const clientWorkspaceId = formData.get("workspace_id");
      if (
        typeof clientWorkspaceId === "string" &&
        clientWorkspaceId.length > 0 &&
        clientWorkspaceId !== workspaceId
      ) {
        console.warn("[api/upload] workspace_id mismatch (session vs. client)");
        return NextResponse.json(
          { error: "Workspace-Kontext stimmt nicht überein." },
          { status: 403 }
        );
      }
    } else if (membership) {
      return NextResponse.json(
        { error: "Dieser Schritt ist für Ihre Rolle nicht vorgesehen." },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { error: "Bitte den Einsendelink der Praxis verwenden." },
        { status: 401 }
      );
    }

    const validation = validatePhoto(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error ?? "Datei nicht zulässig." },
        { status: 400 }
      );
    }

    const mime = resolveImageMimeForUpload(file)!;
    const ext = storageExtForValidatedImage(mime);

    const tempId = crypto.randomUUID();
    const storagePath = `${workspaceId}/temp/${tempId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from("submission-photos")
      .upload(storagePath, buffer, {
        contentType: mime,
        upsert: false,
      });

    if (uploadError) {
      console.error("[api/upload] storage upload failed");
      return NextResponse.json(
        { error: "Upload konnte nicht gespeichert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ storagePath });
  } catch {
    console.error("[api/upload] exception");
    return NextResponse.json(
      { error: "Upload konnte nicht verarbeitet werden." },
      { status: 500 }
    );
  }
}
