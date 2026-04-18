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
