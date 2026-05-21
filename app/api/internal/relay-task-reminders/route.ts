import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getAppBaseUrl } from "@/lib/env";
import { buildTaskReminder } from "@/lib/mail/task-notifications";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTaskDisplayTitle } from "@/lib/tasks/title";

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

function getReminderSecret(): string | null {
  return (
    process.env.RELAY_TASK_REMINDERS_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    null
  );
}

/**
 * Sends due task reminders (open tasks with remind_at <= now).
 * Auth: Bearer matching RELAY_TASK_REMINDERS_SECRET or CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = getReminderSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "reminder_secret_not_configured" }, { status: 503 });
  }

  if (!bearerMatches(secret, request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: tasks, error } = await admin
      .from("tasks")
      .select(
        "id, workspace_id, title, content, due_date, remind_self, remind_assignees, created_by, specific_recipient_id, task_assignees(user_id)"
      )
      .eq("status", "open")
      .not("remind_at", "is", null)
      .lte("remind_at", now)
      .is("last_reminded_at", null)
      .limit(50);

    if (error) {
      console.error("[relay-task-reminders]", error.code);
      return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
    }

    let sent = 0;
    const baseUrl = getAppBaseUrl();

    for (const task of tasks || []) {
      const recipientIds = new Set<string>();
      if (task.remind_self) recipientIds.add(task.created_by as string);
      if (task.remind_assignees) {
        if (task.specific_recipient_id) recipientIds.add(task.specific_recipient_id as string);
        for (const a of (task.task_assignees as Array<{ user_id: string }> | null) || []) {
          if (a.user_id) recipientIds.add(a.user_id);
        }
      }

      const taskTitle = resolveTaskDisplayTitle(
        task.title as string | null,
        task.content as string
      );
      const taskUrl = `${baseUrl}/my-tasks/${task.id}`;

      for (const userId of recipientIds) {
        const { data: u } = await admin.auth.admin.getUserById(userId);
        const email = u?.user?.email;
        if (!email) continue;
        const mail = buildTaskReminder({
          taskTitle,
          taskUrl,
          actorName: "Your Dentist",
          recipientEmail: email,
        });
        await sendTransactionalMailBestEffort(
          { to: email, subject: mail.subject, text: mail.text, html: mail.html },
          "task_reminder"
        );
        sent += 1;
      }

      await admin
        .from("tasks")
        .update({ last_reminded_at: now })
        .eq("id", task.id);
    }

    return NextResponse.json({ ok: true, processed: tasks?.length ?? 0, emails_sent: sent });
  } catch (e) {
    console.error("[relay-task-reminders]", e);
    return NextResponse.json({ ok: false, error: "reminders_failed" }, { status: 500 });
  }
}
