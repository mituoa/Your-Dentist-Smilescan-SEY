import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePhoto } from "@/lib/upload/validation";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspace_id") as string;

    if (!file || !workspaceId) {
      return NextResponse.json(
        { error: "Missing file or workspace_id" },
        { status: 400 }
      );
    }

    const validation = validatePhoto(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const admin = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const tempId = crypto.randomUUID();
    const storagePath = `${workspaceId}/temp/${tempId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from("submission-photos")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[api/upload]", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ storagePath });
  } catch (error) {
    console.error("[api/upload] exception", error);
    return NextResponse.json({ error: "Upload exception" }, { status: 500 });
  }
}
