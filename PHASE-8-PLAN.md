# PHASE 8 — Profile Editor mit Live-Preview

> **Für Cursor Agent:** Das ist der komplexeste Plan bisher. Zwei große Masterlisten, erweitertes Datenmodell, Editor mit Live-Preview, neue öffentliche Sektion für Schwerpunkte. Halte dich exakt an diese Reihenfolge. Teste mit `npm run build` NACH jedem großen Schritt.

> **Für den Menschen:** Nach dieser Phase kann der Arzt sein komplettes Profil selbst bearbeiten. Die Seite `/doc/[slug]` wird dann voll ausgefüllt statt fast leer.

---

## Übersicht neuer und geänderter Dateien

### Neue Dateien

| Pfad | Zweck |
|---|---|
| `lib/masterdata/specializations.ts` | 18 Fachgebiete als Konstante |
| `lib/masterdata/services.ts` | 12 Gruppen mit ~80 Dienstleistungen |
| `lib/validation/profile-limits.ts` | Zeichen-Limits pro Feld |
| `lib/queries/profile-editor.ts` | Queries für Editor (Read + Upsert) |
| `supabase/migrations/012_extend_profile_data.sql` | Neue Spalten: first_name, last_name, title, specializations, founding_year |
| `app/(protected)/profile/editor/page.tsx` | Haupt-Editor-Seite |
| `app/(protected)/profile/editor/actions.ts` | Server Actions (Save, Photo-Upload) |
| `components/profile-editor/profile-editor-shell.tsx` | Layout: Editor links, Preview rechts |
| `components/profile-editor/auto-save-indicator.tsx` | "Gespeichert vor 3s" Anzeige |
| `components/profile-editor/section-hero.tsx` | Name/Titel/Gründungsjahr |
| `components/profile-editor/section-vita.tsx` | Vita-Textarea |
| `components/profile-editor/section-specializations.tsx` | Chip-Selector für Schwerpunkte |
| `components/profile-editor/section-services.tsx` | Gestufte Dienstleistungs-Auswahl |
| `components/profile-editor/section-practice.tsx` | Praxis-Info |
| `components/profile-editor/section-photo.tsx` | Portrait-Upload |
| `components/profile-editor/field-with-counter.tsx` | Input + Zeichen-Zähler |
| `components/profile-editor/service-item-editor.tsx` | Einzelne Leistung mit Notiz |
| `components/profile-preview/editorial-profile.tsx` | Das rendern-bare öffentliche Profil (wiederverwendbar) |

### Geänderte Dateien

| Pfad | Änderung |
|---|---|
| `app/(protected)/profile/page.tsx` | Link zu `/profile/editor` hinzufügen |
| `app/doc/[slug]/page.tsx` | Nutzt jetzt `EditorialProfile` Component |
| `lib/queries/public-profile.ts` | Erweitert um neue Felder |
| `supabase/migrations/013_storage_portrait.sql` | Portrait-Bucket-Policies |

---

## Schritt 1 — Datenmodell erweitern

### Datei: `supabase/migrations/012_extend_profile_data.sql`

```sql
-- Erweiterung der profile_data Tabelle für Phase 8

-- Neue Spalten für Name-Split und Titel
ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS founding_year integer,
  ADD COLUMN IF NOT EXISTS specializations jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_structured jsonb DEFAULT '[]'::jsonb;

-- Constraints für sinnvolle Werte
ALTER TABLE profile_data
  ADD CONSTRAINT founding_year_range 
  CHECK (founding_year IS NULL OR (founding_year >= 1900 AND founding_year <= 2100));

-- Migrations-Hinweis für vorhandene display_name Werte:
-- Wir splitten NICHT automatisch, weil das fehleranfällig ist.
-- Der Arzt füllt first_name + last_name beim ersten Editor-Besuch aus.
-- display_name bleibt als Fallback erhalten.

COMMENT ON COLUMN profile_data.specializations IS 'Array von Strings (Fachgebiete). Masterliste in lib/masterdata/specializations.ts';
COMMENT ON COLUMN profile_data.services_structured IS 'Array von Objekten: [{ id: string, name: string, note: string, custom: boolean }]';
```

---

## Schritt 2 — Masterlisten anlegen

### Datei: `lib/masterdata/specializations.ts`

```typescript
export interface SpecializationOption {
  id: string;
  label: string;
}

export const SPECIALIZATION_MASTER: SpecializationOption[] = [
  { id: "general-dentistry", label: "Allgemeine Zahnheilkunde" },
  { id: "orthodontics", label: "Kieferorthopädie" },
  { id: "oral-surgery", label: "Oralchirurgie" },
  { id: "maxillofacial-surgery", label: "Mund-, Kiefer- und Gesichtschirurgie" },
  { id: "pediatric-dentistry", label: "Kinderzahnheilkunde" },
  { id: "periodontology", label: "Parodontologie" },
  { id: "endodontics", label: "Endodontie" },
  { id: "prosthodontics", label: "Prothetik" },
  { id: "restorative", label: "Restaurative Zahnheilkunde" },
  { id: "implantology", label: "Implantologie" },
  { id: "oral-medicine", label: "Oralmedizin" },
  { id: "orofacial-pain", label: "Orofazialer Schmerz / Kiefergelenk" },
  { id: "dental-radiology", label: "Dental- und maxillofaziale Radiologie" },
  { id: "special-care", label: "Behandlung besonderer Patientengruppen" },
  { id: "public-health", label: "Öffentliches Gesundheitswesen" },
  { id: "oral-pathology", label: "Orale Pathologie" },
  { id: "oral-microbiology", label: "Orale Mikrobiologie" },
  { id: "anesthesia", label: "Anästhesie / Sedierung in der Zahnmedizin" },
];

export function getSpecializationLabel(id: string): string {
  const match = SPECIALIZATION_MASTER.find((s) => s.id === id);
  return match?.label || id;
}
```

### Datei: `lib/masterdata/services.ts`

```typescript
export interface ServiceOption {
  id: string;
  label: string;
}

export interface ServiceGroup {
  id: string;
  label: string;
  services: ServiceOption[];
}

export const SERVICE_MASTER: ServiceGroup[] = [
  {
    id: "a",
    label: "Vorsorge & Diagnostik",
    services: [
      { id: "checkup", label: "Kontrolluntersuchung" },
      { id: "second-opinion", label: "Zweitmeinung" },
      { id: "digital-diagnostics", label: "Digitale Diagnostik" },
      { id: "xray", label: "Röntgendiagnostik" },
      { id: "cbct", label: "DVT / CBCT" },
      { id: "caries-check", label: "Kariesdiagnostik" },
      { id: "perio-screening", label: "Parodontaler Screening-Check" },
      { id: "mucosa-check", label: "Mundschleimhaut-Check" },
      { id: "emergency", label: "Notfall- / Akutbeurteilung" },
    ],
  },
  {
    id: "b",
    label: "Zahnerhalt / Restaurative Behandlungen",
    services: [
      { id: "fillings", label: "Füllungstherapie" },
      { id: "inlays", label: "Inlays / Onlays" },
      { id: "crowns", label: "Kronen" },
      { id: "bridges", label: "Brücken" },
      { id: "prosthesis-planning", label: "Zahnersatzplanung" },
      { id: "dental-restoration", label: "Zahnsanierung" },
      { id: "reconstruction", label: "Rekonstruktion geschädigter Zähne" },
      { id: "full-mouth", label: "Vollmundrehabilitation" },
    ],
  },
  {
    id: "c",
    label: "Wurzelbehandlung / Endodontie",
    services: [
      { id: "root-canal", label: "Wurzelkanalbehandlung" },
      { id: "revision", label: "Revisionsbehandlung" },
      { id: "trauma-teeth", label: "Behandlung traumatisierter Zähne" },
      { id: "immature-teeth", label: "Behandlung unreifer Zähne" },
      { id: "endo-surgery", label: "Endodontische Chirurgie" },
    ],
  },
  {
    id: "d",
    label: "Zahnfleisch / Parodontologie",
    services: [
      { id: "perio-treatment", label: "Parodontalbehandlung" },
      { id: "gum-treatment", label: "Zahnfleischbehandlung" },
      { id: "regeneration", label: "Regeneration von Hart- und Weichgewebe" },
      { id: "recession", label: "Rezessionsbehandlung / Weichgewebsaufbau" },
      { id: "periimplantitis", label: "Periimplantitis-Behandlung" },
    ],
  },
  {
    id: "e",
    label: "Implantologie",
    services: [
      { id: "implant-consultation", label: "Implantatberatung" },
      { id: "implant-planning", label: "Implantatplanung" },
      { id: "implant-placement", label: "Implantatsetzung" },
      { id: "implant-prosthesis", label: "Implantatgetragener Zahnersatz" },
      { id: "bone-augmentation", label: "Knochenaufbau" },
      { id: "sinuslift", label: "Sinuslift" },
      { id: "perimplant-aftercare", label: "Periimplantäre Nachsorge" },
    ],
  },
  {
    id: "f",
    label: "Kieferorthopädie",
    services: [
      { id: "fixed-braces", label: "Feste Zahnspange" },
      { id: "removable-braces", label: "Herausnehmbare Zahnspange" },
      { id: "aligners", label: "Aligner" },
      { id: "early-treatment", label: "Frühbehandlung" },
      { id: "bite-correction", label: "Bisskorrektur" },
      { id: "retention", label: "Retention / Retainer" },
      { id: "adult-ortho", label: "Erwachsenen-KFO" },
      { id: "surgical-ortho", label: "Freilegung verlagerter Zähne" },
    ],
  },
  {
    id: "g",
    label: "Oralchirurgie",
    services: [
      { id: "wisdom-extraction", label: "Weisheitszahnentfernung" },
      { id: "surgical-extraction", label: "Operative Zahnentfernung" },
      { id: "impacted-removal", label: "Entfernung verlagerter Zähne" },
      { id: "exposure", label: "Freilegung retinierter Zähne" },
      { id: "apicoectomy", label: "Wurzelspitzenresektion" },
      { id: "cyst-removal", label: "Zystenentfernung" },
      { id: "biopsy", label: "Biopsie" },
      { id: "frenectomy", label: "Frenektomie" },
      { id: "preprosthetic", label: "Präprothetische Chirurgie" },
      { id: "implant-preparation", label: "Chirurgische Implantatvorbereitung" },
    ],
  },
  {
    id: "h",
    label: "Kinderzahnheilkunde",
    services: [
      { id: "pediatric-prophylaxis", label: "Kinderprophylaxe" },
      { id: "fissure-sealing", label: "Fissurenversiegelung" },
      { id: "milk-teeth", label: "Milchzahnbehandlung" },
      { id: "pediatric-crowns", label: "Kinderkronen" },
      { id: "pulp-therapy", label: "Pulpatherapie bei Kindern" },
      { id: "space-maintainer", label: "Platzhaltertherapie" },
      { id: "pediatric-trauma", label: "Kindertrauma" },
      { id: "pediatric-sedation", label: "Sedierung / Narkose für Kinder" },
    ],
  },
  {
    id: "i",
    label: "Oralmedizin / Schleimhaut / Schmerz",
    services: [
      { id: "mucosa-diseases", label: "Mundschleimhauterkrankungen" },
      { id: "burning-mouth", label: "Brennender Mund" },
      { id: "salivary-glands", label: "Speicheldrüsenerkrankungen" },
      { id: "tmd", label: "TMD / Kiefergelenkbeschwerden" },
      { id: "facial-pain", label: "Gesichtsschmerz" },
      { id: "orofacial-pain-diag", label: "Orofaziale Schmerzdiagnostik" },
    ],
  },
  {
    id: "j",
    label: "Sedierung / Anästhesie",
    services: [
      { id: "laughing-gas", label: "Lachgas / Sedierung" },
      { id: "iv-sedation", label: "Intravenöse Sedierung" },
      { id: "general-anesthesia", label: "Behandlung in Narkose" },
      { id: "anxiety-patients", label: "Angstpatienten-Behandlung" },
    ],
  },
  {
    id: "k",
    label: "Besondere Patientengruppen",
    services: [
      { id: "anxiety-special", label: "Behandlung von Angstpatienten" },
      { id: "seniors", label: "Behandlung von Senioren" },
      { id: "disability", label: "Behandlung von Menschen mit Behinderung" },
      { id: "complex-medical", label: "Behandlung medizinisch komplexer Patienten" },
      { id: "home-visits", label: "Hausbesuch / Heimversorgung" },
    ],
  },
  {
    id: "l",
    label: "Ästhetische Zahnmedizin",
    services: [
      { id: "bleaching", label: "Bleaching" },
      { id: "veneers", label: "Veneers" },
      { id: "bonding", label: "Composite Bonding" },
      { id: "aesthetic-correction", label: "Ästhetische Frontzahnkorrektur" },
      { id: "smile-design", label: "Smile Design" },
    ],
  },
];

export function findServiceById(id: string): { service: ServiceOption; group: ServiceGroup } | null {
  for (const group of SERVICE_MASTER) {
    const service = group.services.find((s) => s.id === id);
    if (service) return { service, group };
  }
  return null;
}

export function getServiceLabel(id: string): string {
  const match = findServiceById(id);
  return match?.service.label || id;
}
```

---

## Schritt 3 — Zeichen-Limits

### Datei: `lib/validation/profile-limits.ts`

```typescript
export const PROFILE_LIMITS = {
  first_name: 30,
  last_name: 30,
  title: 30,
  founding_year: 4,
  vita_markdown: 2000,
  specialization_custom: 60,
  service_name: 50,
  service_note: 30,
  practice_name: 50,
  practice_address: 100,
  practice_employment_status: 80,
  practice_phone: 30,
  practice_email: 80,
  practice_website: 100,
  practice_hours: 100,
  MAX_VISIBLE_SPECIALIZATIONS: 6,
  MAX_VISIBLE_SERVICES: 12,
} as const;
```

---

## Schritt 4 — Extended Queries

### Datei: `lib/queries/profile-editor.ts`

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ProfileEditorData {
  workspace_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  display_name: string | null;
  founding_year: number | null;
  photo_url: string | null;
  vita_markdown: string | null;
  specializations: string[];
  services_structured: ServiceStructured[];
  practice_name: string | null;
  practice_address: string | null;
  practice_employment_status: string | null;
  practice_phone: string | null;
  practice_email: string | null;
  practice_website: string | null;
  practice_hours: string | null;
}

export interface ServiceStructured {
  id: string;
  name: string;
  note: string;
  custom: boolean;
}

export async function getProfileForEditor(workspaceId: string): Promise<ProfileEditorData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile_data")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  if (error || !data) {
    // Upsert leer anlegen falls noch nicht existent
    const { data: inserted } = await supabase
      .from("profile_data")
      .insert({ workspace_id: workspaceId })
      .select()
      .single();
    if (!inserted) return null;
    return mapToEditor(inserted);
  }

  return mapToEditor(data);
}

function mapToEditor(data: any): ProfileEditorData {
  return {
    workspace_id: data.workspace_id,
    first_name: data.first_name,
    last_name: data.last_name,
    title: data.title,
    display_name: data.display_name,
    founding_year: data.founding_year,
    photo_url: data.photo_url,
    vita_markdown: data.vita_markdown,
    specializations: Array.isArray(data.specializations) ? data.specializations : [],
    services_structured: Array.isArray(data.services_structured) ? data.services_structured : [],
    practice_name: data.practice_name,
    practice_address: data.practice_address,
    practice_employment_status: data.practice_employment_status,
    practice_phone: data.practice_phone,
    practice_email: data.practice_email,
    practice_website: data.practice_website,
    practice_hours: data.practice_hours || null,
  };
}
```

---

## Schritt 5 — Server Actions

### Datei: `app/(protected)/profile/editor/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { generateSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export interface SaveProfilePayload {
  first_name: string;
  last_name: string;
  title: string;
  founding_year: number | null;
  vita_markdown: string;
  specializations: string[];
  services_structured: Array<{ id: string; name: string; note: string; custom: boolean }>;
  practice_name: string;
  practice_address: string;
  practice_employment_status: string;
  practice_phone: string;
  practice_email: string;
  practice_website: string;
  practice_hours: string;
}

export async function saveProfileData(payload: SaveProfilePayload): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();

  const display_name = [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim() || null;

  const { error } = await supabase
    .from("profile_data")
    .upsert({
      workspace_id: workspace.workspace_id,
      first_name: payload.first_name || null,
      last_name: payload.last_name || null,
      title: payload.title || null,
      display_name,
      founding_year: payload.founding_year,
      vita_markdown: payload.vita_markdown || null,
      specializations: payload.specializations,
      services_structured: payload.services_structured,
      practice_name: payload.practice_name || null,
      practice_address: payload.practice_address || null,
      practice_employment_status: payload.practice_employment_status || null,
      practice_phone: payload.practice_phone || null,
      practice_email: payload.practice_email || null,
      practice_website: payload.practice_website || null,
      practice_hours: payload.practice_hours || null,
    });

  if (error) {
    console.error("[saveProfile]", error);
    return { error: "Speichern fehlgeschlagen." };
  }

  // Slug aus display_name aktualisieren (falls der Name sich geändert hat)
  if (display_name) {
    const newSlug = generateSlug(display_name);
    if (newSlug) {
      await supabase.from("workspaces").update({ slug: newSlug }).eq("id", workspace.workspace_id);
    }
  }

  revalidatePath("/profile/editor");
  revalidatePath(`/doc/${workspace.workspace_id}`);

  return { success: true };
}

export async function uploadPortraitPhoto(formData: FormData): Promise<{ error?: string; url?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };

  if (file.size > 10 * 1024 * 1024) {
    return { error: "Datei zu groß. Maximum 10 MB." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { error: "Format nicht unterstützt. JPG, PNG oder WEBP." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${workspace.workspace_id}/portrait-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("profile-photos")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[uploadPortrait]", uploadError);
    return { error: "Upload fehlgeschlagen." };
  }

  // Signierte Public-URL erzeugen (langfristig)
  const { data: urlData } = admin.storage.from("profile-photos").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  await admin
    .from("profile_data")
    .update({ photo_url: publicUrl })
    .eq("workspace_id", workspace.workspace_id);

  revalidatePath("/profile/editor");
  return { url: publicUrl };
}

export async function deletePortraitPhoto(): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const admin = createAdminClient();
  await admin.from("profile_data").update({ photo_url: null }).eq("workspace_id", workspace.workspace_id);

  revalidatePath("/profile/editor");
  return { success: true };
}
```

---

## Schritt 6 — Storage Bucket + Policies

### Datei: `supabase/migrations/013_storage_portrait.sql`

```sql
-- Dokumentation: Portrait-Bucket wird manuell im Dashboard angelegt.
-- Details siehe STEP 14 dieses Plans.
-- Dieses SQL-File ist nur Dokumentation.
```

---

## Schritt 7 — Field-with-Counter Component

### Datei: `components/profile-editor/field-with-counter.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldWithCounterProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "number" | "url";
  required?: boolean;
  helper?: string;
  multiline?: boolean;
  rows?: number;
}

export function FieldWithCounter({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  type = "text",
  required = false,
  helper,
  multiline = false,
  rows = 4,
}: FieldWithCounterProps) {
  const length = value?.length || 0;
  const isOver = length > maxLength;
  const isNearLimit = length > maxLength * 0.9 && !isOver;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs uppercase tracking-wider text-text-tertiary">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </Label>
        <span
          className={`text-[10px] font-mono ${
            isOver ? "text-danger" : isNearLimit ? "text-warning" : "text-text-tertiary"
          }`}
        >
          {length}/{maxLength}
        </span>
      </div>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none font-serif leading-relaxed"
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {helper && (
        <p className="text-[11px] text-text-tertiary leading-relaxed">{helper}</p>
      )}
    </div>
  );
}
```

---

## Schritt 8 — Editor-Sections

### Datei: `components/profile-editor/section-hero.tsx`

```typescript
"use client";

import { FieldWithCounter } from "./field-with-counter";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface SectionHeroProps {
  firstName: string;
  lastName: string;
  title: string;
  foundingYear: number | null;
  onUpdate: (field: string, value: any) => void;
}

export function SectionHero({ firstName, lastName, title, foundingYear, onUpdate }: SectionHeroProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">§ I</span>
          <h2 className="font-serif text-3xl font-light">Name und Titel</h2>
        </div>
        <p className="text-sm text-text-secondary">Wie Sie auf Ihrem öffentlichen Profil erscheinen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWithCounter
          id="first_name"
          label="Vorname"
          value={firstName}
          onChange={(v) => onUpdate("first_name", v)}
          maxLength={PROFILE_LIMITS.first_name}
          placeholder="Berk"
          required
        />
        <FieldWithCounter
          id="last_name"
          label="Nachname"
          value={lastName}
          onChange={(v) => onUpdate("last_name", v)}
          maxLength={PROFILE_LIMITS.last_name}
          placeholder="Baysal"
          required
        />
      </div>

      <FieldWithCounter
        id="title"
        label="Titel"
        value={title}
        onChange={(v) => onUpdate("title", v)}
        maxLength={PROFILE_LIMITS.title}
        placeholder="Dr. med. dent."
        helper="Optional. Beispiele: 'Dr. med. dent.', 'Prof. Dr.', 'Zahnärztin'."
      />

      <FieldWithCounter
        id="founding_year"
        label="Gründungsjahr"
        value={foundingYear?.toString() || ""}
        onChange={(v) => {
          const num = parseInt(v, 10);
          onUpdate("founding_year", isNaN(num) ? null : num);
        }}
        maxLength={4}
        placeholder="2019"
        type="number"
        helper="Optional. Wird als 'Est. 2019' im Header angezeigt."
      />
    </section>
  );
}
```

### Datei: `components/profile-editor/section-vita.tsx`

```typescript
"use client";

import { FieldWithCounter } from "./field-with-counter";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface SectionVitaProps {
  vita: string;
  onUpdate: (value: string) => void;
}

export function SectionVita({ vita, onUpdate }: SectionVitaProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">§ II</span>
          <h2 className="font-serif text-3xl font-light">Vita</h2>
        </div>
        <p className="text-sm text-text-secondary">Ihre persönliche Geschichte und Philosophie. Drei bis vier Absätze reichen.</p>
      </div>

      <FieldWithCounter
        id="vita_markdown"
        label="Vita-Text"
        value={vita}
        onChange={onUpdate}
        maxLength={PROFILE_LIMITS.vita_markdown}
        placeholder="Nach meinem Studium der Zahnmedizin an..."
        multiline
        rows={12}
        helper="Absätze durch Leerzeile trennen. Der erste Buchstabe wird als großes Initial dargestellt."
      />
    </section>
  );
}
```

### Datei: `components/profile-editor/section-specializations.tsx`

```typescript
"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { SPECIALIZATION_MASTER } from "@/lib/masterdata/specializations";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { Input } from "@/components/ui/input";

interface SectionSpecializationsProps {
  selected: string[];
  onUpdate: (ids: string[]) => void;
}

export function SectionSpecializations({ selected, onUpdate }: SectionSpecializationsProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleFromMaster = (id: string) => {
    if (selected.includes(id)) {
      onUpdate(selected.filter((x) => x !== id));
    } else {
      onUpdate([...selected, id]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (trimmed.length > PROFILE_LIMITS.specialization_custom) return;
    const customId = `custom:${trimmed}`;
    if (selected.includes(customId)) return;
    onUpdate([...selected, customId]);
    setCustomInput("");
  };

  const removeCustom = (id: string) => {
    onUpdate(selected.filter((x) => x !== id));
  };

  const visibleCount = selected.length;
  const isOverLimit = visibleCount > PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS;

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">§ III</span>
          <h2 className="font-serif text-3xl font-light">Schwerpunkte</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Fachliche Schwerpunkte — keine geschützten Fachzahnarzt-Titel. Sichtbar: max {PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS} auf dem Profil.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Aus der Liste wählen</div>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATION_MASTER.map((spec) => {
            const isSelected = selected.includes(spec.id);
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => toggleFromMaster(spec.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                  isSelected
                    ? "bg-ink text-cream border-ink"
                    : "bg-surface-card border-border text-text-secondary hover:border-text-primary"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                {spec.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Eigenen Schwerpunkt hinzufügen</div>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={PROFILE_LIMITS.specialization_custom}
            placeholder="z.B. Digitale Volumentomographie"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-4 py-2 bg-ink text-cream text-sm rounded hover:bg-teal transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {selected.filter((s) => s.startsWith("custom:")).length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Eigene</div>
          <div className="flex flex-wrap gap-2">
            {selected.filter((s) => s.startsWith("custom:")).map((id) => (
              <div
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-ink text-cream border border-ink"
              >
                {id.replace("custom:", "")}
                <button type="button" onClick={() => removeCustom(id)} className="hover:text-danger">
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-text-tertiary pt-4 border-t border-border">
        Ausgewählt: <span className={isOverLimit ? "text-warning" : ""}>{visibleCount}</span>
        {isOverLimit && (
          <span className="ml-2">— auf dem Profil werden nur die ersten {PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS} angezeigt.</span>
        )}
      </div>
    </section>
  );
}
```

### Datei: `components/profile-editor/service-item-editor.tsx`

```typescript
"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface ServiceItemEditorProps {
  index: number;
  id: string;
  name: string;
  note: string;
  custom: boolean;
  onNoteChange: (value: string) => void;
  onRemove: () => void;
}

export function ServiceItemEditor({ name, note, onNoteChange, onRemove }: ServiceItemEditorProps) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border">
      <div className="flex-1 font-serif text-base">{name}</div>
      <Input
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="kurze Notiz"
        maxLength={PROFILE_LIMITS.service_note}
        className="w-40 text-xs uppercase tracking-wider font-sans"
      />
      <button type="button" onClick={onRemove} className="text-text-tertiary hover:text-danger p-1">
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
```

### Datei: `components/profile-editor/section-services.tsx`

```typescript
"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { SERVICE_MASTER, findServiceById } from "@/lib/masterdata/services";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { ServiceItemEditor } from "./service-item-editor";
import { Input } from "@/components/ui/input";
import type { ServiceStructured } from "@/lib/queries/profile-editor";

interface SectionServicesProps {
  services: ServiceStructured[];
  onUpdate: (services: ServiceStructured[]) => void;
}

export function SectionServices({ services, onUpdate }: SectionServicesProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(selectedGroups.includes(groupId)
      ? selectedGroups.filter((g) => g !== groupId)
      : [...selectedGroups, groupId]);
  };

  const isServiceSelected = (serviceId: string) => services.some((s) => s.id === serviceId);

  const addServiceFromMaster = (serviceId: string) => {
    const found = findServiceById(serviceId);
    if (!found || isServiceSelected(serviceId)) return;
    onUpdate([...services, { id: serviceId, name: found.service.label, note: "", custom: false }]);
  };

  const addCustomService = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (trimmed.length > PROFILE_LIMITS.service_name) return;
    const newId = `custom:${Date.now()}`;
    onUpdate([...services, { id: newId, name: trimmed, note: "", custom: true }]);
    setCustomName("");
  };

  const removeService = (id: string) => {
    onUpdate(services.filter((s) => s.id !== id));
  };

  const updateServiceNote = (id: string, note: string) => {
    onUpdate(services.map((s) => (s.id === id ? { ...s, note } : s)));
  };

  const isOverLimit = services.length > PROFILE_LIMITS.MAX_VISIBLE_SERVICES;

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">§ IV</span>
          <h2 className="font-serif text-3xl font-light">Leistungen</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Patientenverständliche Dienstleistungen. Sichtbar: max {PROFILE_LIMITS.MAX_VISIBLE_SERVICES} auf dem Profil.
        </p>
      </div>

      {services.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">Ihre Auswahl</div>
          <div className="border-t border-border">
            {services.map((s, i) => (
              <ServiceItemEditor
                key={s.id}
                index={i}
                id={s.id}
                name={s.name}
                note={s.note}
                custom={s.custom}
                onNoteChange={(note) => updateServiceNote(s.id, note)}
                onRemove={() => removeService(s.id)}
              />
            ))}
          </div>
          <div className="text-xs text-text-tertiary pt-2">
            Ausgewählt: <span className={isOverLimit ? "text-warning" : ""}>{services.length}</span>
            {isOverLimit && (
              <span className="ml-2">— nur die ersten {PROFILE_LIMITS.MAX_VISIBLE_SERVICES} werden angezeigt.</span>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Aus Kategorien wählen</div>
        <div className="space-y-2">
          {SERVICE_MASTER.map((group) => {
            const isOpen = selectedGroups.includes(group.id);
            return (
              <div key={group.id} className="border border-border rounded">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-sunken/30"
                >
                  <span className="text-sm font-medium">
                    <span className="text-text-tertiary mr-2 uppercase text-xs">{group.id.toUpperCase()}</span>
                    {group.label}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`} strokeWidth={1.75} />
                </button>
                {isOpen && (
                  <div className="px-4 py-2 border-t border-border flex flex-wrap gap-2">
                    {group.services.map((service) => {
                      const isSelected = isServiceSelected(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => !isSelected && addServiceFromMaster(service.id)}
                          disabled={isSelected}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            isSelected
                              ? "bg-surface-sunken border-border text-text-tertiary cursor-default"
                              : "bg-surface-card border-border text-text-secondary hover:border-text-primary"
                          }`}
                        >
                          {service.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Eigene Leistung hinzufügen</div>
        <div className="flex gap-2">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomService();
              }
            }}
            maxLength={PROFILE_LIMITS.service_name}
            placeholder="z.B. Prominentenbehandlung"
          />
          <button type="button" onClick={addCustomService} className="px-4 py-2 bg-ink text-cream text-sm rounded hover:bg-teal transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
```

### Datei: `components/profile-editor/section-practice.tsx`

```typescript
"use client";

import { FieldWithCounter } from "./field-with-counter";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface SectionPracticeProps {
  practice_name: string;
  practice_address: string;
  practice_employment_status: string;
  practice_phone: string;
  practice_email: string;
  practice_website: string;
  practice_hours: string;
  onUpdate: (field: string, value: string) => void;
}

export function SectionPractice({
  practice_name,
  practice_address,
  practice_employment_status,
  practice_phone,
  practice_email,
  practice_website,
  practice_hours,
  onUpdate,
}: SectionPracticeProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">§ V</span>
          <h2 className="font-serif text-3xl font-light">Praxis</h2>
        </div>
        <p className="text-sm text-text-secondary">Kontaktdaten und Standort der Praxis.</p>
      </div>

      <FieldWithCounter
        id="practice_name"
        label="Praxisname"
        value={practice_name}
        onChange={(v) => onUpdate("practice_name", v)}
        maxLength={PROFILE_LIMITS.practice_name}
        placeholder="CY DENT"
      />

      <FieldWithCounter
        id="practice_address"
        label="Adresse"
        value={practice_address}
        onChange={(v) => onUpdate("practice_address", v)}
        maxLength={PROFILE_LIMITS.practice_address}
        placeholder="Kollwitzstraße 62&#10;10405 Berlin"
        multiline
        rows={3}
      />

      <FieldWithCounter
        id="practice_hours"
        label="Öffnungszeiten"
        value={practice_hours}
        onChange={(v) => onUpdate("practice_hours", v)}
        maxLength={PROFILE_LIMITS.practice_hours}
        placeholder="Mo — Fr · 09 — 19&#10;Sa · nach Vereinbarung"
        multiline
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWithCounter
          id="practice_phone"
          label="Telefon"
          value={practice_phone}
          onChange={(v) => onUpdate("practice_phone", v)}
          maxLength={PROFILE_LIMITS.practice_phone}
          placeholder="+49 30 123 456"
          type="tel"
        />
        <FieldWithCounter
          id="practice_email"
          label="E-Mail"
          value={practice_email}
          onChange={(v) => onUpdate("practice_email", v)}
          maxLength={PROFILE_LIMITS.practice_email}
          placeholder="praxis@beispiel.de"
          type="email"
        />
      </div>

      <FieldWithCounter
        id="practice_website"
        label="Website"
        value={practice_website}
        onChange={(v) => onUpdate("practice_website", v)}
        maxLength={PROFILE_LIMITS.practice_website}
        placeholder="https://www.beispiel.de"
        type="url"
      />

      <FieldWithCounter
        id="practice_employment_status"
        label="Anstellungsverhältnis"
        value={practice_employment_status}
        onChange={(v) => onUpdate("practice_employment_status", v)}
        maxLength={PROFILE_LIMITS.practice_employment_status}
        placeholder="Praxisinhaber · Selbständig"
        helper="Optional. Z.B. 'Praxisinhaber', 'Angestellt bei Dr. Muster'."
      />
    </section>
  );
}
```

### Datei: `components/profile-editor/section-photo.tsx`

```typescript
"use client";

import { useState, useRef } from "react";
import { Upload, X, User } from "lucide-react";
import { uploadPortraitPhoto, deletePortraitPhoto } from "@/app/(protected)/profile/editor/actions";

interface SectionPhotoProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

export function SectionPhoto({ photoUrl, onPhotoChange }: SectionPhotoProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadPortraitPhoto(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onPhotoChange(result.url);
    }
  };

  const handleDelete = async () => {
    const result = await deletePortraitPhoto();
    if (!result.error) {
      onPhotoChange(null);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">§ VI</span>
          <h2 className="font-serif text-3xl font-light">Portrait</h2>
        </div>
        <p className="text-sm text-text-secondary">Optional. Wenn leer, wird nur der Name angezeigt. JPG, PNG oder WEBP. Max. 10 MB.</p>
      </div>

      {photoUrl ? (
        <div className="flex items-start gap-4">
          <img
            src={photoUrl}
            alt="Portrait"
            className="w-32 h-40 object-cover border border-border"
          />
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-danger hover:underline flex items-center gap-1.5"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              Portrait entfernen
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-text-primary hover:underline flex items-center gap-1.5"
            >
              <Upload className="w-3 h-3" strokeWidth={2} />
              Anderes Foto hochladen
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-text-primary/50 max-w-md"
        >
          <User className="w-8 h-8 mx-auto text-text-tertiary mb-2" strokeWidth={1.5} />
          <p className="text-sm font-medium">Portrait hochladen</p>
          <p className="text-xs text-text-tertiary mt-1">Klicken zum Auswählen</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading && <p className="text-sm text-text-secondary">Wird hochgeladen…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </section>
  );
}
```

---

## Schritt 9 — Auto-Save Indicator

### Datei: `components/profile-editor/auto-save-indicator.tsx`

```typescript
"use client";

import { Check, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  errorMessage?: string | null;
}

export function AutoSaveIndicator({ status, lastSavedAt, errorMessage }: AutoSaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
        Speichern…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-xs text-danger">
        Fehler: {errorMessage || "Speichern fehlgeschlagen"}
      </div>
    );
  }

  if (status === "saved" && lastSavedAt) {
    const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    const label = seconds < 5 ? "gerade eben" : seconds < 60 ? `vor ${seconds}s` : `vor ${Math.floor(seconds / 60)}min`;
    return (
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Check className="w-3 h-3" strokeWidth={2} />
        Gespeichert {label}
      </div>
    );
  }

  return null;
}
```

---

## Schritt 10 — Editorial Profile Component (wiederverwendbar)

### Datei: `components/profile-preview/editorial-profile.tsx`

```typescript
import Link from "next/link";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { getSpecializationLabel } from "@/lib/masterdata/specializations";
import type { ProfileEditorData } from "@/lib/queries/profile-editor";

interface EditorialProfileProps {
  data: ProfileEditorData;
  workspaceName: string;
  slug: string;
  cityTagline?: string | null;
  journalEntries?: Array<{ id: string; title: string; slug: string; published_at: string | null }>;
  previewMode?: boolean;
}

export function EditorialProfile({
  data,
  workspaceName,
  slug,
  cityTagline,
  journalEntries,
  previewMode = false,
}: EditorialProfileProps) {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.display_name || workspaceName;
  const displayTitle = data.title || null;

  const visibleSpecs = data.specializations.slice(0, PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS);
  const visibleServices = data.services_structured.slice(0, PROFILE_LIMITS.MAX_VISIBLE_SERVICES);

  const topSpecs = visibleSpecs.slice(0, 3);
  const tagline = cityTagline || data.practice_address?.split("\n").pop()?.trim() || null;

  const vitaParagraphs = data.vita_markdown?.split(/\n\n+/).filter((p) => p.trim()) || [];

  return (
    <div className="bg-cream text-ink font-sans">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">

        {/* NAV */}
        <nav className="flex items-center justify-between py-10 border-b border-border">
          <div className="text-sm tracking-[0.14em] uppercase">
            {data.practice_name || workspaceName}
          </div>
          {tagline && (
            <div className="text-xs tracking-wider text-ink-soft">{tagline}</div>
          )}
        </nav>

        {/* HERO */}
        <section className="pt-20 md:pt-32 pb-20">
          <div className={`grid gap-10 md:gap-20 ${data.photo_url ? "md:grid-cols-[1fr_400px]" : "grid-cols-1"} items-start`}>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint mb-8">
                § Zahnärztliche Praxis
                {data.founding_year && ` · Est. ${data.founding_year}`}
              </div>
              <h1 className="font-serif font-light leading-[0.92] text-[clamp(3.5rem,9vw,8rem)] tracking-tight mb-10 max-w-[18ch]">
                {data.first_name && data.last_name ? (
                  <>
                    {data.first_name}{" "}
                    <span className="italic text-ink-soft">{data.last_name}</span>
                  </>
                ) : (
                  fullName
                )}
              </h1>
              <div className="flex flex-wrap gap-6 md:gap-12 pt-10 mt-10 border-t border-border">
                {displayTitle && (
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1.5">Titel</div>
                    <div className="text-sm font-medium">{displayTitle}</div>
                  </div>
                )}
                {topSpecs.length > 0 && (
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1.5">Schwerpunkte</div>
                    <div className="text-sm font-medium">
                      {topSpecs.map((id) => id.startsWith("custom:") ? id.replace("custom:", "") : getSpecializationLabel(id)).join(" · ")}
                    </div>
                  </div>
                )}
                {data.practice_name && (
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1.5">Praxis</div>
                    <div className="text-sm font-medium">{data.practice_name}</div>
                  </div>
                )}
              </div>
            </div>

            {data.photo_url && (
              <div className="aspect-[4/5] bg-paper border border-border overflow-hidden">
                <img src={data.photo_url} alt={fullName} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>

        {/* VITA */}
        {vitaParagraphs.length > 0 && (
          <section className="py-20 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">§ I · Vita</div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                <span className="italic">Über</span> mich.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <div className="max-w-[640px]">
                {vitaParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`font-serif text-lg leading-relaxed text-ink mb-7 ${
                      i === 0 ? "first-letter:font-serif first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:float-left first-letter:pr-3 first-letter:pt-1.5" : ""
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SCHWERPUNKTE */}
        {visibleSpecs.length > 0 && (
          <section className="py-20 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">§ II · Schwerpunkte</div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                Meine <span className="italic">Schwerpunkte</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <div className="max-w-[640px]">
                <div className="flex flex-wrap gap-3">
                  {visibleSpecs.map((id) => (
                    <div
                      key={id}
                      className="inline-flex items-center px-4 py-2 border border-border rounded-full font-serif text-base"
                    >
                      {id.startsWith("custom:") ? id.replace("custom:", "") : getSpecializationLabel(id)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LEISTUNGEN */}
        {visibleServices.length > 0 && (
          <section className="py-20 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">§ III · Leistungen</div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                Was ich <span className="italic">anbiete</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <ul className="max-w-[640px] list-none">
                {visibleServices.map((s) => (
                  <li key={s.id} className="flex justify-between items-baseline gap-10 py-5 border-b border-border last:border-b-0">
                    <span className="font-serif text-lg text-ink">{s.name}</span>
                    {s.note && (
                      <span className="text-xs tracking-wider uppercase text-ink-faint">{s.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* PRACTICE */}
        {(data.practice_address || data.practice_phone || data.practice_email || data.practice_website) && (
          <section className="py-20 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">§ IV · Praxis</div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                {data.practice_name ? (
                  <>
                    {data.practice_name.split(" ")[0]}{" "}
                    <span className="italic">{data.practice_name.split(" ").slice(1).join(" ") || "."}</span>
                  </>
                ) : (
                  "Praxis."
                )}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <div className="max-w-[640px] grid grid-cols-1 md:grid-cols-2 gap-10">
                {data.practice_address && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">Adresse</div>
                    <div className="font-serif text-base whitespace-pre-line">{data.practice_address}</div>
                  </div>
                )}
                {data.practice_hours && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">Öffnungszeiten</div>
                    <div className="font-serif text-base whitespace-pre-line">{data.practice_hours}</div>
                  </div>
                )}
                {data.practice_phone && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">Telefon</div>
                    <a href={`tel:${data.practice_phone}`} className="font-serif text-base border-b border-border pb-0.5 hover:border-ink transition-colors">
                      {data.practice_phone}
                    </a>
                  </div>
                )}
                {data.practice_email && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">E-Mail</div>
                    <a href={`mailto:${data.practice_email}`} className="font-serif text-base border-b border-border pb-0.5 hover:border-ink transition-colors">
                      {data.practice_email}
                    </a>
                  </div>
                )}
                {data.practice_website && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">Website</div>
                    <a href={data.practice_website} target="_blank" rel="noopener noreferrer" className="font-serif text-base border-b border-border pb-0.5 hover:border-ink transition-colors">
                      {data.practice_website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        {!previewMode && (
          <section className="py-32 md:py-40 text-center bg-paper -mx-6 md:-mx-10 px-6 md:px-10 border-t border-border">
            <h2 className="font-serif font-light text-[clamp(3rem,7vw,6rem)] leading-none mb-5 max-w-[14ch] mx-auto">
              Unterlagen <span className="italic">einreichen</span>.
            </h2>
            <p className="text-lg text-ink-soft mb-10 max-w-[48ch] mx-auto">
              Senden Sie Fotos und Unterlagen diskret und verschlüsselt direkt an die Praxis.
            </p>
            <Link
              href={`/doc/${slug}/upload`}
              className="inline-flex items-center gap-4 px-10 py-5 bg-ink text-cream no-underline text-sm tracking-[0.12em] uppercase font-medium hover:bg-teal transition-colors rounded-sm"
            >
              Jetzt einsenden
              <span>→</span>
            </Link>
            <div className="mt-10 text-xs tracking-wider uppercase text-ink-faint">
              Ende-zu-Ende verschlüsselt · DSGVO-konform
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="py-10 border-t border-border flex justify-between text-xs text-ink-faint">
          <div>© 2026 {data.practice_name || workspaceName}</div>
          <div>Via <strong>SmileScan</strong></div>
        </footer>

      </div>
    </div>
  );
}
```

---

## Schritt 11 — Design Tokens erweitern

### Datei: `app/globals.css` (erweitern um neue Tokens)

Füge in den `:root`-Block ein (falls noch nicht vorhanden):

```css
--color-cream: #FAFAF8;
--color-paper: #F5F2EC;
--color-ink: #1A1A1A;
--color-ink-soft: #5F5E5A;
--color-ink-faint: #97958C;
```

Und dann in der `@theme`-Sektion:

```css
--color-cream: var(--color-cream);
--color-paper: var(--color-paper);
--color-ink: var(--color-ink);
--color-ink-soft: var(--color-ink-soft);
--color-ink-faint: var(--color-ink-faint);
```

So dass `bg-cream`, `text-ink`, etc. als Tailwind-Klassen funktionieren.

---

## Schritt 12 — Editor Shell + Page

### Datei: `components/profile-editor/profile-editor-shell.tsx`

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SectionHero } from "./section-hero";
import { SectionVita } from "./section-vita";
import { SectionSpecializations } from "./section-specializations";
import { SectionServices } from "./section-services";
import { SectionPractice } from "./section-practice";
import { SectionPhoto } from "./section-photo";
import { AutoSaveIndicator, type SaveStatus } from "./auto-save-indicator";
import { EditorialProfile } from "@/components/profile-preview/editorial-profile";
import { saveProfileData } from "@/app/(protected)/profile/editor/actions";
import type { ProfileEditorData, ServiceStructured } from "@/lib/queries/profile-editor";

interface ProfileEditorShellProps {
  initialData: ProfileEditorData;
  workspaceName: string;
  slug: string;
}

export function ProfileEditorShell({ initialData, workspaceName, slug }: ProfileEditorShellProps) {
  const [data, setData] = useState<ProfileEditorData>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef(data);
  latestDataRef.current = data;

  const updateField = useCallback(<K extends keyof ProfileEditorData>(field: K, value: ProfileEditorData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updatePracticeField = useCallback((field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value } as ProfileEditorData));
  }, []);

  const performSave = useCallback(async () => {
    setSaveStatus("saving");
    setErrorMessage(null);
    const d = latestDataRef.current;

    const result = await saveProfileData({
      first_name: d.first_name || "",
      last_name: d.last_name || "",
      title: d.title || "",
      founding_year: d.founding_year,
      vita_markdown: d.vita_markdown || "",
      specializations: d.specializations,
      services_structured: d.services_structured,
      practice_name: d.practice_name || "",
      practice_address: d.practice_address || "",
      practice_employment_status: d.practice_employment_status || "",
      practice_phone: d.practice_phone || "",
      practice_email: d.practice_email || "",
      practice_website: d.practice_website || "",
      practice_hours: d.practice_hours || "",
    });

    if (result.error) {
      setSaveStatus("error");
      setErrorMessage(result.error);
    } else {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    }
  }, []);

  // Auto-save nach 2s Inaktivität
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      performSave();
    }, 2000);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface-page/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light">Profil bearbeiten</h1>
            <p className="text-xs text-text-tertiary">Änderungen werden automatisch gespeichert.</p>
          </div>
          <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} errorMessage={errorMessage} />
        </div>
      </header>

      {/* Layout: Editor links, Preview rechts (desktop only) */}
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[55%_45%] gap-0">
          {/* EDITOR */}
          <div className="px-6 py-12 space-y-24 max-w-[700px]">
            <SectionHero
              firstName={data.first_name || ""}
              lastName={data.last_name || ""}
              title={data.title || ""}
              foundingYear={data.founding_year}
              onUpdate={(field, value) => updateField(field as any, value)}
            />
            <SectionVita vita={data.vita_markdown || ""} onUpdate={(v) => updateField("vita_markdown", v)} />
            <SectionSpecializations selected={data.specializations} onUpdate={(ids) => updateField("specializations", ids)} />
            <SectionServices services={data.services_structured} onUpdate={(s) => updateField("services_structured", s)} />
            <SectionPractice
              practice_name={data.practice_name || ""}
              practice_address={data.practice_address || ""}
              practice_employment_status={data.practice_employment_status || ""}
              practice_phone={data.practice_phone || ""}
              practice_email={data.practice_email || ""}
              practice_website={data.practice_website || ""}
              practice_hours={data.practice_hours || ""}
              onUpdate={updatePracticeField}
            />
            <SectionPhoto
              photoUrl={data.photo_url}
              onPhotoChange={(url) => updateField("photo_url", url)}
            />
          </div>

          {/* PREVIEW (desktop) */}
          <div className="hidden xl:block border-l border-border bg-cream sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary text-center py-3 border-b border-border bg-paper">
              Live-Vorschau
            </div>
            <div style={{ transform: "scale(0.78)", transformOrigin: "top left", width: "128.2%" }}>
              <EditorialProfile
                data={data}
                workspaceName={workspaceName}
                slug={slug}
                previewMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Datei: `app/(protected)/profile/editor/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getProfileForEditor } from "@/lib/queries/profile-editor";
import { ProfileEditorShell } from "@/components/profile-editor/profile-editor-shell";

export default async function ProfileEditorPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const { data: ws } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("id", workspace.workspace_id)
    .single();

  if (!ws) redirect("/login");

  const data = await getProfileForEditor(workspace.workspace_id);
  if (!data) {
    return <div className="p-12 text-center">Profil konnte nicht geladen werden.</div>;
  }

  return <ProfileEditorShell initialData={data} workspaceName={ws.name} slug={ws.slug} />;
}
```

---

## Schritt 13 — Profile Page Update + Public Page Update

### Datei: `app/(protected)/profile/page.tsx` (überarbeiten)

```typescript
import Link from "next/link";
import { ExternalLink, Edit3 } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return <div className="max-w-6xl mx-auto px-6 py-12"><p className="text-text-secondary">Workspace wird geladen…</p></div>;
  }

  const supabase = await createClient();
  const { data: ws } = await supabase.from("workspaces").select("slug").eq("id", workspace.workspace_id).single();
  const publicUrl = ws ? `/doc/${ws.slug}` : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">Profil</p>
        <h1 className="font-serif text-5xl font-light tracking-tight mb-4">Öffentliches Profil</h1>
        <p className="text-text-secondary max-w-xl">Verwalten Sie Ihre öffentliche Präsenz. Änderungen sind sofort live.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/profile/editor"
          className="block bg-surface-card border border-border rounded-lg p-6 hover:border-brand/50 transition-colors"
        >
          <Edit3 className="w-5 h-5 text-brand mb-3" strokeWidth={1.75} />
          <h2 className="font-serif text-xl mb-1">Profil bearbeiten</h2>
          <p className="text-xs text-text-tertiary">Name, Vita, Leistungen, Praxis-Info</p>
        </Link>

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            className="block bg-surface-card border border-border rounded-lg p-6 hover:border-brand/50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-brand mb-3" strokeWidth={1.75} />
            <h2 className="font-serif text-xl mb-1">Ansehen</h2>
            <p className="text-xs text-text-tertiary">smilescan.io{publicUrl}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
```

### Datei: `app/doc/[slug]/page.tsx` (überarbeiten)

```typescript
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicProfileBySlug, getRecentJournalEntries } from "@/lib/queries/public-profile";
import { EditorialProfile } from "@/components/profile-preview/editorial-profile";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  // Zusätzliche Felder nachladen (Phase 8 added first_name, last_name, etc.)
  const admin = createAdminClient();
  const { data: extended } = await admin
    .from("profile_data")
    .select("first_name, last_name, title, founding_year, specializations, services_structured, practice_hours")
    .eq("workspace_id", profile.workspace_id)
    .single();

  const journalEntries = await getRecentJournalEntries(profile.workspace_id);

  const data = {
    workspace_id: profile.workspace_id,
    first_name: extended?.first_name || null,
    last_name: extended?.last_name || null,
    title: extended?.title || null,
    display_name: profile.display_name,
    founding_year: extended?.founding_year || null,
    photo_url: profile.photo_url,
    vita_markdown: profile.vita_markdown,
    specializations: Array.isArray(extended?.specializations) ? extended.specializations : [],
    services_structured: Array.isArray(extended?.services_structured) ? extended.services_structured : [],
    practice_name: profile.practice_name,
    practice_address: profile.practice_address,
    practice_employment_status: profile.practice_employment_status,
    practice_phone: profile.practice_phone,
    practice_email: profile.practice_email,
    practice_website: profile.practice_website,
    practice_hours: extended?.practice_hours || null,
  };

  return (
    <EditorialProfile
      data={data}
      workspaceName={profile.workspace_name}
      slug={profile.slug}
      journalEntries={journalEntries}
    />
  );
}
```

---

## Schritt 14 — Commit

```bash
git add .
git commit -m "feat: phase 8 — profile editor with live preview, specializations, services"
```

---

## Schritt 15 — STOP (MENSCHLICHE SCHRITTE)

Melde dem Menschen:

"Phase 8 Code ist fertig. Du musst **drei Dinge manuell** tun.

### 1. SQL Migration 012 in Supabase ausführen

Inhalt aus `supabase/migrations/012_extend_profile_data.sql` kopieren, in SQL Editor einfügen, Run.

### 2. Neuer Storage-Bucket `profile-photos` im Supabase Dashboard anlegen

Storage → New Bucket:
- Name: `profile-photos`
- Public: **JA** (wichtig, damit die Portrait-URLs direkt funktionieren)
- File size limit: 10 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

Dann zu Policies dieses Buckets:

**Policy: Public read**
- SELECT, alle Rollen, USING: `bucket_id = 'profile-photos'`

**Policy: Authenticated upload**  
- INSERT, Rolle `authenticated`, WITH CHECK: `bucket_id = 'profile-photos'`

### 3. Dev-Server neu starten

Strg+C dann `npm run dev`, damit die neuen Spalten in den TypeScript-Types erkannt werden.

### 4. Testen

- Öffne `/profile` → neuer Link 'Profil bearbeiten'
- Klick → Editor mit Live-Preview rechts
- Fülle Felder aus, wähle Schwerpunkte, füge Leistungen hinzu
- Nach 2s Inaktivität sollte 'Gespeichert' erscheinen
- Öffne Inkognito-Fenster: `/doc/<dein-slug>` → alles sollte jetzt voll ausgefüllt sein"

---

## Bekannte Probleme und Hinweise

**TypeScript-Types:** Die neuen Supabase-Spalten (`first_name`, `last_name`, etc.) sind in TypeScript zunächst als `any` bekannt. Optional kann man später `npx supabase gen types typescript` ausführen, um types zu regenerieren — für MVP nicht nötig.

**Auto-Save bei jedem Tastendruck:** Der `useEffect` triggert bei jedem `setData`-Call, was beim Tippen in Textfeldern zu vielen Auto-Save-Zyklen führt. Das `2000ms` Timeout debounced das aber korrekt. Kein Handlungsbedarf.

**Custom-IDs:** Fachgebiete und Leistungen, die der Arzt frei eingegeben hat, haben IDs wie `custom:Digitale Volumentomographie` bzw. `custom:{timestamp}`. Diese werden im Renderer als freie Texte behandelt, nicht als Master-Referenz. Korrekt so.

**Slug-Update:** Bei Namensänderung wird der Slug automatisch aktualisiert. Das heißt: Wenn Berk seinen Vornamen auf "Mehmet" ändert, ändert sich der öffentliche Link von `/doc/berk-baysal` zu `/doc/mehmet-baysal`. Alte Links funktionieren nicht mehr. Ist so gewollt für Phase 8 — in Phase 10 könnte der Slug entkoppelt werden.

---

*Ende Phase 8*
