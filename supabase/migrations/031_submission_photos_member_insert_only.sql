-- ============================================================================
-- 031: submission_photos INSERT nur noch für Workspace-Mitglieder (RLS).
-- Öffentliche Patienten-Uploads nutzen den **Service Role (Admin-Client)** und
-- umgehen RLS — sie hängen nicht an dieser Policy.
-- ============================================================================

DROP POLICY IF EXISTS "public can create submission photos" ON public.submission_photos;

CREATE POLICY "members insert submission photos for own workspace"
  ON public.submission_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      WHERE s.id = submission_id
        AND s.workspace_id = public.current_workspace_id()
    )
  );
