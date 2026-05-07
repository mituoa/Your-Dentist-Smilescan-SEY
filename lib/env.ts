import "server-only";

export interface SmtpMailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo?: string;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export function requireSmtpMailConfig(): SmtpMailConfig {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP environment variables are not fully configured.");
  }

  return {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
    replyTo: process.env.SMTP_REPLY_TO || undefined,
  };
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getAdminEmailsAllowlist(): string[] {
  const raw = (process.env.ADMIN_EMAILS || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Plattform-Ops: darf geschützte Bereiche nutzen auch wenn der Workspace noch nicht freigeschaltet ist (`ADMIN_EMAILS`). */
export function isAdminAllowlistEmail(email: string | null | undefined): boolean {
  const allow = getAdminEmailsAllowlist();
  if (allow.length === 0) return false;
  const e = (email || "").trim().toLowerCase();
  return Boolean(e && allow.includes(e));
}
