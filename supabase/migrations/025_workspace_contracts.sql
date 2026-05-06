-- ============================================================================
-- 025_workspace_contracts.sql
-- Vertrag / Abo-Auswahl beim Signup (für rechtssichere Nachvollziehbarkeit)
-- ============================================================================

CREATE TYPE IF NOT EXISTS billing_interval AS ENUM ('monthly', 'halfyearly', 'yearly');

CREATE TABLE IF NOT EXISTS workspace_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  billing_interval billing_interval NOT NULL,
  contract_version text NOT NULL,
  accepted_at timestamptz NOT NULL,

  accepted_tos boolean NOT NULL DEFAULT false,
  accepted_privacy boolean NOT NULL DEFAULT false,
  accepted_withdrawal boolean NOT NULL DEFAULT false,

  dentist_license_number text,
  dentist_license_storage_path text,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_contracts_user ON workspace_contracts(user_id);

ALTER TABLE workspace_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read own workspace contracts"
  ON workspace_contracts FOR SELECT
  USING (workspace_id = current_workspace_id());

-- Inserts/Updates laufen via SERVICE_ROLE (Server Action / Admin Client)

NOTIFY pgrst, 'reload schema';

