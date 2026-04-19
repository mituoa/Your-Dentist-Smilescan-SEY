-- Phase 9: Journal columns + draft-friendly nulls (aligns app with nullable title/slug).
-- Public SELECT for published rows already exists in 005_journal.sql ("public reads published journal").

ALTER TABLE journal_entries
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN slug DROP NOT NULL;

ALTER TABLE journal_entries
  RENAME COLUMN cover_url TO cover_photo_url;

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer,
  ADD COLUMN IF NOT EXISTS word_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_journal_workspace_status_published
  ON journal_entries(workspace_id, status, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_journal_slug
  ON journal_entries(workspace_id, slug);

COMMENT ON COLUMN journal_entries.topic IS 'Eines der 6 Themen aus lib/masterdata/journal-topics.ts';
COMMENT ON COLUMN journal_entries.reading_time_minutes IS 'Berechnet aus word_count / 200';
