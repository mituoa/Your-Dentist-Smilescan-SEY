import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";
import { getPracticeSolution } from "@/lib/practice-solutions/catalog";

export type PracticeSolutionRequestPayload = {
  solutionId: PracticeSolutionId;
  solutionTitle: string;
  practiceName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  budget: string;
  timeline: string;
};

export type PracticeSolutionRequestParseResult =
  | { ok: true; data: PracticeSolutionRequestPayload }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimField(value: unknown, maxLen: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLen);
}

export function parsePracticeSolutionRequestBody(
  body: unknown
): PracticeSolutionRequestParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Bitte füllen Sie das Formular aus." };
  }

  const raw = body as Record<string, unknown>;

  const honeypot = trimField(raw.website, 200);
  if (honeypot) {
    return {
      ok: true,
      data: {
        solutionId: "individuell",
        solutionTitle: "—",
        practiceName: "—",
        contactName: "—",
        email: "spam-filter@local",
        phone: "",
        message: "",
        budget: "",
        timeline: "",
      },
    };
  }

  const solutionId = trimField(raw.solutionId, 64) as PracticeSolutionId;
  const solution = getPracticeSolution(solutionId);
  if (!solution) {
    return { ok: false, error: "Bitte wählen Sie eine Lösung aus." };
  }

  const practiceName = trimField(raw.practiceName, 160);
  const contactName = trimField(raw.contactName, 120);
  const email = trimField(raw.email, 254).toLowerCase();
  const phone = trimField(raw.phone, 40);
  const message = trimField(raw.message, 2000);
  const budget = trimField(raw.budget, 120);
  const timeline = trimField(raw.timeline, 120);

  if (practiceName.length < 2) {
    return { ok: false, error: "Bitte nennen Sie Ihre Praxis." };
  }
  if (contactName.length < 2) {
    return { ok: false, error: "Bitte geben Sie eine Ansprechperson an." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
  }

  return {
    ok: true,
    data: {
      solutionId: solution.id,
      solutionTitle: solution.title,
      practiceName,
      contactName,
      email,
      phone,
      message,
      budget,
      timeline,
    },
  };
}

export function userFacingPracticeSolutionRequestError(code: string | undefined): string {
  switch (code) {
    case "rate_limited":
      return "Zu viele Anfragen in kurzer Zeit. Bitte in ein paar Minuten erneut versuchen.";
    case "unauthorized":
      return "Bitte melden Sie sich erneut an.";
    case "invalid_payload":
      return "Bitte prüfen Sie die markierten Angaben und versuchen Sie es erneut.";
    case "delivery_unavailable":
      return "Die Anfrage kann gerade nicht übermittelt werden. Bitte später erneut versuchen.";
    default:
      return "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.";
  }
}

export function isPracticeSolutionHoneypot(data: PracticeSolutionRequestPayload): boolean {
  return data.email === "spam-filter@local";
}
