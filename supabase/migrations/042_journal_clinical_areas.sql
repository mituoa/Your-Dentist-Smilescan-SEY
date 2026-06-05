-- Journal V6: klinische Themenbereiche + Inhaltstyp (Bibliotheks-Denken statt CMS-Kategorien)

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS clinical_area text,
  ADD COLUMN IF NOT EXISTS content_type text;

COMMENT ON COLUMN journal_entries.clinical_area IS
  'Klinischer Wissensbereich (lib/journal/clinical-areas.ts), z. B. implantologie';
COMMENT ON COLUMN journal_entries.content_type IS
  'Inhaltstyp: erklaerung | nachsorge | faq | praxiswissen';

CREATE INDEX IF NOT EXISTS idx_journal_workspace_clinical_area
  ON journal_entries(workspace_id, clinical_area)
  WHERE status = 'published' AND clinical_area IS NOT NULL;
