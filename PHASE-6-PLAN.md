# PHASE 6 — Inbox + Inbox-Detail

> **Für Cursor Agent:** Das ist der wichtigste Screen des Produkts. Arbeite maximal präzise. Lege alle Dateien gemäß diesem Plan an. E-Mail-Versand ist defensiv: funktioniert wenn SMTP konfiguriert, zeigt sonst klare Meldung.

> **Für den Menschen:** Nach Phase 6 kannst du Einsendungen in einer Liste sehen, reinklicken, Fotos betrachten (Platzhalter in dieser Phase), Tasks anlegen, und Terminlink-E-Mails verschicken (optional, nur wenn SMTP konfiguriert).

---

## Überblick der Dateien

### Neu

| Datei | Zweck |
|---|---|
| `lib/env.ts` | SMTP-Env-Check und Config-Loader |
| `lib/mail/escape-html.ts` | XSS-Schutz für Mail-Inhalte |
| `lib/mail/mail-errors.ts` | Error-Klassen für Mailversand |
| `lib/mail/send-mail.ts` | Nodemailer-Client mit Connection-Pool |
| `lib/mail/send-mail-best-effort.ts` | Versand ohne Exception-Propagation |
| `lib/mail/appointment-link-email.ts` | Template: E-Mail an Patient |
| `lib/mail/appointment-link-notice-email.ts` | Template: Bestätigung an Arzt |
| `lib/queries/submissions.ts` | Alle Supabase-Queries für Submissions |
| `lib/queries/inbox.ts` | Queries spezifisch für Inbox-Liste |
| `components/inbox/submission-list-item.tsx` | Eine Zeile in der Inbox |
| `components/inbox/inbox-search.tsx` | Suchfeld über der Liste |
| `components/inbox/photo-viewer.tsx` | Foto-Ansicht mit Thumbnails |
| `components/inbox/submission-actions.tsx` | Rechte Spalte: Terminlink, Tasks, Meta |
| `components/inbox/task-form.tsx` | Formular für neue Tasks |
| `components/inbox/task-list.tsx` | Liste aller Tasks einer Submission |
| `components/inbox/appointment-link-button.tsx` | Button für E-Mail-Versand |
| `components/inbox/submission-meta.tsx` | Meta-Info rechts unten |
| `app/(protected)/inbox/page.tsx` | UPDATE — echte Inbox-Liste |
| `app/(protected)/inbox/[id]/page.tsx` | Neue Inbox-Detail-Seite |
| `app/(protected)/inbox/[id]/actions.ts` | Server Actions: Task, Mark-Seen, Send-Mail |

### Updates

| Datei | Änderung |
|---|---|
| `.env.example` | SMTP-Variablen hinzufügen (Platzhalter) |
| `package.json` | `nodemailer` Dependency |

---

## Schritt 1 — Nodemailer installieren

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

Verifiziere in `package.json`:
- `dependencies`: `nodemailer`
- `devDependencies`: `@types/nodemailer`

---

## Schritt 2 — Environment-Variablen erweitern

### Datei: `.env.example` (ersetzen)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# SMTP (optional - für Terminlink-E-Mails)
SMTP_HOST=host285.checkdomain.de
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@deinedomain.de
SMTP_PASS=your_smtp_password
SMTP_FROM=SmileScan <noreply@deinedomain.de>
SMTP_REPLY_TO=
```

### Datei: `.env.local`

Mensch trägt SMTP-Credentials manuell ein, **falls vorhanden**. Wenn leer → E-Mail-Feature deaktiviert, Rest funktioniert normal.

**Für den Agent:** Berühre `.env.local` NICHT. Nur `.env.example` aktualisieren.

---

## Schritt 3 — SMTP-Konfigurations-Helper

### Datei: `lib/env.ts`

```typescript
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
```

---

## Schritt 4 — E-Mail-Infrastruktur (übernommen aus altem Repo)

### Datei: `lib/mail/escape-html.ts`

```typescript
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

### Datei: `lib/mail/mail-errors.ts`

```typescript
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
```

### Datei: `lib/mail/send-mail.ts`

```typescript
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
const LOG_RESPONSE_MAX_LEN = 400;
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
): Promise<void> {
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
```

### Datei: `lib/mail/send-mail-best-effort.ts`

```typescript
import "server-only";

import { sendTransactionalMail } from "@/lib/mail/send-mail";
import type { SendTransactionalMailInput } from "@/lib/mail/send-mail";

export async function sendTransactionalMailBestEffort(
  input: SendTransactionalMailInput,
  logContext: string
): Promise<{ sent: boolean; reason?: string }> {
  try {
    await sendTransactionalMail({
      ...input,
      mailContext: input.mailContext ?? logContext,
    });
    return { sent: true };
  } catch (error) {
    console.error(
      `[mail] ${logContext}: Versand fehlgeschlagen`
    );
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}
```

---

## Schritt 5 — E-Mail-Templates

### Datei: `lib/mail/appointment-link-email.ts`

```typescript
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
```

### Datei: `lib/mail/appointment-link-notice-email.ts`

```typescript
import "server-only";

import { escapeHtml } from "@/lib/mail/escape-html";

export function buildAppointmentLinkPractitionerNoticeEmail(input: {
  patientDisplayLabel: string;
}): { subject: string; text: string; html: string } {
  const subject = "Terminlink versendet";
  const label = input.patientDisplayLabel.trim();
  const safeLabel = escapeHtml(label);

  const text =
    `Die Terminlink-E-Mail an ${label} wurde erfolgreich versendet.\n\n` +
    `Diese Mitteilung bestätigt den Versand durch SmileScan, nicht die Zustellung oder Öffnung durch den Empfänger.`;

  const html =
    `<p>Die Terminlink-E-Mail an ${safeLabel} wurde erfolgreich versendet.</p>` +
    `<p>Diese Mitteilung bestätigt den Versand durch SmileScan, nicht die Zustellung oder Öffnung durch den Empfänger.</p>`;

  return { subject, text, html };
}
```

---

## Schritt 6 — Submission-Queries

### Datei: `lib/queries/inbox.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export interface SubmissionListItem {
  id: string;
  patient_name: string | null;
  patient_email: string | null;
  created_at: string;
  seen_at: string | null;
  photo_count: number;
}

export async function getInboxSubmissions(
  workspaceId: string,
  searchQuery?: string
): Promise<SubmissionListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("submissions")
    .select("id, patient_name, patient_email, created_at, seen_at, submission_photos(count)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    query = query.or(
      `patient_name.ilike.%${q}%,patient_email.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[inbox] getInboxSubmissions failed:", error);
    return [];
  }

  return (data || []).map((s: any) => ({
    id: s.id,
    patient_name: s.patient_name,
    patient_email: s.patient_email,
    created_at: s.created_at,
    seen_at: s.seen_at,
    photo_count: s.submission_photos?.[0]?.count || 0,
  }));
}
```

### Datei: `lib/queries/submissions.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export interface SubmissionDetail {
  id: string;
  workspace_id: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  patient_notes: string | null;
  created_at: string;
  seen_at: string | null;
  seen_by: string | null;
  photos: Array<{
    id: string;
    storage_path: string;
    sort_order: number;
  }>;
}

export async function getSubmissionById(
  submissionId: string
): Promise<SubmissionDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(`
      id, workspace_id, patient_name, patient_email, patient_phone, patient_notes,
      created_at, seen_at, seen_by,
      submission_photos (id, storage_path, sort_order)
    `)
    .eq("id", submissionId)
    .single();

  if (error) {
    console.error("[submissions] getSubmissionById failed:", error);
    return null;
  }

  return {
    id: data.id,
    workspace_id: data.workspace_id,
    patient_name: data.patient_name,
    patient_email: data.patient_email,
    patient_phone: data.patient_phone,
    patient_notes: data.patient_notes,
    created_at: data.created_at,
    seen_at: data.seen_at,
    seen_by: data.seen_by,
    photos: (data.submission_photos || []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    ),
  };
}

export interface TaskItem {
  id: string;
  content: string;
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  specific_recipient_id: string | null;
  created_by: string;
  created_at: string;
  done_at: string | null;
  done_by: string | null;
}

export async function getTasksForSubmission(
  submissionId: string
): Promise<TaskItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[submissions] getTasksForSubmission failed:", error);
    return [];
  }

  return (data || []) as TaskItem[];
}

export async function getProfileData(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_data")
    .select("display_name, practice_name, appointment_link")
    .eq("workspace_id", workspaceId)
    .single();
  return data;
}
```

---

## Schritt 7 — Server Actions für Inbox-Detail

### Datei: `app/(protected)/inbox/[id]/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildAppointmentLinkEmail } from "@/lib/mail/appointment-link-email";
import { buildAppointmentLinkPractitionerNoticeEmail } from "@/lib/mail/appointment-link-notice-email";
import { isSmtpConfigured } from "@/lib/env";
import { getCurrentWorkspace } from "@/lib/auth-helpers";

export async function markSubmissionSeen(submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("submissions")
    .update({
      seen_at: new Date().toISOString(),
      seen_by: user.id,
    })
    .eq("id", submissionId)
    .is("seen_at", null);

  if (error) {
    console.error("[markSubmissionSeen]", error);
    return { error: error.message };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/inbox");
  return { success: true };
}

export async function createTask(formData: FormData) {
  const submissionId = formData.get("submission_id") as string;
  const content = formData.get("content") as string;
  const recipientType = formData.get("recipient_type") as
    | "doctor_only"
    | "all_team";

  if (!submissionId || !content?.trim()) {
    return { error: "Bitte Aufgabentext eingeben." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Kein Workspace" };

  const { error } = await supabase.from("tasks").insert({
    workspace_id: workspace.workspace_id,
    submission_id: submissionId,
    content: content.trim(),
    recipient_type: recipientType,
    created_by: user.id,
  });

  if (error) {
    console.error("[createTask]", error);
    return { error: error.message };
  }

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTaskDone(taskId: string, submissionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  const { data: task } = await supabase
    .from("tasks")
    .select("done_at")
    .eq("id", taskId)
    .single();

  if (!task) return { error: "Task nicht gefunden" };

  const newValue = task.done_at
    ? { done_at: null, done_by: null }
    : { done_at: new Date().toISOString(), done_by: user.id };

  const { error } = await supabase
    .from("tasks")
    .update(newValue)
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function sendAppointmentLink(submissionId: string) {
  if (!isSmtpConfigured()) {
    return {
      error:
        "E-Mail-Versand ist nicht konfiguriert. Bitte SMTP-Zugangsdaten in .env.local eintragen.",
      code: "SMTP_NOT_CONFIGURED",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nicht angemeldet" };

  // Submission und Profile laden
  const { data: submission } = await supabase
    .from("submissions")
    .select("patient_name, patient_email, workspace_id")
    .eq("id", submissionId)
    .single();

  if (!submission || !submission.patient_email) {
    return { error: "Patient hat keine E-Mail-Adresse." };
  }

  const { data: profile } = await supabase
    .from("profile_data")
    .select("practice_name, appointment_link")
    .eq("workspace_id", submission.workspace_id)
    .single();

  if (!profile?.appointment_link) {
    return {
      error:
        "Kein Terminlink hinterlegt. Bitte in Supabase appointment_link setzen (siehe Anleitung).",
    };
  }

  const practiceName = profile.practice_name || "Ihre Zahnarztpraxis";

  // Patient-Namen auftrennen
  const fullName = submission.patient_name?.trim() || "";
  const parts = fullName.split(/\s+/);
  const patientFirstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : fullName || null;
  const patientLastName = parts.length > 1 ? parts[parts.length - 1] : null;

  const mail = buildAppointmentLinkEmail({
    bookingUrl: profile.appointment_link,
    practiceName,
    patientFirstName,
    patientLastName,
  });

  const result = await sendTransactionalMailBestEffort(
    {
      to: submission.patient_email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      mailContext: "appointment_link_to_patient",
    },
    "appointment_link_to_patient"
  );

  if (!result.sent) {
    return {
      error: "E-Mail konnte nicht versendet werden. Details im Server-Log.",
    };
  }

  // Bestätigung an Arzt (best-effort, Fehler ignorieren)
  if (user.email) {
    const notice = buildAppointmentLinkPractitionerNoticeEmail({
      patientDisplayLabel: fullName || submission.patient_email,
    });
    await sendTransactionalMailBestEffort(
      {
        to: user.email,
        subject: notice.subject,
        text: notice.text,
        html: notice.html,
      },
      "appointment_link_notice_to_practitioner"
    );
  }

  revalidatePath(`/inbox/${submissionId}`);
  return { success: true, message: "Terminlink-E-Mail versendet." };
}
```

---

## Schritt 8 — Inbox-Liste

### Datei: `components/inbox/submission-list-item.tsx`

```typescript
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubmissionListItemProps {
  id: string;
  patientName: string | null;
  patientEmail: string | null;
  createdAt: string;
  seenAt: string | null;
  photoCount: number;
}

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function formatTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function SubmissionListItem({
  id,
  patientName,
  patientEmail,
  createdAt,
  seenAt,
  photoCount,
}: SubmissionListItemProps) {
  const isUnseen = !seenAt;
  const initials = getInitials(patientName, patientEmail);
  const displayName = patientName?.trim() || patientEmail || "Unbekannt";

  return (
    <Link
      href={`/inbox/${id}`}
      className="flex items-center gap-4 px-6 py-4 border-b border-border hover:bg-surface-sunken/50 transition-colors group"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isUnseen ? "bg-brand text-white" : "bg-surface-sunken text-text-secondary"
        )}
      >
        <span className="text-xs font-medium">{initials}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-sm truncate",
              isUnseen
                ? "font-medium text-text-primary"
                : "text-text-secondary"
            )}
          >
            {displayName}
          </span>
          {isUnseen && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">
          {photoCount} {photoCount === 1 ? "Foto" : "Fotos"}
        </p>
      </div>

      <div className="text-xs text-text-tertiary shrink-0">
        {formatTime(createdAt)}
      </div>
    </Link>
  );
}
```

### Datei: `components/inbox/inbox-search.tsx`

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

export function InboxSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`/inbox?${params.toString()}`);
    });
  };

  return (
    <div className="relative mb-6">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
        strokeWidth={1.75}
      />
      <input
        type="search"
        defaultValue={currentQuery}
        onChange={handleChange}
        placeholder="Suchen…"
        className="w-full h-10 pl-10 pr-4 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
      />
    </div>
  );
}
```

### Datei: `app/(protected)/inbox/page.tsx` (komplett ersetzen)

```typescript
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { SubmissionListItem } from "@/components/inbox/submission-list-item";
import { InboxSearch } from "@/components/inbox/inbox-search";

interface InboxPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const workspace = await getCurrentWorkspace();
  const params = await searchParams;

  if (!workspace) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const submissions = await getInboxSubmissions(
    workspace.workspace_id,
    params.q
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Inbox
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary">
          Einsendungen
        </h1>
      </div>

      <InboxSearch />

      {submissions.length === 0 ? (
        <div className="bg-surface-card border border-border rounded-lg p-12 text-center">
          <p className="text-text-secondary">
            {params.q
              ? "Keine Einsendungen gefunden."
              : "Noch keine Einsendungen."}
          </p>
        </div>
      ) : (
        <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
          {submissions.map((s) => (
            <SubmissionListItem
              key={s.id}
              id={s.id}
              patientName={s.patient_name}
              patientEmail={s.patient_email}
              createdAt={s.created_at}
              seenAt={s.seen_at}
              photoCount={s.photo_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Schritt 9 — Inbox-Detail (die zentrale Seite)

### Datei: `components/inbox/photo-viewer.tsx`

```typescript
"use client";

import { useState } from "react";
import { ImageIcon, Download } from "lucide-react";

interface Photo {
  id: string;
  storage_path: string;
  sort_order: number;
}

interface PhotoViewerProps {
  photos: Photo[];
  patientName: string;
}

export function PhotoViewer({ photos, patientName }: PhotoViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // PHASE 6: Placeholder-Bilder. Echte Photos kommen in Phase 7 mit Storage-Integration
  if (photos.length === 0) {
    return (
      <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
        <div className="aspect-[4/3] bg-surface-sunken flex flex-col items-center justify-center gap-3">
          <ImageIcon
            className="w-16 h-16 text-text-tertiary/40"
            strokeWidth={1}
          />
          <p className="text-sm text-text-tertiary">
            Keine Fotos vorhanden
          </p>
          <p className="text-xs text-text-tertiary/70 max-w-xs text-center px-6">
            Fotos werden in Phase 7 aus Supabase Storage geladen, sobald der
            Upload-Flow implementiert ist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
        <div className="aspect-[4/3] bg-surface-sunken flex items-center justify-center relative">
          <ImageIcon
            className="w-24 h-24 text-text-tertiary/40"
            strokeWidth={1}
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-surface-page/90 backdrop-blur rounded px-3 py-2">
            <span className="text-xs font-mono text-text-secondary">
              Foto {selectedIndex + 1} von {photos.length}
            </span>
            <button
              type="button"
              disabled
              className="text-xs text-text-tertiary flex items-center gap-1.5"
              title="Download verfügbar ab Phase 7"
            >
              <Download className="w-3 h-3" strokeWidth={1.75} />
              Download
            </button>
          </div>
        </div>
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square bg-surface-sunken rounded border-2 transition-colors flex items-center justify-center ${
                i === selectedIndex
                  ? "border-brand"
                  : "border-transparent hover:border-border"
              }`}
            >
              <ImageIcon
                className="w-6 h-6 text-text-tertiary/50"
                strokeWidth={1}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Datei: `components/inbox/task-form.tsx`

```typescript
"use client";

import { useState, useTransition, useRef } from "react";
import { createTask } from "@/app/(protected)/inbox/[id]/actions";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  submissionId: string;
}

export function TaskForm({ submissionId }: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input type="hidden" name="submission_id" value={submissionId} />

      <textarea
        name="content"
        placeholder="Neue Aufgabe hinzufügen…"
        required
        rows={2}
        className="w-full px-3 py-2 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
      />

      <div className="flex items-center gap-2">
        <select
          name="recipient_type"
          defaultValue="doctor_only"
          className="flex-1 h-9 px-3 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="doctor_only">Nur für den Arzt</option>
          <option value="all_team">Alle Team-Mitglieder</option>
        </select>

        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Speichern…" : "Hinzufügen"}
        </Button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
```

### Datei: `components/inbox/task-list.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { toggleTaskDone } from "@/app/(protected)/inbox/[id]/actions";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  content: string;
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  done_at: string | null;
}

interface TaskListProps {
  tasks: Task[];
  canCheckOff: boolean;
  submissionId: string;
}

const RECIPIENT_LABEL = {
  doctor_only: "Arzt",
  all_team: "Team",
  specific_person: "Person",
};

export function TaskList({ tasks, canCheckOff, submissionId }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>(
    {}
  );

  const handleToggle = (taskId: string, currentDone: boolean) => {
    if (!canCheckOff) return;
    const newDone = !currentDone;
    setOptimisticDone((prev) => ({ ...prev, [taskId]: newDone }));
    startTransition(async () => {
      const result = await toggleTaskDone(taskId, submissionId);
      if (result.error) {
        setOptimisticDone((prev) => ({ ...prev, [taskId]: currentDone }));
      }
    });
  };

  if (tasks.length === 0) {
    return (
      <p className="text-xs text-text-tertiary italic">
        Noch keine Aufgaben.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const isDone =
          optimisticDone[task.id] !== undefined
            ? optimisticDone[task.id]
            : !!task.done_at;

        return (
          <li key={task.id} className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => handleToggle(task.id, isDone)}
              disabled={!canCheckOff || isPending}
              className={cn(
                "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                canCheckOff
                  ? "border-border hover:border-brand cursor-pointer"
                  : "border-border/50 cursor-not-allowed"
              )}
            >
              {isDone && (
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-brand">
                  <path
                    d="M1 5L4 8L9 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm leading-snug",
                  isDone ? "line-through text-text-tertiary" : "text-text-primary"
                )}
              >
                {task.content}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                → {RECIPIENT_LABEL[task.recipient_type]}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
```

### Datei: `components/inbox/appointment-link-button.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { sendAppointmentLink } from "@/app/(protected)/inbox/[id]/actions";
import { Button } from "@/components/ui/button";
import { Send, Check, AlertCircle } from "lucide-react";

interface AppointmentLinkButtonProps {
  submissionId: string;
  hasPatientEmail: boolean;
}

export function AppointmentLinkButton({
  submissionId,
  hasPatientEmail,
}: AppointmentLinkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleClick = () => {
    setResult(null);
    startTransition(async () => {
      const res = await sendAppointmentLink(submissionId);
      if (res.error) {
        setResult({ type: "error", message: res.error });
      } else {
        setResult({
          type: "success",
          message: res.message || "E-Mail versendet.",
        });
      }
    });
  };

  if (!hasPatientEmail) {
    return (
      <div className="p-3 bg-surface-sunken rounded text-xs text-text-tertiary">
        Keine E-Mail-Adresse des Patienten hinterlegt.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isPending}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" strokeWidth={1.75} />
        {isPending ? "Wird gesendet…" : "Terminlink senden"}
      </Button>

      {result && (
        <div
          className={`flex items-start gap-2 p-2.5 rounded text-xs ${
            result.type === "success"
              ? "bg-brand/10 text-brand"
              : "bg-danger/10 text-danger"
          }`}
        >
          {result.type === "success" ? (
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
          )}
          <span className="leading-snug">{result.message}</span>
        </div>
      )}
    </div>
  );
}
```

### Datei: `components/inbox/submission-meta.tsx`

```typescript
interface SubmissionMetaProps {
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
}

export function SubmissionMeta({
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
}: SubmissionMetaProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-2 text-sm">
      <div>
        <div className="text-xs text-text-tertiary">Eingereicht</div>
        <div className="text-text-primary">{formattedDate}</div>
      </div>
      {patientName && (
        <div>
          <div className="text-xs text-text-tertiary">Name</div>
          <div className="text-text-primary">{patientName}</div>
        </div>
      )}
      {patientEmail && (
        <div>
          <div className="text-xs text-text-tertiary">E-Mail</div>
          <div className="text-text-primary break-all">{patientEmail}</div>
        </div>
      )}
      {patientPhone && (
        <div>
          <div className="text-xs text-text-tertiary">Telefon</div>
          <div className="text-text-primary">{patientPhone}</div>
        </div>
      )}
    </div>
  );
}
```

### Datei: `components/inbox/submission-actions.tsx`

```typescript
import { AppointmentLinkButton } from "./appointment-link-button";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";
import { SubmissionMeta } from "./submission-meta";
import type { TaskItem } from "@/lib/queries/submissions";

interface SubmissionActionsProps {
  submissionId: string;
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
  tasks: TaskItem[];
  canCheckOff: boolean;
}

export function SubmissionActions({
  submissionId,
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
  tasks,
  canCheckOff,
}: SubmissionActionsProps) {
  return (
    <div className="space-y-6">
      {/* Block 1: Terminlink */}
      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Aktion
        </h3>
        <AppointmentLinkButton
          submissionId={submissionId}
          hasPatientEmail={!!patientEmail}
        />
      </section>

      {/* Block 2: Tasks */}
      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Aufgaben
        </h3>
        <div className="space-y-4">
          <TaskForm submissionId={submissionId} />
          <div className="pt-3 border-t border-border">
            <TaskList
              tasks={tasks}
              canCheckOff={canCheckOff}
              submissionId={submissionId}
            />
          </div>
        </div>
      </section>

      {/* Block 3: Meta */}
      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Details
        </h3>
        <SubmissionMeta
          patientName={patientName}
          patientEmail={patientEmail}
          patientPhone={patientPhone}
          createdAt={createdAt}
        />
      </section>
    </div>
  );
}
```

### Datei: `app/(protected)/inbox/[id]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  getSubmissionById,
  getTasksForSubmission,
} from "@/lib/queries/submissions";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionActions } from "@/components/inbox/submission-actions";
import { markSubmissionSeen } from "./actions";

interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InboxDetailPage({
  params,
}: InboxDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const submission = await getSubmissionById(id);

  if (!submission || submission.workspace_id !== workspace.workspace_id) {
    notFound();
  }

  const tasks = await getTasksForSubmission(id);

  // Mark as seen (non-blocking)
  if (!submission.seen_at) {
    markSubmissionSeen(id).catch(() => {});
  }

  const isDoctor = workspace.role === "doctor";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        Zurück zur Inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Seite — 2/3 */}
        <div className="lg:col-span-2">
          <PhotoViewer
            photos={submission.photos}
            patientName={submission.patient_name || "Patient"}
          />
        </div>

        {/* Rechte Seite — 1/3 */}
        <div>
          <SubmissionActions
            submissionId={submission.id}
            patientName={submission.patient_name}
            patientEmail={submission.patient_email}
            patientPhone={submission.patient_phone}
            createdAt={submission.created_at}
            tasks={tasks}
            canCheckOff={isDoctor}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Schritt 10 — Commit

```bash
git add .
git commit -m "feat: phase 6 — inbox list and detail with tasks and appointment link"
```

---

## Schritt 11 — STOP und Übergabe

Melde dem Menschen:

"Phase 6 — Inbox + Detail ist im Code. Du musst noch zwei Dinge manuell tun:

**1. Appointment Link in Supabase setzen** (damit E-Mail-Versand testbar ist):

Im Supabase SQL Editor:

```sql
UPDATE profile_data
SET appointment_link = 'https://calendly.com/dein-link'
WHERE workspace_id = (
  SELECT workspace_id FROM workspace_members 
  WHERE role = 'doctor' 
  LIMIT 1
);
```

Ersetze die URL mit deinem echten Kalender-Link.

**2. (Optional) SMTP-Credentials in `.env.local` eintragen**, falls du E-Mail-Versand testen willst:

```
SMTP_HOST=host285.checkdomain.de
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=deine@email.de
SMTP_PASS=dein_passwort
SMTP_FROM=SmileScan <deine@email.de>
```

Wenn SMTP-Werte fehlen: Das Inbox-Detail funktioniert normal, der Terminlink-Button zeigt eine klare Meldung 'E-Mail-Versand ist nicht konfiguriert'.

**3. Teste im Browser:**
- http://localhost:3000/inbox → Liste mit 3 Einsendungen (Anna M., Jakob K., Marie L.)
- Klick auf einen Eintrag → Detail-Seite mit Platzhalter-Foto-Viewer links, Aktionen rechts
- Task hinzufügen → erscheint unten in der Task-Liste
- Checkbox klicken → Task wird durchgestrichen
- Terminlink senden → bei fehlendem SMTP: klare Meldung; bei vorhandenem SMTP: E-Mail wird verschickt

**4. Zurück in Inbox:**
- Gesehene Submissions haben keinen blauen Punkt mehr
- Suche funktioniert (tippe 'Anna' oder 'jakob')"

---

## Bei Fehlern

### "Module 'nodemailer' not found"
`npm install nodemailer @types/nodemailer` im smilescan_ Ordner.

### "Cannot find module '@/lib/mail/..."
Eine Mail-Datei wurde nicht erstellt. Prüfe in Cursor ob alle Dateien aus Schritt 4-5 existieren.

### Checkbox klickt, nichts passiert
Server-Action crasht vermutlich an RLS. Öffne Browser-Console (F12 → Console), Fehler dort ansehen.

### Terminlink-Button zeigt "Kein Terminlink hinterlegt"
Die appointment_link Update-SQL wurde noch nicht ausgeführt. Siehe Schritt 11 Punkt 1.

### Inbox-Liste leer obwohl Daten da sind
RLS-Problem oder falscher Workspace. In Supabase SQL Editor prüfen:
```sql
SELECT id, patient_name, workspace_id FROM submissions;
```

---

*Ende Phase 6*
