-- Phase 11d: support multiple assignees per task

CREATE TABLE IF NOT EXISTS task_assignees (
  task_id uuid NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees (user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees (task_id);

-- Backfill old single-recipient tasks into assignee rows
INSERT INTO task_assignees (task_id, user_id)
SELECT id, specific_recipient_id
FROM tasks
WHERE recipient_type = 'specific_person'::task_recipient
  AND specific_recipient_id IS NOT NULL
ON CONFLICT (task_id, user_id) DO NOTHING;

ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace members read task assignees" ON task_assignees;
CREATE POLICY "workspace members read task assignees"
  ON task_assignees FOR SELECT
  USING (
    task_id IN (
      SELECT id
      FROM tasks
      WHERE workspace_id = current_workspace_id()
        AND (
          current_user_is_doctor()
          OR recipient_type = 'all_team'::task_recipient
          OR (
            recipient_type = 'specific_person'::task_recipient
            AND (
              specific_recipient_id = auth.uid()
              OR EXISTS (
                SELECT 1
                FROM task_assignees ta
                WHERE ta.task_id = tasks.id
                  AND ta.user_id = auth.uid()
              )
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workspace members create task assignees" ON task_assignees;
CREATE POLICY "workspace members create task assignees"
  ON task_assignees FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id
      FROM tasks
      WHERE workspace_id = current_workspace_id()
        AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "task creators delete task assignees" ON task_assignees;
CREATE POLICY "task creators delete task assignees"
  ON task_assignees FOR DELETE
  USING (
    task_id IN (
      SELECT id
      FROM tasks
      WHERE workspace_id = current_workspace_id()
        AND created_by = auth.uid()
    )
  );

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
        AND (
          specific_recipient_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM task_assignees ta
            WHERE ta.task_id = tasks.id
              AND ta.user_id = auth.uid()
          )
        )
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
        AND (
          specific_recipient_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM task_assignees ta
            WHERE ta.task_id = tasks.id
              AND ta.user_id = auth.uid()
          )
        )
      )
    )
  );

NOTIFY pgrst, 'reload schema';
