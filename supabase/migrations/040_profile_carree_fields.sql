-- Carree-Profil: Untertitel + Auszeichnungen (Referenz-Editor)

ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS practice_subtitle text,
  ADD COLUMN IF NOT EXISTS profile_credentials jsonb DEFAULT '[]'::jsonb;

ALTER TABLE profile_data
  DROP CONSTRAINT IF EXISTS profile_credentials_is_array;

ALTER TABLE profile_data
  ADD CONSTRAINT profile_credentials_is_array
  CHECK (profile_credentials IS NULL OR jsonb_typeof(profile_credentials) = 'array');

COMMENT ON COLUMN profile_data.practice_subtitle IS 'Untertitel unter der Praxis-Headline, z. B. Ihre Praxis in Köln';
COMMENT ON COLUMN profile_data.profile_credentials IS 'Auszeichnungen & Zertifikate als String-Array';
