import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export interface BuildAppointmentLinkEmailInput {
  bookingUrl: string;
  practiceName: string;
  patientFirstName: string | null;
  patientLastName: string | null;
}

function buildPatientGreeting(
  firstName: string | null,
  lastName: string | null
): { textLine: string; htmlInner: string } {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  const combined = `${first} ${last}`.trim();

  if (!combined) {
    return { textLine: "Guten Tag,", htmlInner: "Guten Tag," };
  }

  return {
    textLine: `Sehr geehrte/r ${combined},`,
    htmlInner: `Sehr geehrte/r ${escapeHtml(combined)},`,
  };
}

export function buildAppointmentLinkEmail(
  input: BuildAppointmentLinkEmailInput
): { subject: string; text: string; html: string } {
  const { bookingUrl, practiceName } = input;
  const subject = `Einladung zur Terminvereinbarung – ${practiceName}`;
  const safeUrl = escapeHtml(bookingUrl);
  const safePractice = escapeHtml(practiceName);

  const { textLine, htmlInner } = buildPatientGreeting(
    input.patientFirstName,
    input.patientLastName
  );

  const text =
    `${textLine}\n\n` +
    `${practiceName} lädt Sie ein, einen Termin zu vereinbaren.\n\n` +
    `Über den folgenden Link können Sie einen passenden Termin auswählen:\n\n` +
    `${bookingUrl}\n\n` +
    `Falls der Link nicht funktioniert, wenden Sie sich bitte direkt an die Praxis.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `${practiceName}`;

  const html =
    `<p>${htmlInner}</p>` +
    `<p>${safePractice} lädt Sie ein, einen Termin zu vereinbaren.</p>` +
    `<p>Über den folgenden Link können Sie einen passenden Termin auswählen:</p>` +
    `<p><a href="${safeUrl}">${safeUrl}</a></p>` +
    `<p>Falls der Link nicht funktioniert, wenden Sie sich bitte direkt an die Praxis.</p>` +
    `<p>Mit freundlichen Grüßen<br>${safePractice}</p>`;

  return { subject, text, html };
}
