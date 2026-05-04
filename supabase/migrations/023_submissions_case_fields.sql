-- Extra fields for cases created from the practice UI ("Neuer Fall")
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS patient_birth_date date,
  ADD COLUMN IF NOT EXISTS patient_external_id text,
  ADD COLUMN IF NOT EXISTS urgency text,
  ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.submissions.urgency IS 'Triage from practice: not_urgent | this_week | today';
