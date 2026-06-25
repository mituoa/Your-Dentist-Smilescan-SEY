-- ============================================================================
-- Projektanfragen — Digitale Praxislösungen (geschützter Praxisbereich)
-- Datei: supabase/runbooks/02-practice-solution-requests.sql
-- ============================================================================

CREATE TYPE platform_practice_solution_request_status AS ENUM (
  'received',
  'in_review',
  'consultation_scheduled',
  'project_started'
);

CREATE TABLE platform_practice_solution_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  solution_id text NOT NULL,
  solution_title text NOT NULL,
  practice_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  budget text,
  timeline text,
  status platform_practice_solution_request_status NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_practice_solution_requests_workspace
  ON platform_practice_solution_requests(workspace_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_platform_practice_solution_request_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER platform_practice_solution_requests_updated_at
  BEFORE UPDATE ON platform_practice_solution_requests
  FOR EACH ROW EXECUTE FUNCTION set_platform_practice_solution_request_updated_at();

ALTER TABLE platform_practice_solution_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors read own workspace solution requests"
  ON platform_practice_solution_requests FOR SELECT
  TO authenticated
  USING (
    workspace_id IS NOT NULL
    AND workspace_id = current_workspace_id()
  );
