-- ============================================================================
-- 029_workspace_contracts_license_sides.sql
-- Zahnarztausweis: Vorder-/Rückseite getrennt speichern
-- ============================================================================

ALTER TABLE workspace_contracts
  ADD COLUMN IF NOT EXISTS dentist_license_storage_path_front text,
  ADD COLUMN IF NOT EXISTS dentist_license_storage_path_back text;

NOTIFY pgrst, 'reload schema';

