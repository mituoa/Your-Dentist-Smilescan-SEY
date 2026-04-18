-- ============================================================================
-- 005_journal.sql
-- Journal = Artikel, die der Arzt schreibt
-- Status nur Draft oder Published
-- ============================================================================

CREATE TYPE journal_status AS ENUM ('draft', 'published');

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  title text NOT NULL,
  slug text NOT NULL,
  content_markdown text,
  cover_url text,

  status journal_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,

  author_id uuid NOT NULL REFERENCES auth.users(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_journal_workspace ON journal_entries(workspace_id);
CREATE INDEX idx_journal_published ON journal_entries(workspace_id, published_at DESC) WHERE status = 'published';

-- RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Members sehen alle Einträge ihres Workspaces (auch drafts)
CREATE POLICY "members read own journal"
  ON journal_entries FOR SELECT
  USING (workspace_id = current_workspace_id());

-- Nur Arzt erstellt/ändert Einträge
CREATE POLICY "doctor writes journal"
  ON journal_entries FOR ALL
  USING (workspace_id = current_workspace_id() AND current_user_is_doctor())
  WITH CHECK (workspace_id = current_workspace_id() AND current_user_is_doctor());

-- ÖFFENTLICHE Policy: Jeder darf PUBLISHED Einträge lesen
CREATE POLICY "public reads published journal"
  ON journal_entries FOR SELECT
  USING (status = 'published');
