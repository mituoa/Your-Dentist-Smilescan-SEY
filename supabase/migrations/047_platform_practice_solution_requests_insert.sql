-- ============================================================================
-- 047_platform_practice_solution_requests_insert.sql
-- INSERT für Landingpage-Anfragen (Fallback ohne Service Role) + Storage-Bucket
-- ============================================================================

DROP POLICY IF EXISTS "doctors insert own workspace solution requests"
  ON platform_practice_solution_requests;

CREATE POLICY "doctors insert own workspace solution requests"
  ON platform_practice_solution_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IS NOT NULL
    AND workspace_id = current_workspace_id()
    AND EXISTS (
      SELECT 1
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
        AND wm.workspace_id = platform_practice_solution_requests.workspace_id
        AND wm.role = 'doctor'
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-practice-solution-requests',
  'platform-practice-solution-requests',
  false,
  524288,
  ARRAY['application/json']::text[]
)
ON CONFLICT (id) DO NOTHING;
