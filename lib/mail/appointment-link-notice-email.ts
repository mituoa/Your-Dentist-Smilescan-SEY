import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export function buildAppointmentLinkPractitionerNoticeEmail(input: {
  patientDisplayLabel: string;
}): { subject: string; text: string; html: string } {
  const subject = "Terminlink versendet";
  const label = input.patientDisplayLabel.trim();
  const safeLabel = escapeHtml(label);

  const text =
    `Die Terminlink-E-Mail an ${label} wurde erfolgreich versendet.\n\n` +
    `Diese Mitteilung bestätigt den technischen Abschluss des Versands über Your Dentist; sie belegt nicht die Zustellung oder Öffnung durch den Empfänger.`;

  const html =
    `<p>Die Terminlink-E-Mail an ${safeLabel} wurde erfolgreich versendet.</p>` +
    `<p>Diese Mitteilung bestätigt den technischen Abschluss des Versands über Your Dentist; sie belegt nicht die Zustellung oder Öffnung durch den Empfänger.</p>`;

  return { subject, text, html };
}
