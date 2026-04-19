-- Phase 11b: Task workflow (status), comments, RLS

-- 1. Status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('open', 'pending_review', 'done');
  END IF;
END $$;

-- 2. New columns on tasks (created_by / done_by already exist from 003)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS status task_status NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS submitted_for_review_at timestamptz,
  ADD COLUMN IF NOT EXISTS submitted_by_user_id uuid REFERENCES auth.users (id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id uuid REFERENCES auth.users (id),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS due_date timestamptz;

-- Backfill status from legacy done_at
UPDATE tasks
SET status = 'done'
WHERE done_at IS NOT NULL
  AND status = 'open';

UPDATE tasks
SET status = 'open'
WHERE done_at IS NULL
  AND status = 'done';

-- 3. Task comments
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users (id),
  content text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments (task_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_workspace ON tasks (workspace_id, status);

-- 4. RLS task_comments
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace members read task comments" ON task_comments;
CREATE POLICY "workspace members read task comments"
  ON task_comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id = current_workspace_id()
    )
  );

DROP POLICY IF EXISTS "workspace members create task comments" ON task_comments;
CREATE POLICY "workspace members create task comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id = current_workspace_id()
    )
    AND author_id = auth.uid()
  );

DROP POLICY IF EXISTS "authors delete own comments" ON task_comments;
CREATE POLICY "authors delete own comments"
  ON task_comments FOR DELETE
  USING (author_id = auth.uid());

-- 5. Tasks UPDATE policy (replaces 017)
DROP POLICY IF EXISTS "members mark tasks done" ON tasks;

DROP POLICY IF EXISTS "members update tasks per role" ON tasks;
CREATE POLICY "members update tasks per role"
  ON tasks FOR UPDATE
  USING (
    workspace_id = current_workspace_id()
    AND (
      current_user_is_doctor()
      OR recipient_type = 'all_team'::task_recipient
      OR (
        recipient_type = 'specific_person'::task_recipient
        AND specific_recipient_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    workspace_id = current_workspace_id()
    AND (
      current_user_is_doctor()
      OR recipient_type = 'all_team'::task_recipient
      OR (
        recipient_type = 'specific_person'::task_recipient
        AND specific_recipient_id = auth.uid()
      )
    )
  );

NOTIFY pgrst, 'reload schema';
