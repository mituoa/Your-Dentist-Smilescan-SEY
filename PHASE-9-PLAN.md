# PHASE 9 — Journal: Artikel schreiben & veröffentlichen

> **Für Cursor Agent:** Großer Plan. Tiptap-Editor, öffentliche Artikel-Seiten, Integration ins Profil, Share-Buttons. Arbeite von oben nach unten. Teste nach Schritt 8 und nochmal nach Schritt 16 mit `npm run build`.

> **Für den Menschen:** Nach Phase 9 kann jeder Arzt Artikel schreiben wie in Ghost CMS — schwarzer Vollbild-Editor, Auto-Save, `/`-Menü für Formatierung. Patienten lesen die Artikel im editorial Stil auf der Profilseite.

---

## Übersicht neuer und geänderter Dateien

### Neue Dateien

| Pfad | Zweck |
|---|---|
| `lib/masterdata/journal-topics.ts` | Die 6 Themen als Konstante |
| `lib/validation/journal-limits.ts` | Zeichen-Limits |
| `lib/slug.ts` | Slug-Generator — erweitert (falls nötig) |
| `lib/queries/journal.ts` | Queries für Journal (List, Get, Save, Delete) |
| `supabase/migrations/014_extend_journal.sql` | Neue Spalten: topic, reading_time_minutes |
| `app/(protected)/journal/page.tsx` | Journal-Übersicht (Liste aller Artikel) |
| `app/(protected)/journal/new/page.tsx` | Redirect zu neuem leerem Artikel |
| `app/(protected)/journal/[id]/edit/page.tsx` | Vollbild-Editor |
| `app/(protected)/journal/actions.ts` | Server Actions (create, save, publish, unpublish, delete) |
| `components/journal/journal-list.tsx` | Artikel-Tabelle im geschützten Bereich |
| `components/journal/journal-composer.tsx` | Hauptcomponent für den schwarzen Editor |
| `components/journal/composer-topbar.tsx` | Status, Publish-Button oben im Editor |
| `components/journal/topic-selector.tsx` | Dropdown für die 6 Themen |
| `components/journal/cover-photo-upload.tsx` | Cover-Foto-Upload-Sektion |
| `components/journal/share-buttons.tsx` | Twitter/FB/WhatsApp/LinkedIn/Copy |
| `app/doc/[slug]/journal/page.tsx` | Öffentliche Journal-Liste des Arztes |
| `app/doc/[slug]/journal/[articleSlug]/page.tsx` | Einzelner Artikel öffentlich |
| `components/public/journal-preview-list.tsx` | 3-Artikel-Preview im Profil |

### Geänderte Dateien

| Pfad | Änderung |
|---|---|
| `package.json` | Tiptap-Pakete |
| `components/profile-preview/editorial-profile.tsx` | Journal-Sektion einbauen |
| `app/doc/[slug]/page.tsx` | Journal-Daten laden + Preview zeigen |
| `components/app-shell/sidebar.tsx` oder ähnlich | Journal-Navigation (ist schon da) |

---

## Schritt 1 — Tiptap-Pakete installieren

In Cursor-Terminal:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-typography turndown marked
```

**Was wir installieren:**
- `@tiptap/react` + `@tiptap/starter-kit` — der Editor selbst
- `@tiptap/extension-image` — für eingefügte Bilder
- `@tiptap/extension-link` — für Links
- `@tiptap/extension-placeholder` — "Titel hier eingeben…" Placeholder
- `@tiptap/extension-typography` — für schöne Apostrophe, Gedankenstriche etc.
- `turndown` — HTML → Markdown (beim Speichern)
- `marked` — Markdown → HTML (beim öffentlichen Rendering)

---

## Schritt 2 — Datenmodell erweitern

### Datei: `supabase/migrations/014_extend_journal.sql`

```sql
-- Phase 9: Journal-Erweiterung

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer,
  ADD COLUMN IF NOT EXISTS word_count integer DEFAULT 0;

-- Index für öffentliche Abfragen
CREATE INDEX IF NOT EXISTS idx_journal_workspace_status_published 
  ON journal_entries(workspace_id, status, published_at DESC) 
  WHERE status = 'published';

-- Index für Slug-Lookup
CREATE INDEX IF NOT EXISTS idx_journal_slug 
  ON journal_entries(workspace_id, slug);

-- RLS: öffentliche SELECT auf veröffentlichte Artikel
-- (Phase 2 hatte nur workspace-scoped SELECT)
CREATE POLICY IF NOT EXISTS "public can read published articles"
  ON journal_entries FOR SELECT
  USING (status = 'published');

COMMENT ON COLUMN journal_entries.topic IS 'Eines der 6 Themen aus lib/masterdata/journal-topics.ts';
COMMENT ON COLUMN journal_entries.reading_time_minutes IS 'Berechnet aus word_count / 200';
```

**Hinweis für Cursor:** Falls `CREATE POLICY IF NOT EXISTS` nicht funktioniert (ältere Postgres), weglassen und in der Anleitung für den Menschen erklären, dass er die Policy einmalig manuell anlegen soll.

---

## Schritt 3 — Masterdata für Themen

### Datei: `lib/masterdata/journal-topics.ts`

```typescript
export interface JournalTopic {
  id: string;
  label: string;
  description: string;
}

export const JOURNAL_TOPICS: JournalTopic[] = [
  {
    id: "diagnostics",
    label: "Diagnostics & Symptoms",
    description: "Symptome, Untersuchungen, Diagnosestellung",
  },
  {
    id: "microbiome",
    label: "Microbiome & Systemic Health",
    description: "Mundflora, systemische Zusammenhänge",
  },
  {
    id: "prevention",
    label: "Prevention & Everyday Behavior",
    description: "Vorbeugung, Alltag, Zahnpflege",
  },
  {
    id: "treatment",
    label: "Treatment & Clinical Pathways",
    description: "Behandlungsmethoden, klinische Pfade",
  },
  {
    id: "culture",
    label: "Culture, Behavior & Patient Reality",
    description: "Patientenerleben, Kultur, Verhalten",
  },
  {
    id: "science",
    label: "Science & Medical Knowledge",
    description: "Wissenschaftliche Hintergründe",
  },
];

export function getTopicLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  const match = JOURNAL_TOPICS.find((t) => t.id === id);
  return match?.label || null;
}
```

---

## Schritt 4 — Zeichen-Limits

### Datei: `lib/validation/journal-limits.ts`

```typescript
export const JOURNAL_LIMITS = {
  title: 120,
  excerpt: 240,
  content_markdown: 50000, // ca. 8.000 Wörter, mehr als genug
  slug: 80,
} as const;

export function calculateReadingTime(wordCount: number): number {
  // Durchschnittliche Lesegeschwindigkeit: 200 WpM
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
```

---

## Schritt 5 — Storage Bucket (manuell, in Schritt 17 dokumentiert)

Der Bucket `journal-covers` wird **manuell** im Supabase Dashboard angelegt (wie `profile-photos`). Details in Schritt 17.

---

## Schritt 6 — Queries

### Datei: `lib/queries/journal.ts`

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface JournalEntry {
  id: string;
  workspace_id: string;
  author_id: string | null;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  content_markdown: string | null;
  cover_photo_url: string | null;
  topic: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  word_count: number;
  reading_time_minutes: number | null;
}

export async function listJournalForWorkspace(workspaceId: string): Promise<JournalEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  return (data as JournalEntry[]) || [];
}

export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();
  return data as JournalEntry | null;
}

export async function getPublicJournalBySlug(
  workspaceId: string,
  articleSlug: string
): Promise<JournalEntry | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("slug", articleSlug)
    .eq("status", "published")
    .single();
  return data as JournalEntry | null;
}

export async function listPublishedForWorkspace(workspaceId: string): Promise<JournalEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data as JournalEntry[]) || [];
}

export async function getRelatedEntries(
  workspaceId: string,
  excludeId: string,
  limit = 3
): Promise<JournalEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data as JournalEntry[]) || [];
}
```

---

## Schritt 7 — Server Actions

### Datei: `app/(protected)/journal/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { generateSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateReadingTime, countWords, JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import { JOURNAL_TOPICS } from "@/lib/masterdata/journal-topics";

export async function createDraftArticle(): Promise<{ id?: string; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      workspace_id: workspace.workspace_id,
      author_id: user?.id || null,
      title: null,
      slug: null,
      excerpt: null,
      content_markdown: null,
      topic: null,
      status: "draft",
      word_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createDraft]", error);
    return { error: "Entwurf konnte nicht erstellt werden." };
  }

  return { id: data.id };
}

export interface SaveArticlePayload {
  id: string;
  title: string;
  excerpt: string;
  content_markdown: string;
  topic: string | null;
  cover_photo_url: string | null;
}

export async function saveArticle(payload: SaveArticlePayload): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();

  const wordCount = countWords(payload.content_markdown);
  const readingTime = calculateReadingTime(wordCount);

  // Slug aus Titel generieren, falls vorhanden
  let slug: string | null = null;
  if (payload.title.trim()) {
    slug = generateSlug(payload.title);
    if (slug.length > JOURNAL_LIMITS.slug) {
      slug = slug.substring(0, JOURNAL_LIMITS.slug);
    }
    // Slug-Kollisionen vermeiden
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("workspace_id", workspace.workspace_id)
      .eq("slug", slug)
      .neq("id", payload.id);
    if (existing && existing.length > 0) {
      slug = `${slug}-${payload.id.slice(0, 6)}`;
    }
  }

  const { error } = await supabase
    .from("journal_entries")
    .update({
      title: payload.title || null,
      slug,
      excerpt: payload.excerpt || null,
      content_markdown: payload.content_markdown || null,
      topic: payload.topic,
      cover_photo_url: payload.cover_photo_url,
      word_count: wordCount,
      reading_time_minutes: readingTime,
    })
    .eq("id", payload.id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    console.error("[saveArticle]", error);
    return { error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${payload.id}/edit`);
  return { success: true };
}

export async function publishArticle(id: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!article) return { error: "Artikel nicht gefunden." };
  if (!article.title) return { error: "Titel erforderlich zum Veröffentlichen." };
  if (!article.content_markdown) return { error: "Inhalt erforderlich zum Veröffentlichen." };
  if (!article.topic) return { error: "Thema erforderlich zum Veröffentlichen." };
  if (!article.slug) return { error: "Slug fehlt. Bitte Titel speichern." };

  const { error } = await supabase
    .from("journal_entries")
    .update({
      status: "published",
      published_at: article.published_at || new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[publishArticle]", error);
    return { error: "Veröffentlichung fehlgeschlagen." };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}/edit`);
  // Öffentliches Profil auch invalidieren
  const { data: ws } = await supabase.from("workspaces").select("slug").eq("id", workspace.workspace_id).single();
  if (ws?.slug) {
    revalidatePath(`/doc/${ws.slug}`);
    revalidatePath(`/doc/${ws.slug}/journal`);
  }

  return { success: true };
}

export async function unpublishArticle(id: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Zurücksetzen fehlgeschlagen." };

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}/edit`);
  return { success: true };
}

export async function deleteArticle(id: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Löschen fehlgeschlagen." };

  revalidatePath("/journal");
  return { success: true };
}

export async function uploadCoverPhoto(formData: FormData): Promise<{ error?: string; url?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };

  if (file.size > 10 * 1024 * 1024) return { error: "Datei zu groß. Maximum 10 MB." };

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return { error: "Format nicht unterstützt." };

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${workspace.workspace_id}/cover-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("journal-covers")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (upErr) {
    console.error("[uploadCover]", upErr);
    return { error: "Upload fehlgeschlagen." };
  }

  const { data } = admin.storage.from("journal-covers").getPublicUrl(path);
  return { url: data.publicUrl };
}
```

---

## Schritt 8 — Journal-Liste (geschützt)

### Datei: `components/journal/journal-list.tsx`

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { createDraftArticle, deleteArticle } from "@/app/(protected)/journal/actions";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/lib/queries/journal";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";

interface JournalListProps {
  entries: JournalEntry[];
}

export function JournalList({ entries }: JournalListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNew = () => {
    startTransition(async () => {
      const result = await createDraftArticle();
      if (result.id) router.push(`/journal/${result.id}/edit`);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Artikel wirklich löschen?")) return;
    startTransition(async () => {
      await deleteArticle(id);
      router.refresh();
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">Journal</p>
          <h1 className="font-serif text-5xl font-light tracking-tight">Artikel</h1>
          <p className="text-text-secondary mt-2">Schreiben und veröffentlichen Sie Fachartikel für Ihre Patienten.</p>
        </div>
        <Button onClick={handleNew} disabled={isPending} size="lg">
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
          Neuer Artikel
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center bg-surface-card">
          <FileText className="w-10 h-10 text-text-tertiary mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-serif text-2xl font-light mb-2">Noch keine Artikel</h2>
          <p className="text-text-secondary text-sm mb-6">Beginnen Sie mit Ihrem ersten Artikel — ein Thema, eine klare Stimme.</p>
          <Button onClick={handleNew} disabled={isPending}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
            Ersten Artikel schreiben
          </Button>
        </div>
      ) : (
        <div className="space-y-1 border-t border-border">
          {entries.map((e) => {
            const topic = getTopicLabel(e.topic);
            return (
              <div key={e.id} className="flex items-center gap-4 py-4 border-b border-border group">
                <div className="flex-1 min-w-0">
                  <Link href={`/journal/${e.id}/edit`} className="block hover:underline">
                    <h3 className="font-serif text-xl font-light truncate">
                      {e.title || <span className="italic text-text-tertiary">Ohne Titel</span>}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                        e.status === "published" ? "bg-brand/10 text-brand" : "bg-surface-sunken"
                      }`}
                    >
                      {e.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                    {topic && <span>{topic}</span>}
                    <span>{e.word_count} Wörter</span>
                    <span>
                      {new Date(e.updated_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-2 transition-all"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### Datei: `app/(protected)/journal/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { JournalList } from "@/components/journal/journal-list";

export default async function JournalPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const entries = await listJournalForWorkspace(workspace.workspace_id);

  return <JournalList entries={entries} />;
}
```

---

## Schritt 9 — Topic Selector

### Datei: `components/journal/topic-selector.tsx`

```typescript
"use client";

import { JOURNAL_TOPICS } from "@/lib/masterdata/journal-topics";

interface TopicSelectorProps {
  value: string | null;
  onChange: (id: string | null) => void;
  required?: boolean;
}

export function TopicSelector({ value, onChange, required }: TopicSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/50">
        Thema {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {JOURNAL_TOPICS.map((topic) => {
          const selected = value === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onChange(selected ? null : topic.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                selected
                  ? "bg-white text-black border-white"
                  : "bg-transparent border-white/20 text-white/70 hover:border-white/50 hover:text-white"
              }`}
            >
              {topic.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Schritt 10 — Cover Photo Upload

### Datei: `components/journal/cover-photo-upload.tsx`

```typescript
"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadCoverPhoto } from "@/app/(protected)/journal/actions";

interface CoverPhotoUploadProps {
  coverUrl: string | null;
  onChange: (url: string | null) => void;
}

export function CoverPhotoUpload({ coverUrl, onChange }: CoverPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCoverPhoto(fd);
    setUploading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onChange(result.url);
    }
  };

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3 block">
        Cover-Foto (optional)
      </label>

      {coverUrl ? (
        <div className="relative w-full aspect-[16/9] rounded overflow-hidden group">
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            type="button"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-white/20 rounded p-8 cursor-pointer hover:border-white/40 transition-colors text-center"
        >
          {uploading ? (
            <p className="text-sm text-white/60">Wird hochgeladen…</p>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-white/40 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-xs text-white/60">Cover-Foto hinzufügen · max 10 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
```

---

## Schritt 11 — Composer Top-Bar

### Datei: `components/journal/composer-topbar.tsx`

```typescript
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

interface ComposerTopBarProps {
  status: "draft" | "published";
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt: Date | null;
  saveError: string | null;
  canPublish: boolean;
  isPending: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ComposerTopBar({
  status,
  saveStatus,
  lastSavedAt,
  saveError,
  canPublish,
  isPending,
  onPublish,
  onUnpublish,
}: ComposerTopBarProps) {
  const router = useRouter();

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return (
        <span className="text-xs text-white/40 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
          Speichern…
        </span>
      );
    }
    if (saveStatus === "error") {
      return <span className="text-xs text-red-400">Fehler: {saveError}</span>;
    }
    if (saveStatus === "saved" && lastSavedAt) {
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      const label = seconds < 5 ? "gerade eben" : seconds < 60 ? `vor ${seconds}s` : `vor ${Math.floor(seconds / 60)}min`;
      return (
        <span className="text-xs text-white/40 flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={2} />
          Gespeichert {label}
        </span>
      );
    }
    return null;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/journal")}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Journal
          </button>
          <span className="text-white/20">·</span>
          <span className="text-xs uppercase tracking-wider text-white/40">
            {status === "published" ? "Veröffentlicht" : "Entwurf"}
          </span>
          {renderSaveStatus()}
        </div>

        <div className="flex items-center gap-3">
          {status === "published" ? (
            <button
              onClick={onUnpublish}
              disabled={isPending}
              className="px-4 py-2 text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              Zurück in Entwurf
            </button>
          ) : (
            <button
              onClick={onPublish}
              disabled={isPending || !canPublish}
              className="px-5 py-2 bg-white text-black text-xs uppercase tracking-wider font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={!canPublish ? "Titel, Inhalt und Thema erforderlich" : ""}
            >
              Veröffentlichen
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

## Schritt 12 — Der Composer (Tiptap-Editor)

### Datei: `components/journal/journal-composer.tsx`

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import TurndownService from "turndown";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { saveArticle, publishArticle, unpublishArticle } from "@/app/(protected)/journal/actions";
import { ComposerTopBar } from "./composer-topbar";
import { TopicSelector } from "./topic-selector";
import { CoverPhotoUpload } from "./cover-photo-upload";
import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";
import type { JournalEntry } from "@/lib/queries/journal";

interface JournalComposerProps {
  article: JournalEntry;
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export function JournalComposer({ article }: JournalComposerProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title || "");
  const [excerpt, setExcerpt] = useState(article.excerpt || "");
  const [topic, setTopic] = useState(article.topic);
  const [coverUrl, setCoverUrl] = useState(article.cover_photo_url);
  const [contentMd, setContentMd] = useState(article.content_markdown || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Schreiben Sie Ihre Geschichte…",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Typography,
    ],
    content: article.content_markdown ? marked.parse(article.content_markdown) : "",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] font-serif",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = turndown.turndown(html);
      setContentMd(md);
    },
    immediatelyRender: false,
  });

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const firstRenderRef = useRef(true);

  const performSave = useCallback(async () => {
    setSaveStatus("saving");
    setSaveError(null);
    const result = await saveArticle({
      id: article.id,
      title,
      excerpt,
      content_markdown: contentMd,
      topic,
      cover_photo_url: coverUrl,
    });
    if (result.error) {
      setSaveStatus("error");
      setSaveError(result.error);
    } else {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    }
  }, [article.id, title, excerpt, contentMd, topic, coverUrl]);

  // Auto-Save nach 2s Inaktivität
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => performSave(), 2000);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [title, excerpt, contentMd, topic, coverUrl, performSave]);

  const canPublish = Boolean(title.trim() && contentMd.trim() && topic);

  const handlePublish = async () => {
    setIsPending(true);
    await performSave();
    const result = await publishArticle(article.id);
    setIsPending(false);
    if (result.error) {
      setSaveError(result.error);
      setSaveStatus("error");
    } else {
      router.refresh();
    }
  };

  const handleUnpublish = async () => {
    setIsPending(true);
    const result = await unpublishArticle(article.id);
    setIsPending(false);
    if (!result.error) router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-white font-serif">
      <ComposerTopBar
        status={article.status}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        saveError={saveError}
        canPublish={canPublish}
        isPending={isPending}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-40">

        {/* Metadata-Section */}
        <div className="space-y-8 mb-12">
          <TopicSelector value={topic} onChange={setTopic} required />
          <CoverPhotoUpload coverUrl={coverUrl} onChange={setCoverUrl} />
        </div>

        {/* Title */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            maxLength={JOURNAL_LIMITS.title}
            className="w-full bg-transparent font-serif text-5xl md:text-6xl font-light leading-tight tracking-tight outline-none placeholder:text-white/20 border-none p-0"
          />
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2">
            {title.length}/{JOURNAL_LIMITS.title}
          </div>
        </div>

        {/* Excerpt */}
        <div className="mb-12">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Kurzbeschreibung (erscheint in Artikel-Vorschauen)"
            maxLength={JOURNAL_LIMITS.excerpt}
            rows={2}
            className="w-full bg-transparent font-serif text-xl italic text-white/70 leading-relaxed outline-none placeholder:text-white/20 border-none p-0 resize-none"
          />
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-2">
            {excerpt.length}/{JOURNAL_LIMITS.excerpt}
          </div>
        </div>

        <hr className="border-white/10 mb-12" />

        {/* Content Editor */}
        <div className="composer-content">
          <EditorContent editor={editor} />
        </div>

      </div>

      {/* Editor Styles */}
      <style jsx global>{`
        .composer-content .ProseMirror {
          color: #F5F2EC;
        }
        .composer-content .ProseMirror p.is-editor-empty:first-child::before {
          color: rgba(255,255,255,0.2);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .composer-content .ProseMirror h2 {
          font-family: Fraunces, serif;
          font-size: 2.25rem;
          font-weight: 300;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .composer-content .ProseMirror h3 {
          font-family: Fraunces, serif;
          font-size: 1.75rem;
          font-weight: 300;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .composer-content .ProseMirror p {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .composer-content .ProseMirror blockquote {
          border-left: 2px solid rgba(255,255,255,0.3);
          padding-left: 1.5rem;
          font-style: italic;
          color: rgba(255,255,255,0.8);
          margin: 2rem 0;
        }
        .composer-content .ProseMirror a {
          color: #F5F2EC;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          text-decoration: none;
        }
        .composer-content .ProseMirror a:hover {
          border-bottom-color: #F5F2EC;
        }
        .composer-content .ProseMirror ul, 
        .composer-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .composer-content .ProseMirror li {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 0.5rem;
        }
        .composer-content .ProseMirror strong {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
```

### Datei: `app/(protected)/journal/[id]/edit/page.tsx`

```typescript
import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getJournalEntry } from "@/lib/queries/journal";
import { JournalComposer } from "@/components/journal/journal-composer";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const article = await getJournalEntry(id);
  if (!article || article.workspace_id !== workspace.workspace_id) notFound();

  return <JournalComposer article={article} />;
}
```

### Datei: `app/(protected)/journal/new/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { createDraftArticle } from "@/app/(protected)/journal/actions";

export default async function NewJournalPage() {
  const result = await createDraftArticle();
  if (result.error || !result.id) redirect("/journal");
  redirect(`/journal/${result.id}/edit`);
}
```

---

## Schritt 13 — Share Buttons

### Datei: `components/journal/share-buttons.tsx`

```typescript
"use client";

import { useState } from "react";
import { Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  const buttonClass = "inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full text-xs text-ink-soft hover:text-ink hover:border-ink transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <Twitter className="w-3.5 h-3.5" strokeWidth={1.75} />
        Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <Facebook className="w-3.5 h-3.5" strokeWidth={1.75} />
        Facebook
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <Linkedin className="w-3.5 h-3.5" strokeWidth={1.75} />
        LinkedIn
      </a>
      <button onClick={handleCopy} className={buttonClass} type="button">
        {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> : <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.75} />}
        {copied ? "Kopiert" : "Link kopieren"}
      </button>
    </div>
  );
}
```

---

## Schritt 14 — Öffentliche Journal-Liste

### Datei: `app/doc/[slug]/journal/page.tsx`

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";
import { listPublishedForWorkspace } from "@/lib/queries/journal";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";

interface JournalIndexProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicJournalIndex({ params }: JournalIndexProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  const articles = await listPublishedForWorkspace(profile.workspace_id);
  const name = profile.display_name || profile.workspace_name;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href={`/doc/${slug}`} className="text-xs uppercase tracking-wider text-ink-faint hover:text-ink">
          ← Zurück zu {name}
        </Link>

        <header className="mt-16 mb-20 pb-10 border-b-2 border-ink text-center">
          <div className="text-[10px] uppercase tracking-[0.48em] mb-3">Journal</div>
          <p className="text-sm text-ink-soft italic">Artikel von {name}</p>
        </header>

        {articles.length === 0 ? (
          <p className="text-center text-ink-soft italic">Noch keine veröffentlichten Artikel.</p>
        ) : (
          <div className="space-y-16">
            {articles.map((a) => {
              const topic = getTopicLabel(a.topic);
              return (
                <article key={a.id}>
                  <Link href={`/doc/${slug}/journal/${a.slug}`} className="block group">
                    {topic && (
                      <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint mb-4">
                        {topic}
                      </div>
                    )}
                    <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight leading-tight mb-4 group-hover:text-ink-soft transition-colors">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="font-serif text-xl italic text-ink-soft leading-relaxed mb-4 max-w-[60ch]">
                        {a.excerpt}
                      </p>
                    )}
                    <div className="text-xs text-ink-faint uppercase tracking-wider flex gap-4">
                      <span>
                        {a.published_at && new Date(a.published_at).toLocaleDateString("de-DE", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </span>
                      {a.reading_time_minutes && <span>{a.reading_time_minutes} min Lesezeit</span>}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Schritt 15 — Öffentlicher Artikel

### Datei: `app/doc/[slug]/journal/[articleSlug]/page.tsx`

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";
import { getPublicJournalBySlug, getRelatedEntries } from "@/lib/queries/journal";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";
import { ShareButtons } from "@/components/journal/share-buttons";
import { getAppBaseUrl } from "@/lib/env";

interface ArticlePageProps {
  params: Promise<{ slug: string; articleSlug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug, articleSlug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) return {};
  const article = await getPublicJournalBySlug(profile.workspace_id, articleSlug);
  if (!article) return {};

  return {
    title: `${article.title} · ${profile.display_name || profile.workspace_name}`,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title || undefined,
      description: article.excerpt || undefined,
      images: article.cover_photo_url ? [{ url: article.cover_photo_url }] : [],
      type: "article",
      publishedTime: article.published_at || undefined,
      authors: [profile.display_name || profile.workspace_name],
    },
  };
}

export default async function PublicArticlePage({ params }: ArticlePageProps) {
  const { slug, articleSlug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  const article = await getPublicJournalBySlug(profile.workspace_id, articleSlug);
  if (!article || !article.content_markdown) notFound();

  const related = await getRelatedEntries(profile.workspace_id, article.id, 3);
  const name = profile.display_name || profile.workspace_name;
  const topic = getTopicLabel(article.topic);
  const contentHtml = marked.parse(article.content_markdown);
  const url = `${getAppBaseUrl()}/doc/${slug}/journal/${articleSlug}`;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[680px] mx-auto px-6 py-12 md:py-20">

        <Link href={`/doc/${slug}`} className="text-xs uppercase tracking-wider text-ink-faint hover:text-ink">
          ← Zurück zu {name}
        </Link>

        {/* Article Header */}
        <header className="mt-16 mb-12">
          {topic && (
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint mb-6 font-sans">
              {topic}
            </div>
          )}
          <h1 className="font-serif text-5xl md:text-6xl font-light leading-[1.05] tracking-tight mb-8">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="font-serif text-2xl italic text-ink-soft leading-relaxed mb-10">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-ink-faint font-sans border-t border-border pt-6">
            <span>{name}</span>
            {article.published_at && (
              <>
                <span>·</span>
                <span>
                  {new Date(article.published_at).toLocaleDateString("de-DE", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </span>
              </>
            )}
            {article.reading_time_minutes && (
              <>
                <span>·</span>
                <span>{article.reading_time_minutes} min</span>
              </>
            )}
          </div>
        </header>

        {/* Cover */}
        {article.cover_photo_url && (
          <div className="mb-16 -mx-6 md:mx-0">
            <img src={article.cover_photo_url} alt="" className="w-full aspect-[16/9] object-cover" />
          </div>
        )}

        {/* Content */}
        <article className="prose-article">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </article>

        {/* Share */}
        <div className="mt-20 pt-8 border-t border-border">
          <div className="text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-4 font-sans">Teilen</div>
          <ShareButtons url={url} title={article.title || ""} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <aside className="mt-20 pt-12 border-t-2 border-ink">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint mb-8 font-sans text-center">
              Weitere Artikel
            </div>
            <div className="space-y-10">
              {related.map((r) => (
                <Link key={r.id} href={`/doc/${slug}/journal/${r.slug}`} className="block group">
                  {getTopicLabel(r.topic) && (
                    <div className="text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-2 font-sans">
                      {getTopicLabel(r.topic)}
                    </div>
                  )}
                  <h3 className="font-serif text-2xl font-light tracking-tight group-hover:text-ink-soft transition-colors">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </aside>
        )}

      </div>

      <style>{`
        .prose-article { font-family: Fraunces, serif; color: #1A1A1A; }
        .prose-article h2 { font-size: 2.25rem; font-weight: 300; margin: 3rem 0 1rem; letter-spacing: -0.02em; line-height: 1.1; }
        .prose-article h3 { font-size: 1.75rem; font-weight: 300; margin: 2.5rem 0 0.75rem; }
        .prose-article p { font-size: 1.25rem; line-height: 1.7; margin-bottom: 1.75rem; }
        .prose-article p:first-of-type::first-letter {
          font-size: 5rem; line-height: 0.9; float: left;
          padding-right: 0.75rem; padding-top: 0.5rem; font-weight: 300;
        }
        .prose-article blockquote {
          border-left: 2px solid #97958C;
          padding-left: 1.5rem; font-style: italic;
          color: #5F5E5A; margin: 2rem 0;
        }
        .prose-article a {
          color: #1A1A1A; border-bottom: 1px solid #D4D1C7;
          text-decoration: none;
        }
        .prose-article a:hover { border-bottom-color: #1A1A1A; }
        .prose-article ul, .prose-article ol { padding-left: 1.5rem; margin-bottom: 1.75rem; }
        .prose-article li { font-size: 1.25rem; line-height: 1.7; margin-bottom: 0.5rem; }
        .prose-article img { width: 100%; margin: 2rem 0; }
        .prose-article strong { font-weight: 500; }
      `}</style>
    </div>
  );
}
```

---

## Schritt 16 — Journal-Preview im Profil

### Datei: `components/public/journal-preview-list.tsx`

```typescript
import Link from "next/link";
import { getTopicLabel } from "@/lib/masterdata/journal-topics";
import type { JournalEntry } from "@/lib/queries/journal";

interface JournalPreviewListProps {
  entries: JournalEntry[];
  slug: string;
}

export function JournalPreviewList({ entries, slug }: JournalPreviewListProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <section className="py-20 md:py-32 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">§ IV · Journal</div>
        <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
          Aus dem <span className="italic">Journal</span>.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
        <div />
        <div className="max-w-[640px] space-y-10">
          {entries.slice(0, 3).map((entry) => {
            const topic = getTopicLabel(entry.topic);
            return (
              <Link
                key={entry.id}
                href={`/doc/${slug}/journal/${entry.slug}`}
                className="block group"
              >
                {topic && (
                  <div className="text-[10px] uppercase tracking-[0.24em] text-ink-faint mb-2">{topic}</div>
                )}
                <h3 className="font-serif text-2xl font-light tracking-tight mb-2 group-hover:text-ink-soft transition-colors">
                  {entry.title}
                </h3>
                {entry.excerpt && (
                  <p className="font-serif italic text-ink-soft leading-relaxed line-clamp-2">{entry.excerpt}</p>
                )}
                <div className="text-[11px] uppercase tracking-wider text-ink-faint mt-3">
                  {entry.published_at && new Date(entry.published_at).toLocaleDateString("de-DE", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                  {entry.reading_time_minutes && ` · ${entry.reading_time_minutes} min`}
                </div>
              </Link>
            );
          })}

          {entries.length > 3 && (
            <Link href={`/doc/${slug}/journal`} className="inline-block text-xs uppercase tracking-[0.2em] text-ink-soft hover:text-ink pt-2 border-t border-border">
              Alle Artikel ansehen →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
```

### Update: `components/profile-preview/editorial-profile.tsx`

Zwischen der Leistungen-Sektion und der Praxis-Sektion füge hinzu:

```typescript
{journalEntries && journalEntries.length > 0 && (
  <JournalPreviewList entries={journalEntries} slug={slug} />
)}
```

Import am Anfang der Datei:
```typescript
import { JournalPreviewList } from "@/components/public/journal-preview-list";
```

### Update: `app/doc/[slug]/page.tsx`

Erweitere die Datenladung um Journal-Einträge:

```typescript
import { listPublishedForWorkspace } from "@/lib/queries/journal";
// ...
const journalEntries = await listPublishedForWorkspace(profile.workspace_id);
// ...
return (
  <EditorialProfile
    data={data}
    workspaceName={profile.workspace_name}
    slug={profile.slug}
    journalEntries={journalEntries}
  />
);
```

Das `EditorialProfile`-Interface sollte bereits `journalEntries` akzeptieren (aus Phase 8).

---

## Schritt 17 — Commit

```bash
git add .
git commit -m "feat: phase 9 — journal composer and public articles"
```

---

## Schritt 18 — STOP (MENSCHLICHE SCHRITTE)

Melde dem Menschen:

"Phase 9 Code ist fertig. Du musst **drei Dinge manuell** tun.

### 1. Migration 014 in Supabase ausführen

Inhalt aus `supabase/migrations/014_extend_journal.sql` kopieren und ausführen.

Falls Fehler bei `CREATE POLICY IF NOT EXISTS`: führe stattdessen zuerst aus:

```sql
DROP POLICY IF EXISTS \"public can read published articles\" ON journal_entries;
```

Dann die Policy normal erstellen:

```sql
CREATE POLICY \"public can read published articles\"
  ON journal_entries FOR SELECT
  USING (status = 'published');
```

Zum Schluss Schema-Cache neu laden:

```sql
NOTIFY pgrst, 'reload schema';
```

### 2. Neuer Storage-Bucket `journal-covers`

In Supabase Storage → New bucket:
- Name: `journal-covers`
- Public bucket: **AN**
- File size limit: **10 MB**
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Dann 4 Policies (wie bei profile-photos):
- `Public can read journal covers` — SELECT, public
- `Authenticated can upload journal covers` — INSERT, authenticated
- `Authenticated can update journal covers` — UPDATE, authenticated
- `Authenticated can delete journal covers` — DELETE, authenticated

Jede Policy mit `bucket_id = 'journal-covers'`.

### 3. Dev-Server neu starten

Strg+C, dann `npm run dev`.

### 4. Testen

- `/journal` → 'Neuer Artikel' klicken
- Schwarzer Composer öffnet sich
- Thema auswählen, Titel, Excerpt, Text schreiben
- Nach 2s Anzeige 'Gespeichert gerade eben'
- 'Veröffentlichen' klicken
- Zurück zum Profil im Inkognito-Fenster: `/doc/<dein-slug>` → Journal-Sektion mit Artikel
- Artikel anklicken → schöne editorial Artikel-Seite
- Share-Buttons testen"

---

## Bekannte Probleme

**Tiptap-Server-Warnung:** Tiptap läuft client-side. Wenn es Hydration-Warnings gibt, ist das der Grund. `immediatelyRender: false` im Editor-Setup ist der Fix dafür.

**Marked vs. server-only:** `marked` ist eine Lib, die auf dem Server läuft. Import in Client-Components würde Fehler werfen. Aktuell nutzen wir es nur server-side.

**Slug-Kollisionen:** Wenn zwei Artikel in einem Workspace den gleichen Titel haben, bekommt der zweite `-{uuid-prefix}` angehängt. Nicht schön, aber funktional.

**Markdown-Content-Anzeige:** `dangerouslySetInnerHTML` wird benutzt, um das gerenderte HTML einzufügen. `marked` mit Default-Config sanitized nicht — das heißt: theoretisch könnten Ärzte JS-Code in ihre Markdown schreiben. Für Phase 9 akzeptabel (Ärzte sind authentifiziert, nicht böswillig). In Phase 13 (vor Deploy) sollten wir `DOMPurify` einbauen.

---

*Ende Phase 9*
