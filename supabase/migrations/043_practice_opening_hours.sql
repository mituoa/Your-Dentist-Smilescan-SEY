-- Structured opening hours for settings (syncs to practice_hours text for public profile)

ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS opening_hours_config jsonb;

COMMENT ON COLUMN profile_data.opening_hours_config IS
  'Structured weekly/special opening hours; rendered to practice_hours for public profile.';

NOTIFY pgrst, 'reload schema';
