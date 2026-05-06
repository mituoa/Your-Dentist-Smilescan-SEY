import { NextRequest, NextResponse } from "next/server";

import { findAuthUserIdByEmail } from "@/lib/team-invitations/get-invitation-by-token";

function isValidEmail(value: string): boolean {
  const v = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 }
      );
    }

    const userId = await findAuthUserIdByEmail(email);
    return NextResponse.json({ ok: true, available: !userId });
  } catch (e) {
    console.error("[api/auth/check-email]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

