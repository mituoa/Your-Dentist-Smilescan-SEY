import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  cleanupExpiredPendingRegisterLicenseObjects,
  getRegisterLicenseCleanupMaxDeletes,
  getRegisterLicenseCleanupSecret,
  getRegisterLicensePendingTtlMs,
} from "@/lib/register-license-pending-cleanup";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function bearerMatches(expected: string, authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  if (!token || !expected) return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Geplanter Job / manueller Aufruf: TTL-Cleanup für `registrations/licenses/pending/`.
 * Schutz: `Authorization: Bearer` gleich `REGISTER_LICENSE_PENDING_CLEANUP_SECRET` oder `CRON_SECRET`.
 */
export async function POST(request: NextRequest) {
  const secret = getRegisterLicenseCleanupSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "cleanup_secret_not_configured" }, { status: 503 });
  }

  if (!bearerMatches(secret, request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const stats = await cleanupExpiredPendingRegisterLicenseObjects({
      admin,
      maxAgeMs: getRegisterLicensePendingTtlMs(),
      maxDeletesPerRun: getRegisterLicenseCleanupMaxDeletes(),
    });
    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    console.error("[cleanup-register-license-pending]", e);
    return NextResponse.json({ ok: false, error: "cleanup_failed" }, { status: 500 });
  }
}
