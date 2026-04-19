export class SmtpNotConfiguredError extends Error {
  readonly code = "SMTP_NOT_CONFIGURED" as const;

  constructor() {
    super("SMTP ist nicht konfiguriert.");
    this.name = "SmtpNotConfiguredError";
  }
}

export class MailSendError extends Error {
  readonly code = "MAIL_SEND_FAILED" as const;

  constructor() {
    super("Die E-Mail konnte nicht gesendet werden.");
    this.name = "MailSendError";
  }
}
