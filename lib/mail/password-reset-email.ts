import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export interface BuildPasswordResetEmailInput {
  resetUrl: string;
  recipientEmail: string;
}

export function buildPasswordResetEmail(
  input: BuildPasswordResetEmailInput
): { subject: string; text: string; html: string } {
  const { resetUrl, recipientEmail } = input;
  const subject = "Passwort zurücksetzen — Your Dentist";

  const text =
    `Guten Tag,\n\n` +
    `Sie haben ein neues Passwort für Ihren Your-Dentist-Praxiszugang angefordert.\n\n` +
    `Öffnen Sie den folgenden Link, um ein neues Passwort festzulegen. Der Link ist nur kurze Zeit gültig:\n` +
    `${resetUrl}\n\n` +
    `Die Anfrage gilt für ${recipientEmail}. Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Your Dentist`;

  const safeUrl = escapeHtml(resetUrl);
  const safeEmail = escapeHtml(recipientEmail);

  const html =
    `<p>Guten Tag,</p>` +
    `<p>Sie haben ein neues Passwort für Ihren <strong>Your Dentist</strong>-Praxiszugang angefordert.</p>` +
    `<p>Der Link ist nur kurze Zeit gültig und gilt für <strong>${safeEmail}</strong>.</p>` +
    `<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">` +
    `<tr>` +
    `<td style="background-color: #2f80ed; border-radius: 10px;">` +
    `<a href="${safeUrl}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 500; font-family: sans-serif;">Neues Passwort festlegen</a>` +
    `</td>` +
    `</tr>` +
    `</table>` +
    `<p style="color: #5F5E5A; font-size: 12px;">Oder öffnen Sie: ${safeUrl}</p>` +
    `<p style="color: #97958C; font-size: 12px;">Falls Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.</p>` +
    `<p>Mit freundlichen Grüßen<br>Your Dentist</p>`;

  return { subject, text, html };
}
