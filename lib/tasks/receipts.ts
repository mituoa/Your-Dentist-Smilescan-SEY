import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type TaskDeliveryAggregate = "none" | "sent" | "delivered" | "read" | "mixed";

export interface TaskReceiptSummary {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  aggregate: TaskDeliveryAggregate;
}

export function summarizeTaskReceipts(
  receipts: Array<{ sent_at?: string | null; delivered_at?: string | null; read_at?: string | null }>
): TaskReceiptSummary {
  if (receipts.length === 0) {
    return { total: 0, sent: 0, delivered: 0, read: 0, aggregate: "none" };
  }
  let sent = 0;
  let delivered = 0;
  let read = 0;
  for (const receipt of receipts) {
    if (receipt.sent_at) sent += 1;
    if (receipt.delivered_at) delivered += 1;
    if (receipt.read_at) read += 1;
  }

  let aggregate: TaskDeliveryAggregate = "mixed";
  if (read === receipts.length) aggregate = "read";
  else if (delivered === receipts.length) aggregate = "delivered";
  else if (sent === receipts.length) aggregate = "sent";
  else if (sent === 0 && delivered === 0 && read === 0) aggregate = "none";

  return { total: receipts.length, sent, delivered, read, aggregate };
}

export async function upsertTaskReceipts(
  taskId: string,
  recipients: Array<{ userId: string; email?: string | null; messageId?: string | null }>
): Promise<void> {
  if (recipients.length === 0) return;
  const now = new Date().toISOString();
  const rows = recipients.map((recipient) => ({
    task_id: taskId,
    recipient_user_id: recipient.userId,
    recipient_email: recipient.email ?? null,
    email_message_id: recipient.messageId ?? null,
    sent_at: now,
    last_event: "sent",
    last_event_at: now,
  }));

  const admin = createAdminClient();
  const { error } = await admin
    .from("task_delivery_receipts")
    .upsert(rows, { onConflict: "task_id,recipient_user_id" });
  if (error) {
    console.error("[upsertTaskReceipts]", error);
  }
}

export async function markTaskAsRead(taskId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: existing, error: readError } = await supabase
    .from("task_delivery_receipts")
    .select("read_at")
    .eq("task_id", taskId)
    .eq("recipient_user_id", userId)
    .maybeSingle();
  if (readError) return;
  if (!existing || existing.read_at) return;

  await supabase
    .from("task_delivery_receipts")
    .update({ read_at: now, last_event: "read", last_event_at: now })
    .eq("task_id", taskId)
    .eq("recipient_user_id", userId)
    .is("read_at", null);
}
