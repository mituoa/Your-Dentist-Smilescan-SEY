import { NextRequest, NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/env";
import { allowSlidingWindowRequest } from "@/lib/rate-limit/memory-sliding-window";
import { getClientIpFromNextRequest } from "@/lib/rate-limit/client-ip";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MAX_LICENSE_SIZE_BYTES,
  resolveLicenseMimeForUpload,
  storageExtForValidatedLicense,
  validateLicenseBufferMagic,
  validateLicenseFile,
} from "@/lib/upload/license-validation";

/**
 * Temporäre Berufsnachweise: UUID pro Upload unter `registrations/licenses/pending/` (Bucket `submission-photos`).
 *
 * **Security:** Origin-Check (Prod), MIME + Magic-Bytes, strikte Dateigröße, IP-Ratelimit (best effort pro Instanz).
 * **Lifecycle:** Fehlgeschlagene Flows → `rollbackIncompleteRegistrationAfterFailure` / `removePendingLicenseUploads`;
 * verwaiste Pending-Objekte → `POST /api/internal/cleanup-register-license-pending` (TTL, referenzsicher).
 */
const UPLOAD_RATE_WINDOW_MS = 60_000;
const UPLOAD_RATE_MAX = 6;
/** Form-Overhead oberhalb der Datei (Felder, Boundary). */
const MAX_BODY_BYTES = MAX_LICENSE_SIZE_BYTES + 256 * 1024;

function isAllowedRegisterUploadOrigin(request: NextRequest): boolean {
  const expected = new URL(getAppBaseUrl()).origin;
  const origin = request.headers.get("origin");
  if (origin === expected) return true;
  if (process.env.NODE_ENV !== "production" && !origin) return true;
  return false;
}

export async function OPTIONS(request: NextRequest) {
  const expected = new URL(getAppBaseUrl()).origin;
  const origin = request.headers.get("origin");
  if (origin === expected) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  if (process.env.NODE_ENV !== "production" && !origin) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": expected,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return new NextResponse(null, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedRegisterUploadOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      !allowSlidingWindowRequest(
        `register-license-upload:${getClientIpFromNextRequest(request)}`,
        UPLOAD_RATE_MAX,
        UPLOAD_RATE_WINDOW_MS
      )
    ) {
      return NextResponse.json(
        { error: "Zu viele Upload-Versuche. Bitte später erneut versuchen." },
        { status: 429 }
      );
    }

    const cl = request.headers.get("content-length");
    if (cl) {
      const n = Number.parseInt(cl, 10);
      if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "Die Datei ist zu groß." }, { status: 400 });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const side = (formData.get("side") as string | null)?.trim().toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "Datei fehlt." }, { status: 400 });
    }

    const validation = validateLicenseFile(file);
    if (!validation.valid) {
      const tooBig = file.size > MAX_LICENSE_SIZE_BYTES;
      console.warn("[api/register-license-upload] validation rejected", tooBig ? "size" : "format");
      return NextResponse.json(
        {
          error: tooBig
            ? "Die Datei ist zu groß. Bitte wählen Sie eine Datei unter 10 MB."
            : "Dieses Format wird nicht unterstützt. Bitte JPG, PNG oder PDF verwenden.",
        },
        { status: 400 }
      );
    }

    const mime = resolveLicenseMimeForUpload(file);
    if (!mime) {
      return NextResponse.json({ error: "Format nicht unterstützt." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_LICENSE_SIZE_BYTES) {
      return NextResponse.json({ error: "Die Datei ist zu groß." }, { status: 400 });
    }

    const magic = validateLicenseBufferMagic(buffer, mime);
    if (!magic.valid) {
      console.warn("[api/register-license-upload] magic-bytes mismatch");
      return NextResponse.json({ error: "Die Datei konnte nicht verifiziert werden." }, { status: 400 });
    }

    const contentType = mime || file.type || "application/octet-stream";

    const admin = createAdminClient();
    const ext = storageExtForValidatedLicense(mime);
    const tempId = crypto.randomUUID();
    const suffix = side === "front" || side === "back" ? `-${side}` : "";
    const storagePath = `registrations/licenses/pending/${tempId}${suffix}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("submission-photos")
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error("[api/register-license-upload] storage error");
      return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
    }

    const origin = request.headers.get("origin");
    const res = NextResponse.json({ storagePath });
    if (origin) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Vary", "Origin");
    }
    return res;
  } catch (error) {
    console.error("[api/register-license-upload] exception", error);
    return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}
