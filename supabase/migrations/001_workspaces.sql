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
