export type OutboundMessageKind =
  | "reply"
  | "question"
  | "photo_request"
  | "appointment_offer";

export type OutboundMessageStatus = "draft" | "sent" | "failed";

export type OutboundMessageRow = {
  id: string;
  workspace_id: string;
  submission_id: string;
  patient_email: string;
  subject: string;
  body: string;
  message_kind: OutboundMessageKind;
  status: OutboundMessageStatus;
  sent_at: string | null;
  sent_by: string | null;
  error_message: string | null;
  provider_message_id: string | null;
  created_at: string;
  updated_at: string;
};

export function canRoleSendOutboundKind(
  role: "doctor" | "team",
  kind: OutboundMessageKind
): boolean {
  if (kind === "reply" || kind === "appointment_offer") {
    return role === "doctor";
  }
  return true;
}

export const NO_PATIENT_EMAIL_ERROR =
  "Für diesen Patienten ist keine E-Mail-Adresse hinterlegt.";

export const SMTP_NOT_CONFIGURED_ERROR =
  "E-Mail-Versand ist derzeit nicht eingerichtet. Bitte kontaktieren Sie den Admin.";

export type OutboundSentFlags = {
  reply: boolean;
  question: boolean;
  photo_request: boolean;
  appointment_offer: boolean;
};

export const EMPTY_OUTBOUND_SENT: OutboundSentFlags = {
  reply: false,
  question: false,
  photo_request: false,
  appointment_offer: false,
};
