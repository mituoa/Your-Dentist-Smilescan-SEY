-- Öffentliche Profilbühne: Hintergrundgrundfarbe (Carree-Editorial)
ALTER TABLE profile_data
  ADD COLUMN IF NOT EXISTS profile_background_color text DEFAULT '#F2EFE9';

ALTER TABLE profile_data
  DROP CONSTRAINT IF EXISTS profile_background_color_format;

ALTER TABLE profile_data
  ADD CONSTRAINT profile_background_color_format
  CHECK (
    profile_background_color IS NULL
    OR profile_background_color ~ '^#[0-9A-Fa-f]{6}$'
  );
