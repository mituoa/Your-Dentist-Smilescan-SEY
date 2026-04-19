-- Erweiterung der profile_data Tabelle für Phase 8
-- Hinweis: title existiert bereits (004); nicht erneut anlegen.

ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS founding_year integer,
  ADD COLUMN IF NOT EXISTS specializations jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_structured jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS practice_hours text;

ALTER TABLE profile_data
  DROP CONSTRAINT IF EXISTS founding_year_range;

ALTER TABLE profile_data
  ADD CONSTRAINT founding_year_range
  CHECK (founding_year IS NULL OR (founding_year >= 1900 AND founding_year <= 2100));

COMMENT ON COLUMN profile_data.specializations IS 'Array von Strings (Fachgebiete). Masterliste in lib/masterdata/specializations.ts';
COMMENT ON COLUMN profile_data.services_structured IS 'Array von Objekten: [{ id: string, name: string, note: string, custom: boolean }]';
