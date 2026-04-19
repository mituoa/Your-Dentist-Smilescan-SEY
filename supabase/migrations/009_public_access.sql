-- ============================================================================
-- 009_public_access.sql
-- Erlaubt öffentliches Lesen von workspaces + profile_data (ohne Login)
-- Erlaubt öffentliches Erstellen von Submissions (anonym, für Upload-Flow)
-- ============================================================================

-- Workspaces: JEDER kann sie lesen (für /doc/[slug])
CREATE POLICY "public can read workspaces by slug"
  ON workspaces FOR SELECT
  USING (true);

-- profile_data: public-Policy existiert schon aus Migration 004
-- (keine Änderung nötig)

-- Submissions: JEDER kann inserts machen (für public Upload)
-- WICHTIG: nur INSERT, kein SELECT/UPDATE/DELETE öffentlich
CREATE POLICY "public can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- submission_photos: JEDER kann inserts machen
CREATE POLICY "public can create submission photos"
  ON submission_photos FOR INSERT
  WITH CHECK (true);
