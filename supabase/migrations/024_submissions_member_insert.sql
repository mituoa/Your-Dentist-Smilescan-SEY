-- Practice UI: eingeloggte Workspace-Mitglieder dürfen Fälle (submissions) anlegen.
-- Die öffentliche Policy (009) reicht je nach Rolle/Konfiguration nicht; diese Policy ist explizit für authenticated.
CREATE POLICY "members insert workspace submissions"
  ON public.submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workspace_members wm
      WHERE wm.user_id = auth.uid()
        AND wm.workspace_id = workspace_id
    )
  );
