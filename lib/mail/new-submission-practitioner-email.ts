import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export interface BuildNewSubmissionNoticeInput {
  appBase: string;
  patientDisplayLabel: string;
  submissionTimestamp: Date;
}

export function buildNewSubmissionPractitionerEmail(
  input: BuildNewSubmissionNoticeInput
): { subject: string; text: string; html: string } {
  const { appBase, patientDisplayLabel, submissionTimestamp } = input;
  const inboxUrl = `${appBase}/inbox`;
  const safeUrl = escapeHtml(inboxUrl);
  const safeLabel = escapeHtml(patientDisplayLabel);

  const formattedDate = submissionTimestamp.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `Neue Einsendung – ${patientDisplayLabel}`;

  const text =
    `Guten Tag,\n\n` +
    `eine neue Einsendung ist eingegangen.\n\n` +
    `Einsender: ${patientDisplayLabel}\n` +
    `Eingegangen am: ${formattedDate}\n\n` +
    `Die Einsendung steht in Ihrem Eingang zur Ansicht bereit:\n` +
    `${inboxUrl}\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Your Dentist`;

  const html =
    `<p>Guten Tag,</p>` +
    `<p>eine neue Einsendung ist eingegangen.</p>` +
    `<p><strong>Einsender:</strong> ${safeLabel}<br>` +
    `<strong>Eingegangen am:</strong> ${formattedDate}</p>` +
    `<p>Die Einsendung steht in Ihrem Eingang zur Ansicht bereit:<br>` +
    `<a href="${safeUrl}">${safeUrl}</a></p>` +
    `<p>Mit freundlichen Grüßen<br>Your Dentist</p>`;

  return { subject, text, html };
}
