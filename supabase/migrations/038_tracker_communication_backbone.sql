-- ============================================================================
-- 038_tracker_communication_backbone.sql
-- Echter Patientenversand (outbound_messages), persistenter Praxisstatus,
-- Fotoanforderung, Verlaufsserien-Vorbereitung.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  patient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  message_kind text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message text,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbound_messages_kind_check
    CHECK (message_kind IN ('reply', 'question', 'photo_request', 'appointment_offer')),
  CONSTRAINT outbound_messages_status_check
    CHECK (status IN ('draft', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_outbound_messages_workspace
  ON public.outbound_messages (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outbound_messages_submission
  ON public.outbound_messages (submission_id, created_at DESC);

COMMENT ON TABLE public.outbound_messages IS
  'Versandhistorie an Patient:innen (E-Mail); status sent nur nach erfolgreichem SMTP-Versand.';

ALTER TABLE public.outbound_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members read workspace outbound messages" ON public.outbound_messages;
CREATE POLICY "members read workspace outbound messages"
  ON public.outbound_messages FOR SELECT
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS "members insert workspace outbound messages" ON public.outbound_messages;
CREATE POLICY "members insert workspace outbound messages"
  ON public.outbound_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id = public.current_workspace_id()
    AND EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id AND s.workspace_id = outbound_messages.workspace_id
    )
  );

DROP POLICY IF EXISTS "members update workspace outbound messages" ON public.outbound_messages;
CREATE POLICY "members update workspace outbound messages"
  ON public.outbound_messages FOR UPDATE
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

-- ── follow_up_series (Vorbereitung Verlaufskontrolle) ───────────────────────

CREATE TABLE IF NOT EXISTS public.follow_up_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  patient_external_id text,
  title text,
  type text NOT NULL DEFAULT 'follow_up',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follow_up_series_status_check
    CHECK (status IN ('active', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_follow_up_series_workspace
  ON public.follow_up_series (workspace_id, created_at DESC);

ALTER TABLE public.follow_up_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members read workspace follow up series" ON public.follow_up_series;
CREATE POLICY "members read workspace follow up series"
  ON public.follow_up_series FOR SELECT
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS "members insert workspace follow up series" ON public.follow_up_series;
CREATE POLICY "members insert workspace follow up series"
  ON public.follow_up_series FOR INSERT
  TO authenticated
  WITH CHECK (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS "members update workspace follow up series" ON public.follow_up_series;
CREATE POLICY "members update workspace follow up series"
  ON public.follow_up_series FOR UPDATE
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

-- ── submissions Erweiterungen ───────────────────────────────────────────────

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS practice_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS photo_request_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS follow_up_series_id uuid REFERENCES public.follow_up_series(id) ON DELETE SET NULL;

ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_practice_status_check;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_practice_status_check
  CHECK (
    practice_status IN (
      'new',
      'in_progress',
      'waiting_for_patient',
      'photo_requested',
      'watching',
      'resolved'
    )
  );

CREATE INDEX IF NOT EXISTS idx_submissions_practice_status
  ON public.submissions (workspace_id, practice_status);

-- Backfill aus bisherigem seen_at-Verhalten
UPDATE public.submissions
SET practice_status = 'in_progress'
WHERE seen_at IS NOT NULL
  AND practice_status = 'new';

UPDATE public.submissions s
SET practice_status = 'waiting_for_patient'
WHERE EXISTS (
  SELECT 1 FROM public.message_drafts md
  WHERE md.submission_id = s.id AND md.status = 'sent'
)
AND practice_status NOT IN ('resolved', 'watching');

CREATE OR REPLACE FUNCTION public.set_outbound_messages_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outbound_messages_updated_at ON public.outbound_messages;
CREATE TRIGGER trg_outbound_messages_updated_at
BEFORE UPDATE ON public.outbound_messages
FOR EACH ROW
EXECUTE FUNCTION public.set_outbound_messages_updated_at();

NOTIFY pgrst, 'reload schema';
