import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { isSmtpConfigured, requireSmtpMailConfig } from "@/lib/env";
import { MailSendError, SmtpNotConfiguredError } from "@/lib/mail/mail-errors";

const SMTP_CONNECTION_TIMEOUT_MS = 12_000;
const SMTP_GREETING_TIMEOUT_MS = 12_000;
const SMTP_DNS_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 45_000;
const POOL_MAX_CONNECTIONS = 3;
const POOL_MAX_MESSAGES = 50;
const LOG_ERROR_MESSAGE_MAX_LEN = 160;

let cachedTransporter: Transporter | null = null;

function getOrCreateTransporter(): Transporter {
  if (!isSmtpConfigured()) {
    throw new SmtpNotConfiguredError();
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  const cfg = requireSmtpMailConfig();

  cachedTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: POOL_MAX_CONNECTIONS,
    maxMessages: POOL_MAX_MESSAGES,
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    dnsTimeout: SMTP_DNS_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  });

  return cachedTransporter;
}

export interface SendTransactionalMailInput {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  mailContext?: string;
}

function truncateForLog(value: string | undefined, max: number): string {
  if (!value) return "";
  const t = value.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

type SendMailResult = {
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
};

export async function sendTransactionalMail(
  input: SendTransactionalMailInput
): Promise<SendMailResult> {
  const context = input.mailContext ?? "transactional";

  if (!isSmtpConfigured()) {
    console.error(
      `[mail] send blocked ${JSON.stringify({
        mailContext: context,
        reason: "smtp_not_configured",
      })}`
    );
    throw new SmtpNotConfiguredError();
  }

  const cfg = requireSmtpMailConfig();
  const transporter = getOrCreateTransporter();

  try {
    const info = (await transporter.sendMail({
      from: cfg.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      ...(cfg.replyTo ? { replyTo: cfg.replyTo } : {}),
    })) as SendMailResult;

    console.info(
      `[mail] send ok ${JSON.stringify({
        mailContext: context,
        messageId: info.messageId ?? null,
        acceptedRecipientCount: info.accepted?.length ?? 0,
      })}`
    );

    const rejectedCount = info.rejected?.length ?? 0;
    if (rejectedCount > 0) {
      throw new MailSendError();
    }
    return info;
  } catch (error) {
    if (error instanceof SmtpNotConfiguredError) throw error;
    if (error instanceof MailSendError) throw error;

    console.error(
      `[mail] send failed ${JSON.stringify({
        mailContext: context,
        errorMessage: truncateForLog(
          error instanceof Error ? error.message : String(error),
          LOG_ERROR_MESSAGE_MAX_LEN
        ),
      })}`
    );
    throw new MailSendError();
  }
}
