-- ============================================================================
-- 035_message_drafts.sql
-- Persistente Antwortentwürfe (Command AI, Tracker, spätere Care Journeys).
-- Kein Auto-Versand — status "sent" nur durch explizite Server-Action.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.message_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by_kind text NOT NULL,
  created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT message_drafts_status_check
    CHECK (status IN ('draft', 'approved', 'sent')),
  CONSTRAINT message_drafts_created_by_kind_check
    CHECK (created_by_kind IN ('ai', 'user'))
);

CREATE INDEX IF NOT EXISTS idx_message_drafts_workspace
  ON public.message_drafts (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_drafts_submission
  ON public.message_drafts (submission_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_drafts_submission_status
  ON public.message_drafts (submission_id, status, updated_at DESC);

COMMENT ON TABLE public.message_drafts IS
  'Antwortentwürfe pro Einsendung; Freigabe und Versand nur durch Praxis (Server Actions).';

ALTER TABLE public.message_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members read workspace message drafts" ON public.message_drafts;
CREATE POLICY "members read workspace message drafts"
  ON public.message_drafts FOR SELECT
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS "members insert workspace message drafts" ON public.message_drafts;
CREATE POLICY "members insert workspace message drafts"
  ON public.message_drafts FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id = public.current_workspace_id()
    AND EXISTS (
      SELECT 1
      FROM public.submissions s
      WHERE s.id = submission_id
        AND s.workspace_id = message_drafts.workspace_id
    )
  );

DROP POLICY IF EXISTS "members update workspace message drafts" ON public.message_drafts;
CREATE POLICY "members update workspace message drafts"
  ON public.message_drafts FOR UPDATE
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

CREATE OR REPLACE FUNCTION public.set_message_drafts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_message_drafts_updated_at ON public.message_drafts;
CREATE TRIGGER trg_message_drafts_updated_at
BEFORE UPDATE ON public.message_drafts
FOR EACH ROW
EXECUTE FUNCTION public.set_message_drafts_updated_at();

NOTIFY pgrst, 'reload schema';
