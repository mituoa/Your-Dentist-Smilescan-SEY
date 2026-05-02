# PHASE 10 — Settings

> **Für Cursor Agent:** Diese Phase ersetzt endgültig das manuelle SQL-Update aus Phase 6 und ergänzt Team-Einladungen, Slug-Änderung mit Redirect und minimales Branding. Gestaffelte Abschnitte in einer einzigen Scroll-Seite. Arbeite Schritte 1-13 ab.

> **Für den Menschen:** Nach Phase 10 kann der Arzt alles selbst einstellen — Terminlink, öffentliche URL, Team einladen, Logo und Akzentfarbe. Kein SQL mehr nötig.

---

## Übersicht

### Neue Dateien

| Pfad | Zweck |
|---|---|
| `supabase/migrations/015_extend_settings.sql` | `slug_history` Tabelle + neue `profile_data` / `workspace_members` Spalten |
| `lib/queries/settings.ts` | Queries (Account, Slug-History, Invitations) |
| `lib/validation/slug-validation.ts` | Slug-Regex + Availability-Check |
| `lib/mail/team-invitation-email.ts` | Mail-Template für Team-Einladung |
| `app/(protected)/settings/page.tsx` | Haupt-Settings-Seite |
| `app/(protected)/settings/actions.ts` | Server Actions |
| `components/settings/section-header.tsx` | Wiederverwendbares Section-Layout (§ I, II, …) |
| `components/settings/terminlink-section.tsx` | Terminlink-Feld |
| `components/settings/slug-section.tsx` | Slug-Editor mit Verfügbarkeits-Check |
| `components/settings/account-section.tsx` | E-Mail, Passwort-Reset, Workspace-Name |
| `components/settings/team-section.tsx` | Mitgliederliste + Einladung |
| `components/settings/invite-form.tsx` | Formular für neue Einladung |
| `components/settings/branding-section.tsx` | Logo-Upload + Akzent-Farbe |
| `components/settings/danger-zone.tsx` | Logout |
| `app/accept-invite/page.tsx` | Einladungs-Annahme-Flow (öffentlich) |

### Geänderte Dateien

| Pfad | Änderung |
|---|---|
| `middleware.ts` / `app/doc/[slug]/page.tsx` | Slug-Redirect-Logik wenn alter Slug aufgerufen wird |
| `lib/auth-helpers.ts` | Falls nötig — Invitation-Acceptance helper |
| `components/profile-preview/editorial-profile.tsx` | Logo und Akzent-Farbe unterstützen |

---

## Schritt 1 — Datenmodell erweitern

### Datei: `supabase/migrations/015_extend_settings.sql`

```sql
-- Phase 10: Settings-Erweiterungen

-- 1. Slug-History-Tabelle für Redirects
CREATE TABLE IF NOT EXISTS workspace_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  old_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(old_slug)
);

CREATE INDEX IF NOT EXISTS idx_slug_history_old_slug ON workspace_slug_history(old_slug);

-- RLS: öffentliches Lesen (für Redirect-Check ohne Login)
ALTER TABLE workspace_slug_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read slug history"
  ON workspace_slug_history FOR SELECT
  USING (true);

-- 2. Logo und Akzent-Farbe in profile_data
ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#0F6E56';

-- Constraint: accent_color muss ein gültiger Hex-Code sein
ALTER TABLE profile_data
  ADD CONSTRAINT accent_color_format 
  CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$');

-- 3. Team-Einladungen
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'team' CHECK (role IN ('doctor', 'team')),
  invited_by uuid REFERENCES auth.users(id),
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON team_invitations(token) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_invitations_workspace ON team_invitations(workspace_id);

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Doctor kann Invitations seines Workspaces lesen
CREATE POLICY "doctors can read own workspace invitations"
  ON team_invitations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );

-- Doctor kann Invitations erstellen
CREATE POLICY "doctors can insert invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );

-- Doctor kann Invitations löschen (Revoke)
CREATE POLICY "doctors can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid() AND role = 'doctor'
    )
  );

-- Reload Schema-Cache
NOTIFY pgrst, 'reload schema';
```

---

## Schritt 2 — Slug-Validation

### Datei: `lib/validation/slug-validation.ts`

```typescript
export const SLUG_LIMITS = {
  min: 3,
  max: 50,
} as const;

export function isValidSlug(slug: string): { valid: boolean; error?: string } {
  const trimmed = slug.trim();

  if (!trimmed) return { valid: false, error: "Slug darf nicht leer sein." };
  if (trimmed.length < SLUG_LIMITS.min) return { valid: false, error: `Mindestens ${SLUG_LIMITS.min} Zeichen.` };
  if (trimmed.length > SLUG_LIMITS.max) return { valid: false, error: `Maximal ${SLUG_LIMITS.max} Zeichen.` };

  // Nur a-z, 0-9 und Bindestriche
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return { valid: false, error: "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt." };
  }

  // Keine Bindestriche am Anfang/Ende
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return { valid: false, error: "Keine Bindestriche am Anfang oder Ende." };
  }

  // Keine doppelten Bindestriche
  if (trimmed.includes("--")) {
    return { valid: false, error: "Keine doppelten Bindestriche." };
  }

  // Reservierte Slugs
  const reserved = ["api", "admin", "login", "register", "journal", "profile", "settings", "doc", "accept-invite", "app", "www", "smilescan"];
  if (reserved.includes(trimmed)) {
    return { valid: false, error: "Dieser Slug ist reserviert." };
  }

  return { valid: true };
}
```

---

## Schritt 3 — Queries

### Datei: `lib/queries/settings.ts`

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface TeamMember {
  user_id: string;
  email: string;
  role: "doctor" | "team";
  joined_at: string | null;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: "doctor" | "team";
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export async function getSettingsData(workspaceId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [ws, profile] = await Promise.all([
    supabase.from("workspaces").select("id, name, slug").eq("id", workspaceId).single(),
    supabase.from("profile_data").select("appointment_link, logo_url, accent_color").eq("workspace_id", workspaceId).single(),
  ]);

  // Team-Mitglieder mit E-Mails (über Admin-Client, weil auth.users)
  const { data: memberRows } = await admin
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", workspaceId);

  const members: TeamMember[] = [];
  for (const m of memberRows || []) {
    const { data: user } = await admin.auth.admin.getUserById(m.user_id);
    if (user?.user?.email) {
      members.push({
        user_id: m.user_id,
        email: user.user.email,
        role: m.role as "doctor" | "team",
        joined_at: m.joined_at,
      });
    }
  }

  const { data: invitations } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return {
    workspace: ws.data || null,
    profile: profile.data || null,
    members,
    invitations: (invitations as TeamInvitation[]) || [],
  };
}

export async function isSlugAvailable(slug: string, excludeWorkspaceId: string): Promise<boolean> {
  const admin = createAdminClient();

  // Check current workspaces
  const { data: existing } = await admin
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .neq("id", excludeWorkspaceId);

  if (existing && existing.length > 0) return false;

  // Check history (old slugs count as taken)
  const { data: historical } = await admin
    .from("workspace_slug_history")
    .select("workspace_id")
    .eq("old_slug", slug)
    .neq("workspace_id", excludeWorkspaceId);

  if (historical && historical.length > 0) return false;

  return true;
}

export async function resolveSlugRedirect(slug: string): Promise<string | null> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("workspace_slug_history")
    .select("workspace_id")
    .eq("old_slug", slug)
    .single();

  if (!data) return null;

  const { data: ws } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", data.workspace_id)
    .single();

  return ws?.slug || null;
}
```

---

## Schritt 4 — Mail-Template Team-Einladung

### Datei: `lib/mail/team-invitation-email.ts`

```typescript
import "server-only";
import { escapeHtml } from "@/lib/mail/escape-html";

export interface BuildTeamInvitationInput {
  practiceName: string;
  inviterName: string | null;
  acceptUrl: string;
  recipientEmail: string;
}

export function buildTeamInvitationEmail(
  input: BuildTeamInvitationInput
): { subject: string; text: string; html: string } {
  const { practiceName, inviterName, acceptUrl, recipientEmail } = input;

  const subject = `Einladung zu ${practiceName}`;

  const whoInvites = inviterName ? `${inviterName} von ${practiceName}` : `${practiceName}`;

  const text =
    `Guten Tag,\n\n` +
    `${whoInvites} hat Sie zu einem Team-Account bei SmileScan eingeladen.\n\n` +
    `Die Einladung ist persönlich für diese E-Mail-Adresse (${recipientEmail}) ausgestellt und gilt für 7 Tage.\n\n` +
    `Zum Annehmen der Einladung klicken Sie bitte auf folgenden Link:\n` +
    `${acceptUrl}\n\n` +
    `Falls Sie diese E-Mail unerwartet erhalten haben, können Sie sie ignorieren.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `SmileScan`;

  const safeInviter = escapeHtml(whoInvites);
  const safeEmail = escapeHtml(recipientEmail);
  const safeUrl = escapeHtml(acceptUrl);

  const html =
    `<p>Guten Tag,</p>` +
    `<p>${safeInviter} hat Sie zu einem Team-Account bei SmileScan eingeladen.</p>` +
    `<p>Die Einladung ist persönlich für die E-Mail-Adresse <strong>${safeEmail}</strong> ausgestellt und gilt für 7 Tage.</p>` +
    `<p><a href="${safeUrl}" style="display: inline-block; padding: 14px 28px; background: #1A1A1A; color: #FAFAF8; text-decoration: none; font-weight: 500; border-radius: 2px;">Einladung annehmen</a></p>` +
    `<p style="color: #5F5E5A; font-size: 12px;">Oder öffnen Sie: ${safeUrl}</p>` +
    `<p style="color: #97958C; font-size: 12px;">Falls Sie diese E-Mail unerwartet erhalten haben, können Sie sie ignorieren.</p>` +
    `<p>Mit freundlichen Grüßen<br>SmileScan</p>`;

  return { subject, text, html };
}
```

---

## Schritt 5 — Server Actions

### Datei: `app/(protected)/settings/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { isValidSlug } from "@/lib/validation/slug-validation";
import { isSlugAvailable } from "@/lib/queries/settings";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildTeamInvitationEmail } from "@/lib/mail/team-invitation-email";
import { getAppBaseUrl } from "@/lib/env";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ---------- Terminlink ----------

export async function saveAppointmentLink(url: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const trimmed = url.trim();

  if (trimmed && !/^https?:\/\//.test(trimmed)) {
    return { error: "URL muss mit http:// oder https:// beginnen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_data")
    .update({ appointment_link: trimmed || null })
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    console.error("[saveAppointmentLink]", error);
    return { error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/settings");
  return { success: true };
}

// ---------- Slug ----------

export async function changeSlug(newSlug: string): Promise<{ error?: string; success?: boolean; slug?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const normalized = newSlug.trim().toLowerCase();
  const validation = isValidSlug(normalized);
  if (!validation.valid) return { error: validation.error };

  const available = await isSlugAvailable(normalized, workspace.workspace_id);
  if (!available) return { error: "Dieser Slug ist bereits vergeben." };

  const admin = createAdminClient();

  // Aktuellen Slug holen (für History)
  const { data: current } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();

  if (current?.slug && current.slug !== normalized) {
    // History-Eintrag anlegen
    await admin
      .from("workspace_slug_history")
      .insert({ workspace_id: workspace.workspace_id, old_slug: current.slug });
  }

  // Slug ändern
  const { error } = await admin
    .from("workspaces")
    .update({ slug: normalized })
    .eq("id", workspace.workspace_id);

  if (error) {
    console.error("[changeSlug]", error);
    return { error: "Slug konnte nicht geändert werden." };
  }

  revalidatePath("/settings");
  revalidatePath(`/doc/${normalized}`);
  if (current?.slug) revalidatePath(`/doc/${current.slug}`);

  return { success: true, slug: normalized };
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { available: false, error: "Nicht angemeldet." };

  const normalized = slug.trim().toLowerCase();
  const validation = isValidSlug(normalized);
  if (!validation.valid) return { available: false, error: validation.error };

  const available = await isSlugAvailable(normalized, workspace.workspace_id);
  return { available };
}

// ---------- Workspace-Name ----------

export async function changeWorkspaceName(name: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name darf nicht leer sein." };
  if (trimmed.length > 80) return { error: "Maximal 80 Zeichen." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspaces")
    .update({ name: trimmed })
    .eq("id", workspace.workspace_id);

  if (error) return { error: "Speichern fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

// ---------- Passwort-Reset ----------

export async function requestPasswordReset(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Nicht angemeldet." };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${getAppBaseUrl()}/login`,
  });

  if (error) {
    console.error("[requestPasswordReset]", error);
    return { error: "E-Mail konnte nicht verschickt werden." };
  }

  return { success: true };
}

// ---------- Team-Einladungen ----------

export async function inviteTeamMember(email: string, role: "team" | "doctor"): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können einladen." };

  const trimmedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: "Ungültige E-Mail-Adresse." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  // Existierende pending Invitation für diese E-Mail im Workspace?
  const { data: existing } = await supabase
    .from("team_invitations")
    .select("id")
    .eq("workspace_id", workspace.workspace_id)
    .eq("email", trimmedEmail)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (existing && existing.length > 0) {
    return { error: "Einladung bereits verschickt. Widerrufen Sie die bestehende, um eine neue zu senden." };
  }

  const token = crypto.randomBytes(32).toString("hex");

  const { error: insertError } = await supabase
    .from("team_invitations")
    .insert({
      workspace_id: workspace.workspace_id,
      email: trimmedEmail,
      role,
      invited_by: user.id,
      token,
    });

  if (insertError) {
    console.error("[inviteTeamMember]", insertError);
    return { error: "Einladung konnte nicht erstellt werden." };
  }

  // Praxis-Name + Einlader-Name laden
  const admin = createAdminClient();
  const { data: ws } = await admin.from("workspaces").select("name").eq("id", workspace.workspace_id).single();
  const { data: profile } = await admin
    .from("profile_data")
    .select("display_name, practice_name")
    .eq("workspace_id", workspace.workspace_id)
    .single();

  const practiceName = profile?.practice_name || ws?.name || "SmileScan Praxis";
  const inviterName = profile?.display_name || null;
  const acceptUrl = `${getAppBaseUrl()}/accept-invite?token=${token}`;

  const mail = buildTeamInvitationEmail({
    practiceName,
    inviterName,
    acceptUrl,
    recipientEmail: trimmedEmail,
  });

  await sendTransactionalMailBestEffort(
    { to: trimmedEmail, subject: mail.subject, text: mail.text, html: mail.html },
    "team_invitation"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function revokeInvitation(invitationId: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Widerruf fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

export async function removeTeamMember(userId: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können Mitglieder entfernen." };
  if (userId === workspace.user_id) return { error: "Sie können sich nicht selbst entfernen." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.workspace_id)
    .eq("user_id", userId);

  if (error) return { error: "Entfernen fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

// ---------- Branding ----------

export async function saveAccentColor(color: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: "Ungültige Farbe. Format: #RRGGBB" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_data")
    .update({ accent_color: color })
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Speichern fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

export async function uploadLogo(formData: FormData): Promise<{ error?: string; url?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei." };

  if (file.size > 5 * 1024 * 1024) return { error: "Max 5 MB." };

  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) return { error: "PNG, JPG, WEBP oder SVG." };

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${workspace.workspace_id}/logo-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("branding-assets")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (upErr) {
    console.error("[uploadLogo]", upErr);
    return { error: "Upload fehlgeschlagen." };
  }

  const { data } = admin.storage.from("branding-assets").getPublicUrl(path);

  await admin
    .from("profile_data")
    .update({ logo_url: data.publicUrl })
    .eq("workspace_id", workspace.workspace_id);

  revalidatePath("/settings");
  return { url: data.publicUrl };
}

export async function removeLogo(): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const admin = createAdminClient();
  await admin.from("profile_data").update({ logo_url: null }).eq("workspace_id", workspace.workspace_id);

  revalidatePath("/settings");
  return { success: true };
}

// ---------- Accept Invitation (public) ----------

export async function acceptInvitation(token: string): Promise<{ error?: string; success?: boolean; needsSignup?: boolean; email?: string }> {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("team_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invite) return { error: "Einladung nicht gefunden oder bereits angenommen." };

  if (new Date(invite.expires_at) < new Date()) {
    return { error: "Einladung ist abgelaufen." };
  }

  // Prüfen ob User mit dieser E-Mail bereits existiert
  const { data: allUsers } = await admin.auth.admin.listUsers();
  const existingUser = allUsers.users.find((u) => u.email?.toLowerCase() === invite.email.toLowerCase());

  if (!existingUser) {
    // User muss sich erst registrieren
    return { needsSignup: true, email: invite.email };
  }

  // Member hinzufügen
  const { error: memberError } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: invite.workspace_id,
      user_id: existingUser.id,
      role: invite.role,
    });

  if (memberError && memberError.code !== "23505") {
    console.error("[acceptInvitation]", memberError);
    return { error: "Beitritt fehlgeschlagen." };
  }

  // Invitation als angenommen markieren
  await admin
    .from("team_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return { success: true };
}
```

---

## Schritt 6 — Section-Header Komponente

### Datei: `components/settings/section-header.tsx`

```typescript
interface SectionHeaderProps {
  number: string;
  title: string;
  description?: string;
}

export function SectionHeader({ number, title, description }: SectionHeaderProps) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
          § {number}
        </span>
        <h2 className="font-serif text-3xl font-light">{title}</h2>
      </div>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </div>
  );
}
```

---

## Schritt 7 — Terminlink-Section

### Datei: `components/settings/terminlink-section.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { Calendar, Check, Loader2 } from "lucide-react";
import { saveAppointmentLink } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface TerminlinkSectionProps {
  initial: string | null;
}

export function TerminlinkSection({ initial }: TerminlinkSectionProps) {
  const [value, setValue] = useState(initial || "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveAppointmentLink(value);
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="I"
        title="Terminlink"
        description="Ihre Kalender-URL. Wird an Patienten gesendet, wenn Sie im Inbox-Detail den Terminlink-Button klicken."
      />

      <div className="space-y-2 max-w-xl">
        <Label htmlFor="appointment_link">URL zu Ihrem Kalender</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" strokeWidth={1.75} />
            <Input
              id="appointment_link"
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://calendly.com/dr-baysal"
              className="pl-10"
            />
          </div>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : "Speichern"}
          </Button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {saved && <p className="text-xs text-brand">Terminlink gespeichert</p>}
        <p className="text-xs text-text-tertiary">Beispiele: Calendly, Cal.com, Doctolib, Jameda Online-Terminbuchung</p>
      </div>
    </section>
  );
}
```

---

## Schritt 8 — Slug-Section

### Datei: `components/settings/slug-section.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { Globe, Check, Loader2, AlertTriangle } from "lucide-react";
import { changeSlug, checkSlugAvailability } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";
import { getAppBaseUrl } from "@/lib/env";

interface SlugSectionProps {
  currentSlug: string;
  appBaseUrl: string;
}

export function SlugSection({ currentSlug, appBaseUrl }: SlugSectionProps) {
  const [value, setValue] = useState(currentSlug);
  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleChange = (v: string) => {
    setValue(v);
    if (v === currentSlug) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    setTimeout(async () => {
      const result = await checkSlugAvailability(v);
      if (result.error) {
        setAvailability("invalid");
        setAvailabilityError(result.error);
      } else if (result.available) {
        setAvailability("available");
        setAvailabilityError(null);
      } else {
        setAvailability("taken");
        setAvailabilityError("Dieser Slug ist bereits vergeben.");
      }
    }, 400);
  };

  const handleSave = () => {
    if (!confirmOpen) {
      setConfirmOpen(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await changeSlug(value);
      if (result.error) {
        setError(result.error);
      } else if (result.slug) {
        setConfirmOpen(false);
      }
    });
  };

  const canSave = availability === "available" && value !== currentSlug;

  return (
    <section className="space-y-6">
      <SectionHeader
        number="II"
        title="Öffentlicher Link"
        description="Die URL, unter der Ihr Profil für Patienten erreichbar ist."
      />

      <div className="space-y-3 max-w-xl">
        <div>
          <Label>Aktuelle URL</Label>
          <div className="mt-1 px-3 py-2 bg-surface-sunken border border-border rounded text-sm font-mono text-text-secondary">
            {appBaseUrl}/doc/{currentSlug}
          </div>
        </div>

        <div>
          <Label htmlFor="new_slug">Neuen Slug wählen</Label>
          <div className="relative mt-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" strokeWidth={1.75} />
            <Input
              id="new_slug"
              value={value}
              onChange={(e) => handleChange(e.target.value.toLowerCase())}
              placeholder="praxis-baysal"
              className="pl-10 font-mono"
              maxLength={50}
            />
          </div>

          <div className="mt-2 text-xs h-5">
            {availability === "checking" && <span className="text-text-tertiary">Prüfe Verfügbarkeit…</span>}
            {availability === "available" && <span className="text-brand flex items-center gap-1"><Check className="w-3 h-3" /> Verfügbar</span>}
            {availability === "taken" && <span className="text-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {availabilityError}</span>}
            {availability === "invalid" && <span className="text-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {availabilityError}</span>}
          </div>

          <p className="text-xs text-text-tertiary mt-1">
            Kleinbuchstaben, Zahlen, Bindestriche. 3-50 Zeichen. Ihre Vorschau: <span className="font-mono">{appBaseUrl}/doc/{value || "…"}</span>
          </p>
        </div>

        {confirmOpen && (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded">
            <p className="text-sm text-text-primary font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={2} />
              Slug wirklich ändern?
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Ihr alter Link <span className="font-mono">{appBaseUrl}/doc/{currentSlug}</span> wird automatisch auf den neuen weitergeleitet. Patienten, die den alten Link gespeichert haben, landen weiterhin auf Ihrem Profil.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isPending} size="sm">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ja, ändern"}
              </Button>
              <Button onClick={() => setConfirmOpen(false)} variant="ghost" size="sm">Abbrechen</Button>
            </div>
          </div>
        )}

        {!confirmOpen && (
          <Button onClick={handleSave} disabled={!canSave} className="w-fit">
            Neuen Slug speichern
          </Button>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}
```

---

## Schritt 9 — Account-Section

### Datei: `components/settings/account-section.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { Mail, Key, Check } from "lucide-react";
import { changeWorkspaceName, requestPasswordReset } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface AccountSectionProps {
  email: string;
  workspaceName: string;
}

export function AccountSection({ email, workspaceName }: AccountSectionProps) {
  const [name, setName] = useState(workspaceName);
  const [isPending, startTransition] = useTransition();
  const [savedName, setSavedName] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveName = () => {
    setError(null);
    startTransition(async () => {
      const result = await changeWorkspaceName(name);
      if (result.error) setError(result.error);
      else {
        setSavedName(true);
        setTimeout(() => setSavedName(false), 3000);
      }
    });
  };

  const handlePasswordReset = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset();
      if (result.error) setError(result.error);
      else setPasswordResetSent(true);
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="III"
        title="Account"
        description="Persönliche Account-Einstellungen."
      />

      <div className="space-y-6 max-w-xl">
        {/* E-Mail (read-only) */}
        <div>
          <Label>E-Mail-Adresse</Label>
          <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-surface-sunken border border-border rounded">
            <Mail className="w-4 h-4 text-text-tertiary" strokeWidth={1.75} />
            <span className="text-sm text-text-primary">{email}</span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">Änderung der E-Mail-Adresse derzeit nur auf Anfrage.</p>
        </div>

        {/* Workspace-Name */}
        <div>
          <Label htmlFor="workspace_name">Workspace-Name</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="workspace_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
            <Button onClick={handleSaveName} disabled={isPending || name === workspaceName}>
              {savedName ? <Check className="w-4 h-4" /> : "Speichern"}
            </Button>
          </div>
        </div>

        {/* Passwort */}
        <div>
          <Label>Passwort</Label>
          <div className="mt-1 space-y-2">
            <Button onClick={handlePasswordReset} variant="ghost" disabled={isPending || passwordResetSent}>
              <Key className="w-4 h-4 mr-2" strokeWidth={1.75} />
              {passwordResetSent ? "E-Mail gesendet" : "Passwort-Reset per E-Mail anfordern"}
            </Button>
            {passwordResetSent && (
              <p className="text-xs text-text-tertiary">Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen.</p>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}
```

---

## Schritt 10 — Team-Section + Invite-Form

### Datei: `components/settings/invite-form.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { inviteTeamMember } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"team" | "doctor">("team");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setError(null);
    setSent(false);
    startTransition(async () => {
      const result = await inviteTeamMember(email, role);
      if (result.error) setError(result.error);
      else {
        setSent(true);
        setEmail("");
        setTimeout(() => setSent(false), 5000);
      }
    });
  };

  return (
    <div className="p-5 bg-surface-card border border-border rounded-lg space-y-4">
      <div className="flex items-center gap-2 font-medium">
        <UserPlus className="w-4 h-4" strokeWidth={1.75} />
        <span>Neues Mitglied einladen</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="assistenz@ihre-praxis.de"
          disabled={isPending}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "team" | "doctor")}
          className="px-3 h-10 bg-surface-card border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="team">Team</option>
          <option value="doctor">Arzt</option>
        </select>
        <Button onClick={handleSubmit} disabled={isPending || !email}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einladen"}
        </Button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {sent && <p className="text-xs text-brand">Einladung verschickt. Gültig für 7 Tage.</p>}
      <p className="text-xs text-text-tertiary">
        Der Empfänger erhält eine E-Mail mit Einladungs-Link. Rollen: <strong>Team</strong> sieht nur eigene Aufgaben; <strong>Arzt</strong> hat vollen Zugriff.
      </p>
    </div>
  );
}
```

### Datei: `components/settings/team-section.tsx`

```typescript
"use client";

import { useTransition } from "react";
import { X, Clock, Check } from "lucide-react";
import { revokeInvitation, removeTeamMember } from "@/app/(protected)/settings/actions";
import { SectionHeader } from "./section-header";
import { InviteForm } from "./invite-form";
import { useRouter } from "next/navigation";
import type { TeamMember, TeamInvitation } from "@/lib/queries/settings";

interface TeamSectionProps {
  members: TeamMember[];
  invitations: TeamInvitation[];
  currentUserId: string;
}

export function TeamSection({ members, invitations, currentUserId }: TeamSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevoke = (id: string) => {
    if (!confirm("Einladung widerrufen?")) return;
    startTransition(async () => {
      await revokeInvitation(id);
      router.refresh();
    });
  };

  const handleRemove = (userId: string) => {
    if (!confirm("Mitglied wirklich entfernen?")) return;
    startTransition(async () => {
      await removeTeamMember(userId);
      router.refresh();
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="IV"
        title="Team"
        description="Mitglieder und offene Einladungen."
      />

      <div className="max-w-2xl space-y-6">
        <InviteForm />

        {/* Aktive Mitglieder */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
            Aktive Mitglieder ({members.length})
          </h3>
          <div className="border-t border-border">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-xs font-medium">
                    {m.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.email}</div>
                    <div className="text-xs text-text-tertiary uppercase tracking-wider">
                      {m.role === "doctor" ? "Arzt" : "Team"}
                      {m.user_id === currentUserId && " · Sie"}
                    </div>
                  </div>
                </div>
                {m.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemove(m.user_id)}
                    disabled={isPending}
                    className="text-xs text-text-tertiary hover:text-danger"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Offene Einladungen */}
        {invitations.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
              Offene Einladungen ({invitations.length})
            </h3>
            <div className="border-t border-border">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-text-tertiary" strokeWidth={1.75} />
                    <div>
                      <div className="text-sm">{inv.email}</div>
                      <div className="text-xs text-text-tertiary uppercase tracking-wider">
                        {inv.role === "doctor" ? "Arzt" : "Team"} · Läuft ab {new Date(inv.expires_at).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(inv.id)}
                    disabled={isPending}
                    className="text-xs text-text-tertiary hover:text-danger"
                  >
                    Widerrufen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

---

## Schritt 11 — Branding-Section

### Datei: `components/settings/branding-section.tsx`

```typescript
"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, X, Palette } from "lucide-react";
import { uploadLogo, removeLogo, saveAccentColor } from "@/app/(protected)/settings/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface BrandingSectionProps {
  logoUrl: string | null;
  accentColor: string;
}

const PRESET_COLORS = [
  { name: "Teal (Standard)", value: "#0F6E56" },
  { name: "Navy", value: "#1E3A5F" },
  { name: "Bordeaux", value: "#6E1F2E" },
  { name: "Forest", value: "#2F4F2F" },
  { name: "Charcoal", value: "#2A2A2A" },
  { name: "Terracotta", value: "#A0532E" },
];

export function BrandingSection({ logoUrl, accentColor }: BrandingSectionProps) {
  const [color, setColor] = useState(accentColor);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadLogo(formData);
      if (result.error) setError(result.error);
    });
  };

  const handleLogoRemove = () => {
    startTransition(async () => {
      await removeLogo();
    });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    startTransition(async () => {
      await saveAccentColor(newColor);
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="V"
        title="Erscheinungsbild"
        description="Logo und Akzentfarbe für Ihr öffentliches Profil."
      />

      <div className="max-w-2xl space-y-8">
        {/* Logo */}
        <div>
          <Label>Logo</Label>
          <p className="text-xs text-text-tertiary mb-3">
            Erscheint anstelle des Praxis-Namens im Header. Optimal: rechteckig, min. 200×60px. PNG mit transparentem Hintergrund empfohlen.
          </p>

          {logoUrl ? (
            <div className="flex items-start gap-4">
              <div className="p-6 border border-border rounded-lg bg-paper">
                <img src={logoUrl} alt="Logo" className="max-h-16 max-w-[200px] object-contain" />
              </div>
              <div className="space-y-2">
                <button onClick={() => fileInputRef.current?.click()} className="text-xs hover:underline">
                  Neues Logo hochladen
                </button>
                <button
                  onClick={handleLogoRemove}
                  disabled={isPending}
                  className="block text-xs text-danger hover:underline"
                >
                  Logo entfernen
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand/50 max-w-md"
            >
              <Upload className="w-6 h-6 mx-auto text-text-tertiary mb-2" strokeWidth={1.5} />
              <p className="text-sm">Logo hochladen</p>
              <p className="text-xs text-text-tertiary mt-1">PNG, JPG, WEBP, SVG · max 5 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoUpload(f);
            }}
          />
          {error && <p className="text-xs text-danger mt-2">{error}</p>}
        </div>

        {/* Akzent-Farbe */}
        <div>
          <Label>Akzentfarbe</Label>
          <p className="text-xs text-text-tertiary mb-3">
            Farbe für Buttons und Akzente im öffentlichen Profil. Hintergrund und Schrift bleiben unverändert.
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleColorChange(preset.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs border rounded-full transition-all ${
                    color === preset.value
                      ? "border-ink bg-ink text-cream"
                      : "border-border hover:border-ink/50"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.value }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) handleColorChange(v);
                  else setColor(v);
                }}
                className="px-3 py-2 text-sm bg-surface-card border border-border rounded font-mono w-32"
                placeholder="#0F6E56"
              />
              <span className="text-xs text-text-tertiary">Eigene Farbe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Schritt 12 — Danger-Zone + Settings-Page

### Datei: `components/settings/danger-zone.tsx`

```typescript
"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SectionHeader } from "./section-header";

export function DangerZone() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    if (!confirm("Wirklich abmelden?")) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    });
  };

  return (
    <section className="space-y-6 pb-24">
      <SectionHeader number="VI" title="Abmelden" />
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex items-center gap-2 text-sm text-danger hover:underline"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.75} />
        Aus SmileScan abmelden
      </button>
    </section>
  );
}
```

### Datei: `app/(protected)/settings/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getSettingsData } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/env";
import { TerminlinkSection } from "@/components/settings/terminlink-section";
import { SlugSection } from "@/components/settings/slug-section";
import { AccountSection } from "@/components/settings/account-section";
import { TeamSection } from "@/components/settings/team-section";
import { BrandingSection } from "@/components/settings/branding-section";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getSettingsData(workspace.workspace_id);
  if (!data.workspace) return <div className="p-12">Workspace nicht gefunden.</div>;

  const isDoctor = workspace.role === "doctor";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">Einstellungen</p>
        <h1 className="font-serif text-5xl font-light tracking-tight mb-4">Einstellungen</h1>
        <p className="text-text-secondary max-w-xl">Account, Team und Erscheinungsbild Ihrer Praxis.</p>
      </div>

      <TerminlinkSection initial={data.profile?.appointment_link || null} />

      <SlugSection currentSlug={data.workspace.slug} appBaseUrl={getAppBaseUrl()} />

      <AccountSection email={user.email!} workspaceName={data.workspace.name} />

      {isDoctor && (
        <TeamSection
          members={data.members}
          invitations={data.invitations}
          currentUserId={user.id}
        />
      )}

      {isDoctor && (
        <BrandingSection
          logoUrl={data.profile?.logo_url || null}
          accentColor={data.profile?.accent_color || "#0F6E56"}
        />
      )}

      <DangerZone />
    </div>
  );
}
```

---

## Schritt 13 — Accept-Invite Page + Slug-Redirect

### Datei: `app/accept-invite/page.tsx`

```typescript
import { redirect } from "next/navigation";
import Link from "next/link";
import { acceptInvitation } from "@/app/(protected)/settings/actions";
import { createClient } from "@/lib/supabase/server";

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await acceptInvitation(token);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-surface-card border border-border rounded-lg p-8 text-center space-y-4">
        {result.success && (
          <>
            <h1 className="font-serif text-3xl font-light">Einladung angenommen</h1>
            <p className="text-text-secondary">Sie sind jetzt Mitglied des Workspaces.</p>
            <Link href="/dashboard" className="inline-block text-sm text-brand hover:underline">
              Zum Dashboard →
            </Link>
          </>
        )}
        {result.needsSignup && (
          <>
            <h1 className="font-serif text-3xl font-light">Account erstellen</h1>
            <p className="text-text-secondary">
              Sie wurden eingeladen. Bitte registrieren Sie sich mit <strong>{result.email}</strong>, um beizutreten.
            </p>
            <Link
              href={`/register?invite=${token}&email=${encodeURIComponent(result.email!)}`}
              className="inline-block px-6 py-2.5 bg-ink text-cream rounded text-sm hover:bg-teal transition-colors"
            >
              Registrieren
            </Link>
          </>
        )}
        {result.error && (
          <>
            <h1 className="font-serif text-3xl font-light">Einladung ungültig</h1>
            <p className="text-danger text-sm">{result.error}</p>
            <Link href="/login" className="inline-block text-sm text-brand hover:underline">
              Zum Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
```

### Update: `app/doc/[slug]/page.tsx` — Slug-Redirect am Anfang

```typescript
import { notFound, redirect } from "next/navigation";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";
import { resolveSlugRedirect } from "@/lib/queries/settings";
// ... rest imports

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { slug } = await params;

  // Erst direkter Match
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    // Check Slug-History für Redirect
    const newSlug = await resolveSlugRedirect(slug);
    if (newSlug) {
      redirect(`/doc/${newSlug}`);
    }
    notFound();
  }

  // ... rest der Funktion
}
```

Das gleiche analog in `app/doc/[slug]/upload/page.tsx`, `app/doc/[slug]/journal/page.tsx`, `app/doc/[slug]/journal/[articleSlug]/page.tsx` — jeweils am Anfang Slug-Redirect-Check.

### Optional: Logo und Accent-Color im EditorialProfile nutzen

In `components/profile-preview/editorial-profile.tsx`:

- Wenn `data.logo_url` gesetzt: Header zeigt Logo statt `practice_name`-Text
- Wenn `data.accent_color` gesetzt: CSS-Custom-Property setzen und in CTA-Button + Hover-States nutzen

Das ist UI-Polish, kann Cursor pragmatisch umsetzen. Hinweis:

```typescript
<div style={{ "--brand-accent": data.accent_color } as any}>
  {/* CTA-Button nutzt var(--brand-accent) statt fest #0F6E56 */}
</div>
```

---

## Schritt 14 — Commit

```bash
git add .
git commit -m "feat: phase 10 — settings with terminlink, slug, team, branding"
```

---

## Schritt 15 — STOP (MENSCHLICHE SCHRITTE)

Melde dem Menschen:

"Phase 10 Code ist fertig. Du musst **drei Dinge manuell** tun.

### 1. Migration 015 in Supabase ausführen

Inhalt aus `supabase/migrations/015_extend_settings.sql` kopieren und im SQL Editor ausführen.

Falls Fehler: erst alle vorhandenen Policies mit `DROP POLICY IF EXISTS ...` löschen und dann neu erstellen.

Zum Schluss nicht vergessen:
```sql
NOTIFY pgrst, 'reload schema';
```

### 2. Neuer Storage-Bucket `branding-assets`

In Supabase Storage → New bucket:
- Name: `branding-assets`
- Public bucket: **AN**
- File size limit: **5 MB**
- Allowed MIME types: `image/png, image/jpeg, image/webp, image/svg+xml`

Dann 4 Policies (gleich wie bei journal-covers):
- Public read, Authenticated upload/update/delete — jeweils mit `bucket_id = 'branding-assets'`

### 3. Dev-Server neu starten und testen

- Terminlink: `/settings` → Terminlink eintragen → Speichern
- Slug: Ändern auf z.B. `test-slug`, bestätigen, alten Link `/doc/cyrus-alamouti` öffnen → Redirect prüfen
- Team: Einladung an eine E-Mail-Adresse schicken, E-Mail checken, Link öffnen → Accept-Seite
- Branding: Logo hochladen, Farbe ändern, öffentliches Profil prüfen
- Logout unten auf Settings"

---

## Bekannte Probleme und Hinweise

**E-Mail für Registration:** Wenn der eingeladene User sich neu registriert, muss der Invite-Token mitgegeben werden. `app/register/page.tsx` muss Token aus URL lesen und nach erfolgreicher Registration die Invitation annehmen. Das ist nicht Teil dieses Plans — einfache Lösung: nach Registration automatisch `acceptInvitation(token)` aufrufen.

**Slug-Redirect und Cache:** Next.js cached öffentliche Seiten. Wenn du Slug änderst, kann der alte Link aus dem Cache ausgeliefert werden. `revalidatePath` wird für den alten Slug aufgerufen, das sollte reichen.

**Accent-Color wird auf Hover-States nicht automatisch angewendet:** Der Button-Hover hat fest `hover:bg-teal`. Für vollständige Akzent-Farbe müsste Tailwind auf CSS-Variable umgestellt werden. Für MVP: CTA-Hintergrund nutzt `bg-brand` (Tailwind-Token), und `brand` als CSS-Variable überschreibbar.

**Team-Count:** Aktuell kann unbegrenzt eingeladen werden. Für Free-Plan könnte in Phase 14 ein Limit eingebaut werden.

---

*Ende Phase 10*
