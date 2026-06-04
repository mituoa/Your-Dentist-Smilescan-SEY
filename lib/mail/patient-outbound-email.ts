import "server-only";

import type { OutboundMessageKind } from "@/lib/outbound-messages/types";
import { escapeHtml } from "@/lib/mail/escape-html";

function buildPatientGreeting(patientName: string | null): {
  textLine: string;
  htmlInner: string;
} {
  const name = patientName?.trim() ?? "";
  if (!name) {
    return { textLine: "Guten Tag,", htmlInner: "Guten Tag," };
  }
  return {
    textLine: `Sehr geehrte/r ${name},`,
    htmlInner: `Sehr geehrte/r ${escapeHtml(name)},`,
  };
}

export function defaultSubjectForOutboundKind(
  kind: OutboundMessageKind,
  practiceName: string
): string {
  const p = practiceName.trim() || "Ihre Zahnarztpraxis";
  switch (kind) {
    case "question":
      return `Rückfrage zu Ihrer Einsendung – ${p}`;
    case "photo_request":
      return `Bitte senden Sie eine Aufnahme – ${p}`;
    case "appointment_offer":
      return `Terminvorschlag – ${p}`;
    case "reply":
      return `Antwort Ihrer Praxis – ${p}`;
    default:
      return `Nachricht von ${p}`;
  }
}

export function buildPatientOutboundEmail(input: {
  kind: OutboundMessageKind;
  practiceName: string;
  patientName: string | null;
  body: string;
  appointmentUrl?: string | null;
}): { subject: string; text: string; html: string } {
  const subject = defaultSubjectForOutboundKind(input.kind, input.practiceName);
  const { textLine, htmlInner } = buildPatientGreeting(input.patientName);
  const practice = input.practiceName.trim() || "Ihre Zahnarztpraxis";
  const safePractice = escapeHtml(practice);

  let bodyText = input.body.trim();
  let bodyHtml = escapeHtml(bodyText).replace(/\n/g, "<br>");

  const link = input.appointmentUrl?.trim();
  if (link && input.kind === "appointment_offer") {
    const linkBlock =
      `\n\nOnline-Termin: ${link}\n\n` +
      "Falls der Link nicht funktioniert, wenden Sie sich bitte direkt an die Praxis.";
    bodyText += linkBlock;
    bodyHtml +=
      `<p>Online-Termin: <a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>` +
      "<p>Falls der Link nicht funktioniert, wenden Sie sich bitte direkt an die Praxis.</p>";
  }

  const text =
    `${textLine}\n\n${bodyText}\n\n` +
    `Mit freundlichen Grüßen\n${practice}`;

  const html =
    `<p>${htmlInner}</p>` +
    `<div>${bodyHtml}</div>` +
    `<p>Mit freundlichen Grüßen<br>${safePractice}</p>`;

  return { subject, text, html };
}
