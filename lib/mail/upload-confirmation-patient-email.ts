import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export interface BuildUploadConfirmationEmailInput {
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
    return {
      textLine: "Sehr geehrte/r Einsender/in,",
      htmlInner: "Sehr geehrte/r Einsender/in,",
    };
  }

  return {
    textLine: `Sehr geehrte/r ${combined},`,
    htmlInner: `Sehr geehrte/r ${escapeHtml(combined)},`,
  };
}

export function buildUploadConfirmationEmail(
  input: BuildUploadConfirmationEmailInput
): { subject: string; text: string; html: string } {
  const { practiceName } = input;
  const subject = `Bestätigung Ihrer Einsendung – ${practiceName}`;
  const safePractice = escapeHtml(practiceName);

  const { textLine, htmlInner } = buildPatientGreeting(
    input.patientFirstName,
    input.patientLastName
  );

  const text =
    `${textLine}\n\n` +
    `wir bestätigen den Eingang Ihrer Unterlagen.\n\n` +
    `Ihre Einsendung wurde bei uns registriert. Bei Rückfragen können Sie sich jederzeit direkt an die Praxis wenden.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `${practiceName}`;

  const html =
    `<p>${htmlInner}</p>` +
    `<p>wir bestätigen den Eingang Ihrer Unterlagen.</p>` +
    `<p>Ihre Einsendung wurde bei uns registriert. Bei Rückfragen können Sie sich jederzeit direkt an die Praxis wenden.</p>` +
    `<p>Mit freundlichen Grüßen<br>${safePractice}</p>`;

  return { subject, text, html };
}
