# PHASE 7 — Public Profile + Upload-Flow

> **Für Cursor Agent:** Das ist der einzige Teil, den Patienten sehen. Präzision ist kritisch. Storage-Policies müssen exakt stimmen, sonst bricht der ganze Flow. E-Mails sind optional (defensiv), aber Fotos-Upload ist Kern-Funktion und muss robust sein.

> **Für den Menschen:** Nach dieser Phase hast du eine öffentliche Seite `/doc/berk-baysal` und Upload-Seite `/doc/berk-baysal/upload`. Ein Patient kann ohne Login Fotos hochladen, du siehst sie in deiner Inbox.

---

## Überblick der Dateien

### Neu

| Datei | Zweck |
|---|---|
| `lib/slug.ts` | Slug-Generator aus Doctor-Name |
| `supabase/migrations/009_public_access.sql` | Öffentliche SELECT-Policies + INSERT-Policies für Upload |
| `supabase/migrations/010_storage_policies.sql` | Storage-Bucket-Policies für submission-photos |
| `supabase/migrations/011_backfill_slugs.sql` | Vorhandene Workspaces bekommen neuen Slug aus display_name |
| `lib/queries/public-profile.ts` | Queries für öffentliche Profil-Seite |
| `lib/mail/upload-confirmation-patient-email.ts` | Template Patient-Mail |
| `lib/mail/new-submission-practitioner-email.ts` | Template Arzt-Mail |
| `lib/upload/validation.ts` | Foto-Validierung (Typ, Größe, Anzahl) |
| `app/doc/[slug]/page.tsx` | Öffentliche Profil-Seite (Hero, Vita, etc.) |
| `app/doc/[slug]/layout.tsx` | Eigenes Layout für public pages (kein Auth) |
| `app/doc/[slug]/upload/page.tsx` | Upload-Seite |
| `app/doc/[slug]/upload/actions.ts` | Server Action: Submission + Photos + Mails |
| `app/doc/[slug]/upload/success/page.tsx` | Danke-Seite nach Upload |
| `components/public/profile-hero.tsx` | Hero-Sektion mit Foto + Name + Titel |
| `components/public/profile-vita.tsx` | Vita-Sektion |
| `components/public/profile-services.tsx` | Dienstleistungs-Liste |
| `components/public/profile-workspace.tsx` | Praxis-Info |
| `components/public/profile-journal-previews.tsx` | 3 letzte Journal-Artikel (falls vorhanden) |
| `components/public/profile-cta.tsx` | "Jetzt einsenden"-Button |
| `components/public/upload-form.tsx` | Das eigentliche Upload-Formular |
| `components/public/photo-dropzone.tsx` | Drag-and-Drop für Fotos |

### Updates

| Datei | Änderung |
|---|---|
| `app/(protected)/profile/page.tsx` | Zeigt öffentlichen Link als Preview |

---

## Schritt 1 — Slug-Generator

### Datei: `lib/slug.ts`

```typescript
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Umlaute
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    // Andere Sonderzeichen entfernen
    .replace(/[^a-z0-9\s-]/g, "")
    // Leerzeichen zu Bindestrichen
    .replace(/\s+/g, "-")
    // Mehrfache Bindestriche zu einem
    .replace(/-+/g, "-")
    // Bindestriche am Anfang/Ende entfernen
    .replace(/^-+|-+$/g, "");
}
```

---

## Schritt 2 — SQL-Migration: Öffentliche Policies + Backfill-Slugs

### Datei: `supabase/migrations/009_public_access.sql`

```sql
-- ============================================================================
-- 009_public_access.sql
-- Erlaubt öffentliches Lesen von workspaces + profile_data (ohne Login)
-- Erlaubt öffentliches Erstellen von Submissions (anonym, für Upload-Flow)
-- ============================================================================

-- Workspaces: JEDER kann sie lesen (für /doc/[slug])
CREATE POLICY "public can read workspaces by slug"
  ON workspaces FOR SELECT
  USING (true);

-- profile_data: public-Policy existiert schon aus Migration 004
-- (keine Änderung nötig)

-- Submissions: JEDER kann inserts machen (für public Upload)
-- WICHTIG: nur INSERT, kein SELECT/UPDATE/DELETE öffentlich
CREATE POLICY "public can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- submission_photos: JEDER kann inserts machen
CREATE POLICY "public can create submission photos"
  ON submission_photos FOR INSERT
  WITH CHECK (true);
```

### Datei: `supabase/migrations/010_storage_policies.sql`

```sql
-- ============================================================================
-- 010_storage_policies.sql
-- Storage-Policies für submission-photos Bucket
-- WICHTIG: Diese laufen nicht per SQL wenn der Bucket über Dashboard gemacht wurde.
-- Muss händisch im Dashboard angelegt werden (siehe Anleitung am Ende).
-- Dieses Skript ist nur Doku.
-- ============================================================================

-- Policy 1: öffentliches Hochladen (public INSERT)
-- WURDE IM DASHBOARD ANGELEGT — siehe Phase-6 Dokumentation

-- Policy 2: nur authentifizierte Members lesen Fotos ihres Workspaces
-- (storage.objects hat keine direkten workspace_id Spalte, deswegen über Foldern-Struktur)

-- Hinweis: In dieser Phase müssen die Storage-Policies manuell im Supabase-Dashboard 
-- gesetzt werden (siehe STEP 11 unten).
```

### Datei: `supabase/migrations/011_backfill_slugs.sql`

```sql
-- ============================================================================
-- 011_backfill_slugs.sql
-- Vorhandene Workspaces bekommen ihre Slugs aus profile_data.display_name neu
-- Sonst wäre dein Workspace-Slug noch "baysal-b" (aus Email generiert in Phase 2)
-- ============================================================================

DO $$
DECLARE
  ws RECORD;
  new_slug text;
  suffix int := 0;
  candidate text;
BEGIN
  FOR ws IN 
    SELECT w.id, w.slug, pd.display_name
    FROM workspaces w
    LEFT JOIN profile_data pd ON pd.workspace_id = w.id
  LOOP
    IF ws.display_name IS NOT NULL AND trim(ws.display_name) != '' THEN
      -- Basis-Slug aus Display-Name
      new_slug := lower(trim(ws.display_name));
      new_slug := replace(new_slug, 'ä', 'ae');
      new_slug := replace(new_slug, 'ö', 'oe');
      new_slug := replace(new_slug, 'ü', 'ue');
      new_slug := replace(new_slug, 'ß', 'ss');
      new_slug := regexp_replace(new_slug, '[^a-z0-9\s-]', '', 'g');
      new_slug := regexp_replace(new_slug, '\s+', '-', 'g');
      new_slug := regexp_replace(new_slug, '-+', '-', 'g');
      new_slug := regexp_replace(new_slug, '^-+|-+$', '', 'g');
      
      -- Uniqueness
      candidate := new_slug;
      suffix := 0;
      WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = candidate AND id != ws.id) LOOP
        suffix := suffix + 1;
        candidate := new_slug || '-' || suffix;
      END LOOP;
      
      UPDATE workspaces SET slug = candidate WHERE id = ws.id;
    END IF;
  END LOOP;
END $$;
```

---

## Schritt 3 — E-Mail-Templates

### Datei: `lib/mail/upload-confirmation-patient-email.ts`

```typescript
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
      htmlInner: "Sehr geehrte/r Einsender/in," 
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
```

### Datei: `lib/mail/new-submission-practitioner-email.ts`

```typescript
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
    `SmileScan`;

  const html =
    `<p>Guten Tag,</p>` +
    `<p>eine neue Einsendung ist eingegangen.</p>` +
    `<p><strong>Einsender:</strong> ${safeLabel}<br>` +
    `<strong>Eingegangen am:</strong> ${formattedDate}</p>` +
    `<p>Die Einsendung steht in Ihrem Eingang zur Ansicht bereit:<br>` +
    `<a href="${safeUrl}">${safeUrl}</a></p>` +
    `<p>Mit freundlichen Grüßen<br>SmileScan</p>`;

  return { subject, text, html };
}
```

---

## Schritt 4 — Foto-Validierung

### Datei: `lib/upload/validation.ts`

```typescript
export const MAX_PHOTOS = 10;
export const MAX_PHOTO_SIZE_MB = 10;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePhoto(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Format "${file.type}" nicht unterstützt. Erlaubt: JPG, PNG, HEIC, WEBP.`,
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Foto zu groß (${Math.round(file.size / 1024 / 1024)} MB). Maximum: ${MAX_PHOTO_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

export function validatePhotoCollection(files: File[]): ValidationResult {
  if (files.length === 0) {
    return { valid: false, error: "Mindestens ein Foto erforderlich." };
  }

  if (files.length > MAX_PHOTOS) {
    return {
      valid: false,
      error: `Maximal ${MAX_PHOTOS} Fotos erlaubt (${files.length} eingereicht).`,
    };
  }

  for (const file of files) {
    const result = validatePhoto(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}
```

---

## Schritt 5 — Queries für öffentliche Profil-Seite

### Datei: `lib/queries/public-profile.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicProfile {
  workspace_id: string;
  workspace_name: string;
  slug: string;
  display_name: string | null;
  title: string | null;
  photo_url: string | null;
  vita_markdown: string | null;
  services: string[];
  practice_name: string | null;
  practice_address: string | null;
  practice_employment_status: string | null;
  practice_phone: string | null;
  practice_email: string | null;
  practice_website: string | null;
}

export async function getPublicProfileBySlug(
  slug: string
): Promise<PublicProfile | null> {
  const admin = createAdminClient();

  const { data: workspace, error: wsError } = await admin
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (wsError || !workspace) {
    return null;
  }

  const { data: profile } = await admin
    .from("profile_data")
    .select("*")
    .eq("workspace_id", workspace.id)
    .single();

  if (!profile) {
    return {
      workspace_id: workspace.id,
      workspace_name: workspace.name,
      slug: workspace.slug,
      display_name: null,
      title: null,
      photo_url: null,
      vita_markdown: null,
      services: [],
      practice_name: null,
      practice_address: null,
      practice_employment_status: null,
      practice_phone: null,
      practice_email: null,
      practice_website: null,
    };
  }

  return {
    workspace_id: workspace.id,
    workspace_name: workspace.name,
    slug: workspace.slug,
    display_name: profile.display_name,
    title: profile.title,
    photo_url: profile.photo_url,
    vita_markdown: profile.vita_markdown,
    services: Array.isArray(profile.services) ? profile.services : [],
    practice_name: profile.practice_name,
    practice_address: profile.practice_address,
    practice_employment_status: profile.practice_employment_status,
    practice_phone: profile.practice_phone,
    practice_email: profile.practice_email,
    practice_website: profile.practice_website,
  };
}

export async function getRecentJournalEntries(workspaceId: string, limit = 3) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("journal_entries")
    .select("id, title, slug, published_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  return data || [];
}
```

---

## Schritt 6 — Public Layout + Profil-Seite

### Datei: `app/doc/[slug]/layout.tsx`

```typescript
export default function PublicDoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-page">
      {children}
    </div>
  );
}
```

### Datei: `components/public/profile-hero.tsx`

```typescript
import { User } from "lucide-react";

interface ProfileHeroProps {
  displayName: string | null;
  title: string | null;
  photoUrl: string | null;
  practiceName: string | null;
}

export function ProfileHero({
  displayName,
  title,
  photoUrl,
  practiceName,
}: ProfileHeroProps) {
  return (
    <section className="pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={displayName || "Arzt"}
              className="w-32 h-32 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-surface-card border border-border flex items-center justify-center">
              <User
                className="w-12 h-12 text-text-tertiary"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-text-primary mb-3">
          {displayName || "Zahnarztpraxis"}
        </h1>
        {title && (
          <p className="text-lg text-text-secondary mb-2">{title}</p>
        )}
        {practiceName && (
          <p className="text-sm text-text-tertiary">{practiceName}</p>
        )}
      </div>
    </section>
  );
}
```

### Datei: `components/public/profile-vita.tsx`

```typescript
interface ProfileVitaProps {
  vitaMarkdown: string | null;
}

export function ProfileVita({ vitaMarkdown }: ProfileVitaProps) {
  if (!vitaMarkdown?.trim()) return null;

  // Simple paragraph splitting — no full markdown parser
  const paragraphs = vitaMarkdown.split(/\n\n+/).filter(p => p.trim());

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Über mich
        </h2>
        <div className="space-y-4 text-text-secondary leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Datei: `components/public/profile-services.tsx`

```typescript
import { Check } from "lucide-react";

interface ProfileServicesProps {
  services: string[];
}

export function ProfileServices({ services }: ProfileServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Dienstleistungen
        </h2>
        <ul className="space-y-3">
          {services.map((service, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check
                className="w-4 h-4 text-brand shrink-0 mt-1"
                strokeWidth={2}
              />
              <span className="text-text-primary">{service}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

### Datei: `components/public/profile-workspace.tsx`

```typescript
interface ProfileWorkspaceProps {
  practiceName: string | null;
  practiceAddress: string | null;
  practiceEmploymentStatus: string | null;
  practicePhone: string | null;
  practiceEmail: string | null;
  practiceWebsite: string | null;
}

export function ProfileWorkspace(props: ProfileWorkspaceProps) {
  const hasAny =
    props.practiceName ||
    props.practiceAddress ||
    props.practicePhone ||
    props.practiceEmail ||
    props.practiceWebsite;

  if (!hasAny) return null;

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Praxis
        </h2>
        <div className="space-y-3 text-text-primary">
          {props.practiceName && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Name
              </div>
              <div>{props.practiceName}</div>
            </div>
          )}
          {props.practiceAddress && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Adresse
              </div>
              <div className="whitespace-pre-line">{props.practiceAddress}</div>
            </div>
          )}
          {props.practicePhone && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Telefon
              </div>
              <a
                href={`tel:${props.practicePhone}`}
                className="hover:text-brand transition-colors"
              >
                {props.practicePhone}
              </a>
            </div>
          )}
          {props.practiceEmail && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                E-Mail
              </div>
              <a
                href={`mailto:${props.practiceEmail}`}
                className="hover:text-brand transition-colors"
              >
                {props.practiceEmail}
              </a>
            </div>
          )}
          {props.practiceWebsite && (
            <div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-0.5">
                Website
              </div>
              <a
                href={props.practiceWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                {props.practiceWebsite}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

### Datei: `components/public/profile-journal-previews.tsx`

```typescript
import Link from "next/link";

interface JournalEntry {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
}

interface ProfileJournalPreviewsProps {
  entries: JournalEntry[];
  profileSlug: string;
}

export function ProfileJournalPreviews({
  entries,
  profileSlug,
}: ProfileJournalPreviewsProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-light text-text-primary mb-6">
          Journal
        </h2>
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/journal/${entry.slug}`}
                className="block hover:text-brand transition-colors"
              >
                <h3 className="text-lg text-text-primary">{entry.title}</h3>
                {entry.published_at && (
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(entry.published_at).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

### Datei: `components/public/profile-cta.tsx`

```typescript
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProfileCTAProps {
  slug: string;
}

export function ProfileCTA({ slug }: ProfileCTAProps) {
  return (
    <section className="py-20 px-6 border-t border-border bg-surface-card">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-light text-text-primary mb-4">
          Unterlagen einreichen
        </h2>
        <p className="text-text-secondary mb-8">
          Senden Sie Ihre Fotos direkt und diskret an die Praxis.
        </p>
        <Link
          href={`/doc/${slug}/upload`}
          className="inline-flex items-center gap-2 h-12 px-8 bg-brand text-white rounded hover:bg-brand-glow transition-colors font-medium"
        >
          Jetzt einsenden
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
```

### Datei: `app/doc/[slug]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import {
  getPublicProfileBySlug,
  getRecentJournalEntries,
} from "@/lib/queries/public-profile";
import { ProfileHero } from "@/components/public/profile-hero";
import { ProfileVita } from "@/components/public/profile-vita";
import { ProfileServices } from "@/components/public/profile-services";
import { ProfileWorkspace } from "@/components/public/profile-workspace";
import { ProfileJournalPreviews } from "@/components/public/profile-journal-previews";
import { ProfileCTA } from "@/components/public/profile-cta";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const journalEntries = await getRecentJournalEntries(profile.workspace_id);

  return (
    <>
      <ProfileHero
        displayName={profile.display_name}
        title={profile.title}
        photoUrl={profile.photo_url}
        practiceName={profile.practice_name}
      />

      <ProfileVita vitaMarkdown={profile.vita_markdown} />

      <ProfileServices services={profile.services} />

      <ProfileWorkspace
        practiceName={profile.practice_name}
        practiceAddress={profile.practice_address}
        practiceEmploymentStatus={profile.practice_employment_status}
        practicePhone={profile.practice_phone}
        practiceEmail={profile.practice_email}
        practiceWebsite={profile.practice_website}
      />

      <ProfileJournalPreviews
        entries={journalEntries}
        profileSlug={profile.slug}
      />

      <ProfileCTA slug={profile.slug} />
    </>
  );
}
```

---

## Schritt 7 — Upload-Seite

### Datei: `components/public/photo-dropzone.tsx`

```typescript
"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { MAX_PHOTOS, MAX_PHOTO_SIZE_MB, validatePhoto } from "@/lib/upload/validation";

interface PhotoDropzoneProps {
  onFilesChange: (files: File[]) => void;
}

interface FilePreview {
  file: File;
  preview: string;
}

export function PhotoDropzone({ onFilesChange }: PhotoDropzoneProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const combined = [...previews.map((p) => p.file), ...newFiles];

    if (combined.length > MAX_PHOTOS) {
      setError(`Maximal ${MAX_PHOTOS} Fotos erlaubt.`);
      return;
    }

    for (const file of newFiles) {
      const result = validatePhoto(file);
      if (!result.valid) {
        setError(result.error || "Ungültige Datei.");
        return;
      }
    }

    setError(null);

    const newPreviews = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onFilesChange(updated.map((p) => p.file));
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index].preview);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesChange(updated.map((p) => p.file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand/50 hover:bg-surface-sunken/30 transition-colors"
      >
        <Upload
          className="w-8 h-8 text-text-tertiary mx-auto mb-3"
          strokeWidth={1.5}
        />
        <p className="text-sm text-text-primary font-medium mb-1">
          Fotos hochladen
        </p>
        <p className="text-xs text-text-tertiary">
          Klicken oder per Drag & Drop — bis zu {MAX_PHOTOS} Fotos, max.{" "}
          {MAX_PHOTO_SIZE_MB} MB pro Foto
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-danger mt-2">{error}</p>
      )}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div
              key={i}
              className="relative aspect-square bg-surface-sunken rounded overflow-hidden group"
            >
              <img
                src={p.preview}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Foto entfernen"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="text-xs text-text-tertiary mt-2">
          {previews.length} / {MAX_PHOTOS} Fotos ausgewählt
        </p>
      )}
    </div>
  );
}
```

### Datei: `components/public/upload-form.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitUpload } from "@/app/doc/[slug]/upload/actions";
import { PhotoDropzone } from "./photo-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadFormProps {
  slug: string;
  practiceName: string;
}

export function UploadForm({ slug, practiceName }: UploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Mindestens ein Foto erforderlich.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("slug", slug);

    // Files anhängen
    files.forEach((file, i) => {
      formData.append(`photo_${i}`, file);
    });
    formData.set("photo_count", String(files.length));

    startTransition(async () => {
      const result = await submitUpload(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/doc/${slug}/upload/success`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="patient_name">Name *</Label>
        <Input
          id="patient_name"
          name="patient_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Vor- und Nachname"
        />
      </div>

      <div>
        <Label htmlFor="patient_email">E-Mail *</Label>
        <Input
          id="patient_email"
          name="patient_email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@beispiel.de"
        />
      </div>

      <div>
        <Label htmlFor="patient_phone">Telefon (optional)</Label>
        <Input
          id="patient_phone"
          name="patient_phone"
          type="tel"
          autoComplete="tel"
          placeholder="+49 123 456789"
        />
      </div>

      <div>
        <Label htmlFor="patient_notes">Anliegen (optional)</Label>
        <textarea
          id="patient_notes"
          name="patient_notes"
          rows={4}
          placeholder="Was möchten Sie uns mitteilen?"
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
        />
      </div>

      <div>
        <Label>Fotos *</Label>
        <PhotoDropzone onFilesChange={setFiles} />
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded text-sm">
          {error}
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
          Mit dem Absenden stimmen Sie zu, dass Ihre Daten und Fotos zum Zweck 
          der Kontaktaufnahme an {practiceName} übermittelt werden.
        </p>
        <Button
          type="submit"
          disabled={isPending || files.length === 0}
          className="w-full"
          size="lg"
        >
          {isPending ? "Wird gesendet…" : "Jetzt einsenden"}
        </Button>
      </div>
    </form>
  );
}
```

### Datei: `app/doc/[slug]/upload/page.tsx`

```typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";
import { UploadForm } from "@/components/public/upload-form";

interface UploadPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const practiceName =
    profile.practice_name || profile.display_name || "Zahnarztpraxis";

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link
        href={`/doc/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        Zurück zum Profil
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Einsendung
        </p>
        <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary mb-3">
          Unterlagen einreichen
        </h1>
        <p className="text-sm text-text-secondary">
          Ihre Daten werden verschlüsselt an <strong>{practiceName}</strong> übermittelt.
        </p>
      </div>

      <UploadForm slug={slug} practiceName={practiceName} />
    </div>
  );
}
```

### Datei: `app/doc/[slug]/upload/success/page.tsx`

```typescript
import Link from "next/link";
import { Check } from "lucide-react";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UploadSuccessPage({ params }: SuccessPageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  const practiceName =
    profile?.practice_name || profile?.display_name || "der Praxis";

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-6">
          <Check className="w-8 h-8 text-brand" strokeWidth={2} />
        </div>

        <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary mb-4">
          Unterlagen eingegangen
        </h1>

        <p className="text-text-secondary leading-relaxed mb-2">
          Ihre Einsendung wurde bei {practiceName} registriert.
        </p>
        <p className="text-text-secondary leading-relaxed mb-8">
          Eine Bestätigung haben wir an Ihre E-Mail-Adresse gesendet.
        </p>

        {slug && (
          <Link
            href={`/doc/${slug}`}
            className="text-sm text-brand hover:underline"
          >
            Zurück zum Profil
          </Link>
        )}
      </div>
    </div>
  );
}
```

---

## Schritt 8 — Server Action für Upload

### Datei: `app/doc/[slug]/upload/actions.ts`

```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { validatePhotoCollection } from "@/lib/upload/validation";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildUploadConfirmationEmail } from "@/lib/mail/upload-confirmation-patient-email";
import { buildNewSubmissionPractitionerEmail } from "@/lib/mail/new-submission-practitioner-email";
import { getAppBaseUrl } from "@/lib/env";

export async function submitUpload(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const slug = formData.get("slug") as string;
  const patientName = (formData.get("patient_name") as string)?.trim();
  const patientEmail = (formData.get("patient_email") as string)?.trim();
  const patientPhone = (formData.get("patient_phone") as string)?.trim() || null;
  const patientNotes = (formData.get("patient_notes") as string)?.trim() || null;
  const photoCount = parseInt(formData.get("photo_count") as string, 10);

  // Validation
  if (!slug || !patientName || !patientEmail) {
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  }

  if (isNaN(photoCount) || photoCount < 1) {
    return { error: "Mindestens ein Foto erforderlich." };
  }

  const photos: File[] = [];
  for (let i = 0; i < photoCount; i++) {
    const photo = formData.get(`photo_${i}`) as File;
    if (photo && photo.size > 0) {
      photos.push(photo);
    }
  }

  const validation = validatePhotoCollection(photos);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const admin = createAdminClient();

  // Workspace finden
  const { data: workspace, error: wsError } = await admin
    .from("workspaces")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (wsError || !workspace) {
    return { error: "Arzt-Profil nicht gefunden." };
  }

  // Profile Daten für Praxis-Name
  const { data: profile } = await admin
    .from("profile_data")
    .select("practice_name, display_name")
    .eq("workspace_id", workspace.id)
    .single();

  const practiceName =
    profile?.practice_name || profile?.display_name || workspace.name;

  // Submission anlegen
  const { data: submission, error: subError } = await admin
    .from("submissions")
    .insert({
      workspace_id: workspace.id,
      patient_name: patientName,
      patient_email: patientEmail,
      patient_phone: patientPhone,
      patient_notes: patientNotes,
    })
    .select("id")
    .single();

  if (subError || !submission) {
    console.error("[upload] submission insert failed:", subError);
    return { error: "Einsendung konnte nicht gespeichert werden." };
  }

  const submissionId = submission.id;

  // Fotos in Storage hochladen
  const uploadedPaths: string[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${workspace.id}/${submissionId}/${Date.now()}-${i}.${ext}`;

    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from("submission-photos")
      .upload(storagePath, buffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(`[upload] photo ${i} upload failed:`, uploadError);
      // Cleanup: Submission + bereits hochgeladene Fotos löschen
      await admin.from("submissions").delete().eq("id", submissionId);
      for (const path of uploadedPaths) {
        await admin.storage.from("submission-photos").remove([path]);
      }
      return { error: "Foto-Upload fehlgeschlagen. Bitte erneut versuchen." };
    }

    uploadedPaths.push(storagePath);

    // submission_photos-Eintrag
    await admin.from("submission_photos").insert({
      submission_id: submissionId,
      storage_path: storagePath,
      sort_order: i,
    });
  }

  // E-Mails verschicken (best-effort, blockiert nicht bei Fehler)
  const fullName = patientName;
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : null;

  // Mail 1: an Patient
  const patientMail = buildUploadConfirmationEmail({
    practiceName,
    patientFirstName: firstName,
    patientLastName: lastName,
  });

  await sendTransactionalMailBestEffort(
    {
      to: patientEmail,
      subject: patientMail.subject,
      text: patientMail.text,
      html: patientMail.html,
    },
    "upload_confirmation_to_patient"
  );

  // Mail 2: an Arzt (E-Mail aus workspace_members / auth.users)
  const { data: members } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspace.id)
    .eq("role", "doctor");

  if (members && members.length > 0) {
    const { data: authData } = await admin.auth.admin.getUserById(
      members[0].user_id
    );

    if (authData?.user?.email) {
      const doctorMail = buildNewSubmissionPractitionerEmail({
        appBase: getAppBaseUrl(),
        patientDisplayLabel: fullName || patientEmail,
        submissionTimestamp: new Date(),
      });

      await sendTransactionalMailBestEffort(
        {
          to: authData.user.email,
          subject: doctorMail.subject,
          text: doctorMail.text,
          html: doctorMail.html,
        },
        "new_submission_to_practitioner"
      );
    }
  }

  return { success: true };
}
```

---

## Schritt 9 — Profile-Seite Update (Preview-Link)

### Datei: `app/(protected)/profile/page.tsx` (komplett ersetzen)

```typescript
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: ws } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();

  const publicUrl = ws ? `/doc/${ws.slug}` : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Profil · Phase 8 (Editor kommt)
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Öffentliches Profil
      </h1>
      <p className="text-text-secondary max-w-xl mb-8">
        Der Editor für Vita, Dienstleistungen und Praxis-Informationen wird 
        in Phase 8 hinzugefügt. Aktuell kannst du deine öffentliche Seite bereits sehen.
      </p>

      {publicUrl && (
        <div className="bg-surface-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-medium text-text-primary mb-3">
            Deine öffentliche Profil-URL
          </h2>
          <div className="flex items-center gap-3">
            <code className="text-sm text-text-secondary font-mono flex-1 truncate">
              smilescan.io{publicUrl}
            </code>
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-glow transition-colors"
            >
              Ansehen
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <p className="text-xs text-text-tertiary mt-3">
            Diese URL teilst du mit Patienten, um Unterlagen einzureichen.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Schritt 10 — Commit

```bash
git add .
git commit -m "feat: phase 7 — public profile and upload flow"
```

---

## Schritt 11 — STOP und Übergabe (MENSCHLICHE SCHRITTE)

Melde dem Menschen:

"Phase 7 Code ist fertig. Du musst **vier Dinge manuell** tun, bevor du testen kannst.

### 1. Drei SQL-Migrationen in Supabase ausführen

Im SQL Editor, einzeln der Reihe nach:

**Migration 009** (öffentliche Policies) — Inhalt aus `supabase/migrations/009_public_access.sql` kopieren, Run.

**Migration 011** (Slug-Update) — Inhalt aus `supabase/migrations/011_backfill_slugs.sql` kopieren, Run. Diese Migration ändert deinen Workspace-Slug von 'baysal-b' auf den aus deinem display_name abgeleiteten Slug (z.B. 'berk-baysal').

(Migration 010 ist nur Dokumentation, nicht ausführbar.)

### 2. Storage-Policies manuell im Supabase Dashboard anlegen

In Supabase: **Storage → submission-photos → Policies** Tab.

**Policy 1: Public Upload**
- Klick 'New Policy' → 'Custom'
- Name: `Anyone can upload`
- Allowed operation: **INSERT**
- Target roles: `anon, authenticated, public`
- WITH CHECK expression: `bucket_id = 'submission-photos'`
- Save

**Policy 2: Authenticated Read**
- Name: `Authenticated can read`
- Allowed operation: **SELECT**
- Target roles: `authenticated`
- USING expression: `bucket_id = 'submission-photos'`
- Save

### 3. Display-Name setzen (falls leer)

Prüfe in Supabase → Table Editor → profile_data:
Ist dein `display_name` gefüllt? Wenn nicht, setz ihn manuell. Sonst wird der Slug leer.

```sql
UPDATE profile_data 
SET display_name = 'Berk Baysal' 
WHERE workspace_id = (
  SELECT workspace_id FROM workspace_members WHERE role = 'doctor' LIMIT 1
);
```

Dann Migration 011 **erneut ausführen**, damit der Slug richtig gesetzt wird.

### 4. Browser-Test

Öffne in einem **Inkognito-Fenster** (um sicher zu gehen dass du nicht eingeloggt bist):

- `http://localhost:3000/doc/berk-baysal`  
  → Öffentliches Profil mit Hero, Vita (leer), CTA unten

- Klick 'Jetzt einsenden'  
  → Upload-Formular

- Fülle aus mit deiner echten E-Mail, füge ein Test-Foto hinzu  
  → Klick 'Jetzt einsenden'

- Redirect auf '/doc/berk-baysal/upload/success' (grüner Haken)

- Check E-Mail-Postfach  
  → 1 Mail 'Bestätigung Ihrer Einsendung'

- Wechsel zurück zum eingeloggten Fenster, `/inbox`  
  → Neue Einsendung ganz oben, mit deinem Test-Foto

**Wichtig:** Der Slug in deinem Fall ist nicht unbedingt 'berk-baysal'. Er basiert auf display_name. Schau in Supabase nach oder öffne `/profile` im eingeloggten Bereich — dort siehst du den echten Slug."

---

## Bei Fehlern

### "Arzt-Profil nicht gefunden" beim Upload
Slug stimmt nicht. Prüfe `SELECT slug FROM workspaces;` in Supabase.

### Foto-Upload schlägt fehl mit 'new row violates row-level security'
Storage-Policies fehlen. Siehe Schritt 11 Punkt 2.

### 'Cannot find module nodemailer' o.ä.
`npm install` erneut ausführen.

### Inbox zeigt die neue Einsendung nicht
RLS für Submissions greift. Refresh die Seite oder logge dich erneut ein.

---

*Ende Phase 7*
