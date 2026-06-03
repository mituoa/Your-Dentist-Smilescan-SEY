-- Eingangskanal pro Submission (Klassifikation, keine Routing-Logik)
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS intake_channel text NOT NULL DEFAULT 'patient_upload';

ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_intake_channel_check;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_intake_channel_check
  CHECK (
    intake_channel IN (
      'patient_upload',
      'practice_manual',
      'follow_up',
      'recall',
      'unknown'
    )
  );

COMMENT ON COLUMN public.submissions.intake_channel IS
  'Eingangskanal: patient_upload | practice_manual | follow_up | recall | unknown';

-- Sicheres Backfill: Praxis-Fälle (Migration 023-Felder), keine Heuristik über urgency allein
UPDATE public.submissions
SET intake_channel = 'practice_manual'
WHERE intake_channel = 'patient_upload'
  AND (
    patient_birth_date IS NOT NULL
    OR NULLIF(TRIM(patient_external_id), '') IS NOT NULL
    OR is_draft = true
  );
