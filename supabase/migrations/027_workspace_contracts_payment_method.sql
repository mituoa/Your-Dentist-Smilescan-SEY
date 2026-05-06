-- ============================================================================
-- 027_workspace_contracts_payment_method.sql
-- Zahlungsmethode beim Vertragsabschluss speichern (Setup/Checkout folgt separat)
-- ============================================================================

ALTER TABLE workspace_contracts
  ADD COLUMN IF NOT EXISTS payment_method text;

-- Optional: nur erwartete Werte (soft constraint via CHECK)
ALTER TABLE workspace_contracts
  ADD CONSTRAINT IF NOT EXISTS workspace_contracts_payment_method_check
  CHECK (
    payment_method IS NULL OR payment_method IN ('sepa_debit', 'card', 'invoice', 'paypal')
  );

NOTIFY pgrst, 'reload schema';

