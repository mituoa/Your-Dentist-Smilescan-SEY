-- ============================================================================
-- 028_workspace_billing.sql
-- Stripe Billing status per workspace
-- ============================================================================

CREATE TYPE IF NOT EXISTS billing_status AS ENUM (
  'pending',
  'active',
  'past_due',
  'canceled'
);

CREATE TABLE IF NOT EXISTS workspace_billing (
  workspace_id uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  status billing_status NOT NULL DEFAULT 'pending',

  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,

  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workspace_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read own workspace billing"
  ON workspace_billing FOR SELECT
  USING (workspace_id = current_workspace_id());

NOTIFY pgrst, 'reload schema';

