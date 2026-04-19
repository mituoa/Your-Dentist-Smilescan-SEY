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
