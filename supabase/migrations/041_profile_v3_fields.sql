-- Profile V3: persönlicher Behandlungsansatz + Ausbildung & Werdegang

ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS profile_personal_approach text,
  ADD COLUMN IF NOT EXISTS profile_career_path jsonb DEFAULT '[]'::jsonb;

ALTER TABLE profile_data
  DROP CONSTRAINT IF EXISTS profile_career_path_is_array;

ALTER TABLE profile_data
  ADD CONSTRAINT profile_career_path_is_array
  CHECK (profile_career_path IS NULL OR jsonb_typeof(profile_career_path) = 'array');

COMMENT ON COLUMN profile_data.profile_personal_approach IS 'Optional: persönliche Worte / Behandlungsansatz';
COMMENT ON COLUMN profile_data.profile_career_path IS 'Optional: Ausbildung & Werdegang als String-Array';
