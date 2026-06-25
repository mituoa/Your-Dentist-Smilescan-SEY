import "server-only";

import { getAdminEmailsAllowlist, isSmtpConfigured } from "@/lib/env";
import { sendTransactionalMail } from "@/lib/mail/send-mail";
import { MailSendError, SmtpNotConfiguredError } from "@/lib/mail/mail-errors";
import type { PracticeSolutionRequestPayload } from "@/lib/practice-solutions/request";
import { isPracticeSolutionHoneypot } from "@/lib/practice-solutions/request";
import { createAdminClient } from "@/lib/supabase/admin";

function getRecipient(): string | null {
  const direct = (process.env.PRACTICE_SOLUTION_REQUEST_TO || process.env.DEMO_REQUEST_TO || "").trim();
  if (direct) return direct;
  const admins = getAdminEmailsAllowlist();
  return admins[0] ?? null;
}

function buildMailText(data: PracticeSolutionRequestPayload): string {
  const lines = [
    "Neue Projektanfrage — Digitale Praxislösungen",
    "",
    `Lösung: ${data.solutionTitle}`,
    `Praxis: ${data.practiceName}`,
    `Ansprechperson: ${data.contactName}`,
    `E-Mail: ${data.email}`,
  ];
  if (data.phone) lines.push(`Telefon: ${data.phone}`);
  if (data.timeline) lines.push(`Zeitrahmen: ${data.timeline}`);
  if (data.budget) lines.push(`Budget: ${data.budget}`);
  if (data.message) {
    lines.push("", "Nachricht:", data.message);
  }
  lines.push("", "— Your Dentist (geschützter Praxisbereich)");
  return lines.join("\n");
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMailHtml(data: PracticeSolutionRequestPayload): string {
  const optional = [
    data.phone
      ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b">Telefon</td><td>${escHtml(data.phone)}</td></tr>`
      : "",
    data.timeline
      ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b">Zeitrahmen</td><td>${escHtml(data.timeline)}</td></tr>`
      : "",
    data.budget
      ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b">Budget</td><td>${escHtml(data.budget)}</td></tr>`
      : "",
    data.message
      ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top">Nachricht</td><td style="white-space:pre-wrap">${escHtml(data.message)}</td></tr>`
      : "",
  ].join("");

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#0f172a;line-height:1.5">
<p style="margin:0 0 16px">Neue Projektanfrage — Digitale Praxislösungen</p>
<table style="border-collapse:collapse;font-size:14px">
<tr><td style="padding:6px 12px 6px 0;color:#64748b">Lösung</td><td>${escHtml(data.solutionTitle)}</td></tr>
<tr><td style="padding:6px 12px 6px 0;color:#64748b">Praxis</td><td>${escHtml(data.practiceName)}</td></tr>
<tr><td style="padding:6px 12px 6px 0;color:#64748b">Ansprechperson</td><td>${escHtml(data.contactName)}</td></tr>
<tr><td style="padding:6px 12px 6px 0;color:#64748b">E-Mail</td><td><a href="mailto:${escHtml(data.email)}">${escHtml(data.email)}</a></td></tr>
${optional}
</table>
</body></html>`;
}

export type DeliverPracticeSolutionResult =
  | { ok: true; delivered: boolean; persisted: boolean }
  | { ok: false; reason: "send_failed" };

export async function persistPracticeSolutionRequest(
  workspaceId: string,
  data: PracticeSolutionRequestPayload
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("platform_practice_solution_requests").insert({
      workspace_id: workspaceId,
      solution_id: data.solutionId,
      solution_title: data.solutionTitle,
      practice_name: data.practiceName,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      status: "received",
    });
    if (error) {
      console.warn("[practice-solution-request] persist failed", (error as { code?: string }).code);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deliverPracticeSolutionRequest(
  data: PracticeSolutionRequestPayload
): Promise<DeliverPracticeSolutionResult> {
  if (isPracticeSolutionHoneypot(data)) {
    return { ok: true, delivered: false, persisted: false };
  }

  const to = getRecipient();
  if (!to || !isSmtpConfigured()) {
    console.warn("[practice-solution-request] mail skipped — no recipient or SMTP");
    return { ok: true, delivered: false, persisted: false };
  }

  try {
    await sendTransactionalMail({
      to,
      subject: `Projektanfrage: ${data.solutionTitle} — ${data.practiceName}`,
      text: buildMailText(data),
      html: buildMailHtml(data),
      mailContext: "practice_solution_request",
    });
    return { ok: true, delivered: true, persisted: false };
  } catch (error) {
    if (error instanceof SmtpNotConfiguredError) {
      return { ok: true, delivered: false, persisted: false };
    }
    if (error instanceof MailSendError) {
      return { ok: false, reason: "send_failed" };
    }
    console.error(
      "[practice-solution-request] unexpected",
      error instanceof Error ? error.message : "unknown"
    );
    return { ok: false, reason: "send_failed" };
  }
}
