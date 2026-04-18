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
