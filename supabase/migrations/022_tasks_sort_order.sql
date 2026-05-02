-- Phase 13: persistent column ordering for cards board

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS sort_order bigint NOT NULL DEFAULT 0;

UPDATE tasks
SET sort_order = (EXTRACT(EPOCH FROM created_at) * 1000)::bigint
WHERE sort_order = 0;

CREATE INDEX IF NOT EXISTS idx_tasks_board_order
  ON tasks (workspace_id, status, priority, sort_order, created_at);

NOTIFY pgrst, 'reload schema';
