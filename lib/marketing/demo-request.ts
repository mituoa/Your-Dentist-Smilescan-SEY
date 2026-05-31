/** Demo-Anfrage — Validierung und nutzerorientierte Fehlertexte. */

export type DemoRequestPayload = {
  name: string;
  practice: string;
  email: string;
  phone: string;
  message: string;
};

export type DemoRequestParseResult =
  | { ok: true; data: DemoRequestPayload }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimField(value: unknown, maxLen: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLen);
}

export function parseDemoRequestBody(body: unknown): DemoRequestParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Bitte füllen Sie das Formular aus." };
  }

  const raw = body as Record<string, unknown>;

  /** Honeypot — Bots füllen oft versteckte Felder; still akzeptieren ohne Versand. */
  const honeypot = trimField(raw.website, 200);
  if (honeypot) {
    return {
      ok: true,
      data: {
        name: "—",
        practice: "—",
        email: "spam-filter@local",
        phone: "",
        message: "",
      },
    };
  }

  const name = trimField(raw.name, 120);
  const practice = trimField(raw.practice, 160);
  const email = trimField(raw.email, 254).toLowerCase();
  const phone = trimField(raw.phone, 40);
  const message = trimField(raw.message, 2000);

  if (name.length < 2) {
    return { ok: false, error: "Bitte geben Sie Ihren Namen an." };
  }
  if (practice.length < 2) {
    return { ok: false, error: "Bitte nennen Sie Ihre Praxis." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
  }

  return { ok: true, data: { name, practice, email, phone, message } };
}

export function userFacingDemoRequestError(code: string | undefined): string {
  switch (code) {
    case "rate_limited":
      return "Zu viele Anfragen in kurzer Zeit. Bitte in ein paar Minuten erneut versuchen.";
    case "invalid_email":
    case "invalid_payload":
      return "Bitte prüfen Sie die markierten Angaben und versuchen Sie es erneut.";
    case "delivery_unavailable":
      return "Die Anfrage kann gerade nicht übermittelt werden. Bitte später erneut versuchen oder uns per Impressum kontaktieren.";
    default:
      return "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.";
  }
}
