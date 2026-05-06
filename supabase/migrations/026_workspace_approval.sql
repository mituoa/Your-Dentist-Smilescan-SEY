-- ============================================================================
-- 026_workspace_approval.sql
-- Manuelle Freischaltung neuer Zahnarzt-Registrierungen
-- ============================================================================

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Optionaler Index für Admin-Listen
CREATE INDEX IF NOT EXISTS idx_workspaces_approved_at ON workspaces(approved_at);

NOTIFY pgrst, 'reload schema';

