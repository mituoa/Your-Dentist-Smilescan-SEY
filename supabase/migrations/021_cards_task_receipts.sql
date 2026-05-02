-- Phase 12: Cards foundation (title, priority, delivery/read receipts)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('normal', 'important');
  END IF;
END $$;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS priority task_priority NOT NULL DEFAULT 'normal';

CREATE INDEX IF NOT EXISTS idx_tasks_priority_status_created
  ON tasks (workspace_id, priority, status, created_at DESC);

CREATE TABLE IF NOT EXISTS task_delivery_receipts (
  task_id uuid NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recipient_email text,
  email_message_id text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  last_event text,
  last_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, recipient_user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_delivery_receipts_task
  ON task_delivery_receipts (task_id);
CREATE INDEX IF NOT EXISTS idx_task_delivery_receipts_message
  ON task_delivery_receipts (email_message_id)
  WHERE email_message_id IS NOT NULL;

CREATE OR REPLACE FUNCTION set_task_delivery_receipts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_task_delivery_receipts_updated_at ON task_delivery_receipts;
CREATE TRIGGER trg_task_delivery_receipts_updated_at
BEFORE UPDATE ON task_delivery_receipts
FOR EACH ROW
EXECUTE FUNCTION set_task_delivery_receipts_updated_at();

ALTER TABLE task_delivery_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace members read task delivery receipts" ON task_delivery_receipts;
CREATE POLICY "workspace members read task delivery receipts"
  ON task_delivery_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      WHERE t.id = task_delivery_receipts.task_id
        AND t.workspace_id = current_workspace_id()
        AND (
          current_user_is_doctor()
          OR t.created_by = auth.uid()
          OR task_delivery_receipts.recipient_user_id = auth.uid()
          OR t.recipient_type = 'all_team'::task_recipient
        )
    )
  );

DROP POLICY IF EXISTS "task creators insert delivery receipts" ON task_delivery_receipts;
CREATE POLICY "task creators insert delivery receipts"
  ON task_delivery_receipts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM tasks t
      WHERE t.id = task_delivery_receipts.task_id
        AND t.workspace_id = current_workspace_id()
        AND t.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "recipients update own read receipt" ON task_delivery_receipts;
CREATE POLICY "recipients update own read receipt"
  ON task_delivery_receipts FOR UPDATE
  USING (
    recipient_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM tasks t
      WHERE t.id = task_delivery_receipts.task_id
        AND t.workspace_id = current_workspace_id()
    )
  )
  WITH CHECK (
    recipient_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM tasks t
      WHERE t.id = task_delivery_receipts.task_id
        AND t.workspace_id = current_workspace_id()
    )
  );

NOTIFY pgrst, 'reload schema';
