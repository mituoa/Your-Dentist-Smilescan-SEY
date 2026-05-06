import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveLicenseMimeForUpload, validateLicenseFile } from "@/lib/upload/license-validation";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const side = (formData.get("side") as string | null)?.trim().toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const validation = validateLicenseFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const contentType =
      resolveLicenseMimeForUpload(file) || file.type || "application/octet-stream";

    const admin = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const tempId = crypto.randomUUID();
    const suffix = side === "front" || side === "back" ? `-${side}` : "";
    const storagePath = `registrations/licenses/${tempId}${suffix}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("submission-photos")
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error("[api/register-license-upload]", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ storagePath });
  } catch (error) {
    console.error("[api/register-license-upload] exception", error);
    return NextResponse.json({ error: "Upload exception" }, { status: 500 });
  }
}

