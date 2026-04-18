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
