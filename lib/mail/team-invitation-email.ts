import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export interface BuildTeamInvitationInput {
  practiceName: string;
  inviterName: string | null;
  acceptUrl: string;
  recipientEmail: string;
}

export function buildTeamInvitationEmail(
  input: BuildTeamInvitationInput
): { subject: string; text: string; html: string } {
  const { practiceName, inviterName, acceptUrl, recipientEmail } = input;

  const subject = `Einladung zu ${practiceName}`;

  const whoInvites = inviterName
    ? `${inviterName} von ${practiceName}`
    : `${practiceName}`;

  const text =
    `Guten Tag,\n\n` +
    `${whoInvites} hat Sie zu einem Team-Account bei SmileScan eingeladen.\n\n` +
    `Die Einladung ist persönlich für diese E-Mail-Adresse (${recipientEmail}) ausgestellt und gilt für 7 Tage.\n\n` +
    `Zum Annehmen der Einladung klicken Sie bitte auf folgenden Link:\n` +
    `${acceptUrl}\n\n` +
    `Falls Sie diese E-Mail unerwartet erhalten haben, können Sie sie ignorieren.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `SmileScan`;

  const safeInviter = escapeHtml(whoInvites);
  const safeEmail = escapeHtml(recipientEmail);
  const safeUrl = escapeHtml(acceptUrl);

  const html =
    `<p>Guten Tag,</p>` +
    `<p>${safeInviter} hat Sie zu einem Team-Account bei SmileScan eingeladen.</p>` +
    `<p>Die Einladung ist persönlich für die E-Mail-Adresse <strong>${safeEmail}</strong> ausgestellt und gilt für 7 Tage.</p>` +
    `<p><a href="${safeUrl}" style="display: inline-block; padding: 14px 28px; background: #1A1A1A; color: #FAFAF8; text-decoration: none; font-weight: 500; border-radius: 2px;">Einladung annehmen</a></p>` +
    `<p style="color: #5F5E5A; font-size: 12px;">Oder öffnen Sie: ${safeUrl}</p>` +
    `<p style="color: #97958C; font-size: 12px;">Falls Sie diese E-Mail unerwartet erhalten haben, können Sie sie ignorieren.</p>` +
    `<p>Mit freundlichen Grüßen<br>SmileScan</p>`;

  return { subject, text, html };
}
