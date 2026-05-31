import "server-only";

import { getAdminEmailsAllowlist, isSmtpConfigured } from "@/lib/env";
import { sendTransactionalMail } from "@/lib/mail/send-mail";
import { MailSendError, SmtpNotConfiguredError } from "@/lib/mail/mail-errors";
import type { DemoRequestPayload } from "@/lib/marketing/demo-request";

export function getDemoRequestRecipient(): string | null {
  const direct = (process.env.DEMO_REQUEST_TO || "").trim();
  if (direct) return direct;
  const admins = getAdminEmailsAllowlist();
  return admins[0] ?? null;
}

function buildDemoMailText(data: DemoRequestPayload): string {
  const lines = [
    "Neue Demo-Anfrage über die Website",
    "",
    `Name: ${data.name}`,
    `Praxis: ${data.practice}`,
    `E-Mail: ${data.email}`,
  ];
  if (data.phone) lines.push(`Telefon: ${data.phone}`);
  if (data.message) {
    lines.push("", "Nachricht:", data.message);
  }
  lines.push("", "— Your Dentist (öffentliches Formular)");
  return lines.join("\n");
}

function buildDemoMailHtml(data: DemoRequestPayload): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const optionalRows = [
    data.phone
      ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top">Telefon</td><td style="padding:6px 0">${esc(data.phone)}</td></tr>`
      : "",
    data.message
      ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top">Nachricht</td><td style="padding:6px 0;white-space:pre-wrap">${esc(data.message)}</td></tr>`
      : "",
  ].join("");

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#0f172a;line-height:1.5">
<p style="margin:0 0 16px">Neue Demo-Anfrage über die Website</p>
<table style="border-collapse:collapse;font-size:14px">
<tr><td style="padding:6px 12px 6px 0;color:#64748b">Name</td><td style="padding:6px 0">${esc(data.name)}</td></tr>
<tr><td style="padding:6px 12px 6px 0;color:#64748b">Praxis</td><td style="padding:6px 0">${esc(data.practice)}</td></tr>
<tr><td style="padding:6px 12px 6px 0;color:#64748b">E-Mail</td><td style="padding:6px 0"><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td></tr>
${optionalRows}
</table>
<p style="margin:16px 0 0;font-size:12px;color:#94a3b8">Your Dentist — öffentliches Formular</p>
</body></html>`;
}

export type DeliverDemoRequestResult =
  | { ok: true; delivered: true }
  | { ok: true; delivered: false; reason: "no_recipient" | "smtp_not_configured" }
  | { ok: false; reason: "send_failed" };

/** Spam-Honeypot: kein Versand, aber als Erfolg behandeln. */
export function isDemoHoneypotSubmission(data: DemoRequestPayload): boolean {
  return data.email === "spam-filter@local";
}

export async function deliverDemoRequest(
  data: DemoRequestPayload
): Promise<DeliverDemoRequestResult> {
  if (isDemoHoneypotSubmission(data)) {
    return { ok: true, delivered: false, reason: "smtp_not_configured" };
  }

  const to = getDemoRequestRecipient();
  if (!to) {
    console.warn("[demo-request] no DEMO_REQUEST_TO or ADMIN_EMAILS — request logged only", {
      practice: data.practice,
      emailDomain: data.email.split("@")[1] ?? "unknown",
    });
    return { ok: true, delivered: false, reason: "no_recipient" };
  }

  if (!isSmtpConfigured()) {
    console.warn("[demo-request] SMTP not configured — request logged only", {
      practice: data.practice,
      toConfigured: Boolean(to),
    });
    return { ok: true, delivered: false, reason: "smtp_not_configured" };
  }

  try {
    await sendTransactionalMail({
      to,
      subject: `Demo-Anfrage: ${data.practice}`,
      text: buildDemoMailText(data),
      html: buildDemoMailHtml(data),
      mailContext: "demo_request",
    });
    return { ok: true, delivered: true };
  } catch (error) {
    if (error instanceof SmtpNotConfiguredError) {
      return { ok: true, delivered: false, reason: "smtp_not_configured" };
    }
    if (error instanceof MailSendError) {
      return { ok: false, reason: "send_failed" };
    }
    console.error("[demo-request] unexpected", error instanceof Error ? error.message : "unknown");
    return { ok: false, reason: "send_failed" };
  }
}
