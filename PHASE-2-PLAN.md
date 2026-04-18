# PHASE 2 — Datenmodell in Supabase

> **Für Cursor Agent:** Arbeite diesen Plan Schritt für Schritt ab. Erstelle alle SQL-Dateien lokal im Repo. Nach dem Erstellen der Dateien STOPPE und übergib an den Menschen — er muss die SQL-Migrations manuell in Supabase ausführen, weil du keinen Supabase-Zugriff hast.

> **Für den Menschen:** Cursor erstellt in diesem Plan nur SQL-Dateien lokal. Am Ende kopierst du den Inhalt in Supabase SQL Editor und klickst Run. Ich führe dich dann Schritt für Schritt durch.

---

## Übersicht der Tabellen

Wir legen 6 Tabellen an, die das gesamte SmileScan MVP abbilden:

| Tabelle | Zweck |
|---|---|
| `workspaces` | Eine Praxis (Arzt + Team) |
| `workspace_members` | Welcher User gehört zu welcher Praxis, mit welcher Rolle |
| `submissions` | Eine Foto-Einsendung eines Patienten |
| `submission_photos` | Die einzelnen Fotos pro Submission |
| `tasks` | Aufgaben, die an einer Submission hängen |
| `profile_data` | Die bearbeitbaren Felder des öffentlichen Arzt-Profils |
| `journal_entries` | Artikel im Journal |

Plus: **Row Level Security (RLS)** auf jeder Tabelle, damit ein Arzt nur seine eigenen Daten sieht.

---

## Schritt 1 — SQL-Ordner anlegen

```bash
mkdir -p supabase/migrations
```

---

## Schritt 2 — Datei `supabase/migrations/001_workspaces.sql` erstellen

```sql
-- ============================================================================
-- 001_workspaces.sql
-- Workspace = eine Praxis (Arzt + Team)
-- ============================================================================

CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_slug ON workspaces(slug);

-- workspace_members verknüpft auth.users mit workspaces
CREATE TYPE workspace_role AS ENUM ('doctor', 'team');

CREATE TABLE workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'team',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);

-- Helper Function: Gibt workspace_id des aktuellen Users zurück
CREATE OR REPLACE FUNCTION current_workspace_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Helper Function: Ist current user ein doctor?
CREATE OR REPLACE FUNCTION current_user_is_doctor()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM workspace_members
    WHERE user_id = auth.uid() AND role = 'doctor'
  );
$$;

-- RLS aktivieren
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policy: User sieht nur seinen eigenen Workspace
CREATE POLICY "members can read own workspace"
  ON workspaces FOR SELECT
  USING (id = current_workspace_id());

CREATE POLICY "doctor can update own workspace"
  ON workspaces FOR UPDATE
  USING (id = current_workspace_id() AND current_user_is_doctor());

-- Policy: Member sieht andere Members seines Workspaces
CREATE POLICY "members can read members of own workspace"
  ON workspace_members FOR SELECT
  USING (workspace_id = current_workspace_id());

-- Policy: Nur doctor kann Members verwalten
CREATE POLICY "doctor can manage members"
  ON workspace_members FOR ALL
  USING (workspace_id = current_workspace_id() AND current_user_is_doctor())
  WITH CHECK (workspace_id = current_workspace_id() AND current_user_is_doctor());
```

---

## Schritt 3 — Datei `supabase/migrations/002_submissions.sql` erstellen

```sql
-- ============================================================================
-- 002_submissions.sql
-- Submission = Foto-Einsendung eines Patienten
-- Photos = einzelne Fotos innerhalb einer Submission
-- ============================================================================

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Patient-Info (minimal, keine Identifikation)
  patient_name text,
  patient_email text,
  patient_phone text,
  patient_notes text,

  -- Status (minimal für MVP: nur "seen or not")
  seen_at timestamptz,
  seen_by uuid REFERENCES auth.users(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_workspace ON submissions(workspace_id);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);

CREATE TABLE submission_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_submission_photos_submission ON submission_photos(submission_id);

-- RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_photos ENABLE ROW LEVEL SECURITY;

-- Members können Submissions ihres Workspaces sehen
CREATE POLICY "members read own submissions"
  ON submissions FOR SELECT
  USING (workspace_id = current_workspace_id());

-- Members können Submissions als "gesehen" markieren (update)
CREATE POLICY "members update own submissions"
  ON submissions FOR UPDATE
  USING (workspace_id = current_workspace_id());

-- Photos: gleiche Logik wie Submissions
CREATE POLICY "members read own submission photos"
  ON submission_photos FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE workspace_id = current_workspace_id()
    )
  );

-- INSERT für Submissions/Photos: macht später der öffentliche Upload-Endpoint
-- mit SERVICE_ROLE_KEY, nicht RLS-kontrolliert
```

---

## Schritt 4 — Datei `supabase/migrations/003_tasks.sql` erstellen

```sql
-- ============================================================================
-- 003_tasks.sql
-- Task = Aufgabe, die an einer Submission hängt
-- ============================================================================

CREATE TYPE task_recipient AS ENUM ('doctor_only', 'all_team', 'specific_person');

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,

  content text NOT NULL,
  recipient_type task_recipient NOT NULL,
  specific_recipient_id uuid REFERENCES auth.users(id),

  created_by uuid NOT NULL REFERENCES auth.users(id),
  done_at timestamptz,
  done_by uuid REFERENCES auth.users(id),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_submission ON tasks(submission_id);
CREATE INDEX idx_tasks_recipient ON tasks(specific_recipient_id);
CREATE INDEX idx_tasks_open ON tasks(workspace_id, done_at) WHERE done_at IS NULL;

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Arzt sieht alle Tasks seines Workspaces
-- Team-Member sieht nur Tasks die für "all_team" oder speziell für ihn sind
CREATE POLICY "tasks visibility"
  ON tasks FOR SELECT
  USING (
    workspace_id = current_workspace_id()
    AND (
      current_user_is_doctor()
      OR recipient_type = 'all_team'
      OR (recipient_type = 'specific_person' AND specific_recipient_id = auth.uid())
    )
  );

-- Jeder Member kann Tasks erstellen
CREATE POLICY "members create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    workspace_id = current_workspace_id()
    AND created_by = auth.uid()
  );

-- Nur Arzt kann Tasks abhaken (done_at setzen)
CREATE POLICY "doctor marks tasks done"
  ON tasks FOR UPDATE
  USING (workspace_id = current_workspace_id() AND current_user_is_doctor());
```

---

## Schritt 5 — Datei `supabase/migrations/004_profile_data.sql` erstellen

```sql
-- ============================================================================
-- 004_profile_data.sql
-- Profile = das öffentliche Arzt-Profil, sichtbar auf /doc/[slug]
-- Pro Workspace gibt es genau ein Profile
-- ============================================================================

CREATE TABLE profile_data (
  workspace_id uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Hero
  display_name text,
  title text,
  photo_url text,

  -- Vita
  vita_markdown text,

  -- Services (JSON-Array von Strings)
  services jsonb DEFAULT '[]'::jsonb,

  -- Workspace-Info
  practice_name text,
  practice_address text,
  practice_employment_status text,
  practice_phone text,
  practice_email text,
  practice_website text,

  -- Terminlink (für "Termin senden" Button)
  appointment_link text,

  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE profile_data ENABLE ROW LEVEL SECURITY;

-- Members können eigenes Profil lesen
CREATE POLICY "members read own profile"
  ON profile_data FOR SELECT
  USING (workspace_id = current_workspace_id());

-- Nur Arzt darf das Profil bearbeiten
CREATE POLICY "doctor updates profile"
  ON profile_data FOR UPDATE
  USING (workspace_id = current_workspace_id() AND current_user_is_doctor());

CREATE POLICY "doctor inserts profile"
  ON profile_data FOR INSERT
  WITH CHECK (workspace_id = current_workspace_id() AND current_user_is_doctor());

-- ÖFFENTLICHE Policy: JEDER darf profile lesen (für /doc/[slug] öffentliche Seite)
CREATE POLICY "public can read all profiles"
  ON profile_data FOR SELECT
  USING (true);
```

---

## Schritt 6 — Datei `supabase/migrations/005_journal.sql` erstellen

```sql
-- ============================================================================
-- 005_journal.sql
-- Journal = Artikel, die der Arzt schreibt
-- Status nur Draft oder Published
-- ============================================================================

CREATE TYPE journal_status AS ENUM ('draft', 'published');

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  title text NOT NULL,
  slug text NOT NULL,
  content_markdown text,
  cover_url text,

  status journal_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,

  author_id uuid NOT NULL REFERENCES auth.users(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_journal_workspace ON journal_entries(workspace_id);
CREATE INDEX idx_journal_published ON journal_entries(workspace_id, published_at DESC) WHERE status = 'published';

-- RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Members sehen alle Einträge ihres Workspaces (auch drafts)
CREATE POLICY "members read own journal"
  ON journal_entries FOR SELECT
  USING (workspace_id = current_workspace_id());

-- Nur Arzt erstellt/ändert Einträge
CREATE POLICY "doctor writes journal"
  ON journal_entries FOR ALL
  USING (workspace_id = current_workspace_id() AND current_user_is_doctor())
  WITH CHECK (workspace_id = current_workspace_id() AND current_user_is_doctor());

-- ÖFFENTLICHE Policy: Jeder darf PUBLISHED Einträge lesen
CREATE POLICY "public reads published journal"
  ON journal_entries FOR SELECT
  USING (status = 'published');
```

---

## Schritt 7 — Datei `supabase/migrations/006_signup_trigger.sql` erstellen

```sql
-- ============================================================================
-- 006_signup_trigger.sql
-- Wenn ein neuer User sich registriert, automatisch:
-- 1. Neuen Workspace anlegen (Name aus User-Metadata oder "Meine Praxis")
-- 2. User als 'doctor' in den Workspace eintragen
-- 3. Leeres profile_data anlegen
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id uuid;
  workspace_name text;
  workspace_slug text;
BEGIN
  -- Workspace-Name aus Metadata oder Default
  workspace_name := COALESCE(
    NEW.raw_user_meta_data->>'workspace_name',
    'Meine Praxis'
  );

  -- Slug aus Email generieren (erstmal einfach)
  workspace_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));

  -- Uniqueness sicherstellen
  WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = workspace_slug) LOOP
    workspace_slug := workspace_slug || '-' || substring(gen_random_uuid()::text, 1, 4);
  END LOOP;

  -- Workspace anlegen
  INSERT INTO workspaces (name, slug) VALUES (workspace_name, workspace_slug)
  RETURNING id INTO new_workspace_id;

  -- User als doctor einfügen
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'doctor');

  -- Leeres Profile anlegen
  INSERT INTO profile_data (workspace_id, display_name)
  VALUES (new_workspace_id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  RETURN NEW;
END;
$$;

-- Trigger auf auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Schritt 8 — Commit erstellen

```bash
git add supabase/
git commit -m "feat: phase 2 — SQL migrations for data model"
```

---

## Schritt 9 — STOP und Übergabe an den Menschen

**Für Cursor Agent:** Halte hier an. Erstelle KEINE weiteren Dateien. Führe KEINE Supabase-Befehle aus (du hast keinen Zugriff).

**Melde dem Menschen:**
"Alle 6 SQL-Migrations sind im Ordner `supabase/migrations/` erstellt. Jetzt musst du sie in Supabase ausführen. Folge dem Abschnitt 'SUPABASE-AUSFÜHRUNG' im Plan."

---

## SUPABASE-AUSFÜHRUNG — der Mensch macht das

### Was du jetzt tust

1. **Öffne Supabase Dashboard** → dein Projekt SmileScan® OS
2. **Links auf "SQL Editor"** (Terminal-Symbol, oben im Menü)
3. **Oben rechts "New query"** klicken

### Ausführung in dieser exakten Reihenfolge

Jede Datei einzeln ausführen. Nicht alle auf einmal.

**1. `001_workspaces.sql`** zuerst
- In Cursor öffnen, kompletten Inhalt kopieren
- In Supabase SQL Editor einfügen
- **"Run"** klicken (unten rechts oder Strg+Enter)
- Warten auf "Success. No rows returned"

**2. `002_submissions.sql`**
- "New query" für neues leeres Feld
- Inhalt kopieren, einfügen, Run

**3. `003_tasks.sql`**
- Gleiche Prozedur

**4. `004_profile_data.sql`**
- Gleiche Prozedur

**5. `005_journal.sql`**
- Gleiche Prozedur

**6. `006_signup_trigger.sql`**
- Gleiche Prozedur

### Verifikation

Nach allen 6 Migrations, neue Query im SQL Editor:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Erwartete Ausgabe:
- `journal_entries`
- `profile_data`
- `submission_photos`
- `submissions`
- `tasks`
- `workspace_members`
- `workspaces`

### Storage Bucket anlegen

Falls noch nicht gemacht:

1. Links in Supabase → **Storage**
2. **"New bucket"**
3. Name: `submission-photos`
4. **Public: AUS**
5. **Save**

### Storage Policies anlegen

Im Storage-Bereich, Bucket `submission-photos` auswählen → Tab "Policies":

**Policy 1 — Öffentlicher Upload (für Patient-Uploads):**
- "New Policy" → "For full customization" → "Get started quickly" überspringen
- Name: `Anyone can upload to submissions`
- Allowed operation: **INSERT**
- Target roles: `public`
- USING expression: leer lassen
- WITH CHECK: `bucket_id = 'submission-photos'`
- Save

**Policy 2 — Members können Fotos ihres Workspaces lesen:**
- Name: `Members can read their workspace photos`
- Allowed operation: **SELECT**
- Target roles: `authenticated`
- USING: `bucket_id = 'submission-photos'`
- Save

---

## Abschluss

Wenn alle 6 SQL-Queries erfolgreich waren und Storage Bucket + Policies angelegt sind:

1. Melde dem Chat: "Phase 2 erledigt, alle Tabellen in Supabase angelegt"
2. Wir gehen direkt zu Phase 3 (Auth-Flow)

### Bei Fehlern

Wenn eine Query einen Fehler wirft (z.B. "type already exists"), sag mir im Chat Bescheid und zitiere den Fehler. Das ist meist eine Reihenfolgen-Frage die schnell gefixt wird.

---

*Ende Phase 2*
