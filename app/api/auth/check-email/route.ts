import { NextRequest, NextResponse } from "next/server";

import { allowSlidingWindowRequest } from "@/lib/rate-limit/memory-sliding-window";
import { getClientIpFromNextRequest } from "@/lib/rate-limit/client-ip";

/**
 * E-Mail-Format (Registrierung Schritt 1) — **Option A: keine Existenz-Enumeration.**
 *
 * Es wird **keine** Auskunft erteilt, ob die Adresse bereits als Auth-User existiert (kein `available`).
 * Die UX prüft nur syntaktisch; die echte Eindeutigkeit ergibt sich beim Absenden über `signUp`
 * (Supabase: „bereits registriert“ → nutzerfreundliche Meldung).
 *
 * Mitigation: strenges Rate-Limit pro IP, generische Client-Meldungen, keine Rohfehler.
 */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 15;

function isValidEmail(value: string): boolean {
  const v = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: NextRequest) {
  try {
    if (!allowSlidingWindowRequest(`check-email:${getClientIpFromNextRequest(req)}`, RATE_MAX, RATE_WINDOW_MS)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = (await req.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    /** Absichtlich neutral — keine User-Existenz preisgeben (Medical-/Enterprise-SaaS-Standard). */
    return NextResponse.json({ ok: true, checked: true });
  } catch (e) {
    console.error("[api/auth/check-email]", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
