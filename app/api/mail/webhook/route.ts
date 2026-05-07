import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type MailWebhookPayload = {
  event?: string;
  type?: string;
  messageId?: string;
  message_id?: string;
  recipient?: string;
  email?: string;
  timestamp?: string | number;
};

function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.MAIL_WEBHOOK_SIGNING_SECRET;
  if (!secret) return false;
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return safeEqual(expected, signature);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-mail-signature") ??
    request.headers.get("x-webhook-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: MailWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MailWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventName = (payload.event || payload.type || "").toLowerCase();
  const messageId = payload.messageId || payload.message_id || "";
  const recipient = payload.recipient || payload.email || "";
  const eventTimestamp =
    typeof payload.timestamp === "number"
      ? new Date(payload.timestamp * 1000).toISOString()
      : typeof payload.timestamp === "string"
        ? new Date(payload.timestamp).toISOString()
        : new Date().toISOString();

  if (!messageId) {
    return NextResponse.json({ ok: true, ignored: "missing_message_id" });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  const { data: matches, error: lookupError } = await admin
    .from("task_delivery_receipts")
    .select("task_id, recipient_user_id, recipient_email, delivered_at")
    .eq("email_message_id", messageId);
  if (lookupError) {
    console.error("[mail-webhook lookup]", lookupError);
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }

  const scopedMatches = recipient
    ? (matches || []).filter((row) => !row.recipient_email || row.recipient_email === recipient)
    : matches || [];
  if (scopedMatches.length === 0) {
    return NextResponse.json({ ok: true, ignored: "unknown_message_id" });
  }

  if (eventName === "delivered") {
    for (const row of scopedMatches) {
      const updatePayload: Record<string, string> = {
        last_event: "delivered",
        last_event_at: eventTimestamp,
      };
      if (!row.delivered_at) {
        updatePayload.delivered_at = eventTimestamp;
      }
      const { error } = await admin
        .from("task_delivery_receipts")
        .update(updatePayload)
        .eq("task_id", row.task_id)
        .eq("recipient_user_id", row.recipient_user_id);
      if (error) {
        console.error("[mail-webhook delivered]", error);
      }
    }
  } else if (eventName === "bounce" || eventName === "deferred") {
    for (const row of scopedMatches) {
      await admin
        .from("task_delivery_receipts")
        .update({
          last_event: eventName,
          last_event_at: eventTimestamp,
        })
        .eq("task_id", row.task_id)
        .eq("recipient_user_id", row.recipient_user_id);
    }
  }

  return NextResponse.json({ ok: true });
}
