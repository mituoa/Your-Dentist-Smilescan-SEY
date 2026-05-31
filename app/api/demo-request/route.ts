import { NextRequest, NextResponse } from "next/server";

import { deliverDemoRequest, isDemoHoneypotSubmission } from "@/lib/marketing/demo-request-mail";
import { parseDemoRequestBody } from "@/lib/marketing/demo-request";
import { allowSlidingWindowRequest } from "@/lib/rate-limit/memory-sliding-window";
import { getClientIpFromNextRequest } from "@/lib/rate-limit/client-ip";

const RATE_WINDOW_MS = 3_600_000;
const RATE_MAX = 8;

export async function POST(req: NextRequest) {
  try {
    if (
      !allowSlidingWindowRequest(
        `demo-request:${getClientIpFromNextRequest(req)}`,
        RATE_MAX,
        RATE_WINDOW_MS
      )
    ) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = parseDemoRequestBody(body);

    if (!parsed.ok) {
      return NextResponse.json(
        { ok: false, error: "invalid_payload", message: parsed.error },
        { status: 400 }
      );
    }

    if (isDemoHoneypotSubmission(parsed.data)) {
      return NextResponse.json({ ok: true, received: true });
    }

    const delivery = await deliverDemoRequest(parsed.data);

    if (!delivery.ok) {
      return NextResponse.json({ ok: false, error: "delivery_unavailable" }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      received: true,
      delivered: delivery.delivered,
    });
  } catch (e) {
    console.error("[api/demo-request]", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
