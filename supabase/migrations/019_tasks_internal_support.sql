-- Phase 11c: allow internal (non-submission) tasks
ALTER TABLE tasks
  ALTER COLUMN submission_id DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
