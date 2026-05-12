-- ============================================================================
-- 032: submissions INSERT — „public WITH CHECK (true)“ nur noch für **anon**.
-- Authentifizierte Anlage läuft über **„members insert workspace submissions“** (024).
-- Öffentliche Patienten-Flows im Code nutzen den **Admin-Client** (RLS-frei).
-- ============================================================================

DROP POLICY IF EXISTS "public can create submissions" ON public.submissions;

CREATE POLICY "anon can create submissions"
  ON public.submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);
