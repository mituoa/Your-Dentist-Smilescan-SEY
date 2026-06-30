-- ============================================================================
-- 045_command_ai_chat.sql
-- Persistenter Command-AI-Chat (Praxis + Patienten-Oberfläche).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.command_ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  audience text NOT NULL DEFAULT 'practice',
  public_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT command_ai_sessions_audience_check
    CHECK (audience IN ('practice', 'patient'))
);

CREATE INDEX IF NOT EXISTS idx_command_ai_sessions_workspace_user
  ON public.command_ai_sessions (workspace_id, user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_command_ai_sessions_submission
  ON public.command_ai_sessions (submission_id, updated_at DESC)
  WHERE submission_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.command_ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.command_ai_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT command_ai_messages_role_check
    CHECK (role IN ('user', 'assistant'))
);

CREATE INDEX IF NOT EXISTS idx_command_ai_messages_session
  ON public.command_ai_messages (session_id, created_at ASC);

ALTER TABLE public.command_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members read practice command ai sessions" ON public.command_ai_sessions;
CREATE POLICY "members read practice command ai sessions"
  ON public.command_ai_sessions FOR SELECT
  USING (
    audience = 'practice'
    AND workspace_id = public.current_workspace_id()
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "members insert practice command ai sessions" ON public.command_ai_sessions;
CREATE POLICY "members insert practice command ai sessions"
  ON public.command_ai_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    audience = 'practice'
    AND workspace_id = public.current_workspace_id()
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "members update practice command ai sessions" ON public.command_ai_sessions;
CREATE POLICY "members update practice command ai sessions"
  ON public.command_ai_sessions FOR UPDATE
  USING (
    audience = 'practice'
    AND workspace_id = public.current_workspace_id()
    AND user_id = auth.uid()
  )
  WITH CHECK (
    audience = 'practice'
    AND workspace_id = public.current_workspace_id()
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "members read command ai messages" ON public.command_ai_messages;
CREATE POLICY "members read command ai messages"
  ON public.command_ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.command_ai_sessions s
      WHERE s.id = command_ai_messages.session_id
        AND s.audience = 'practice'
        AND s.workspace_id = public.current_workspace_id()
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "members insert command ai messages" ON public.command_ai_messages;
CREATE POLICY "members insert command ai messages"
  ON public.command_ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.command_ai_sessions s
      WHERE s.id = command_ai_messages.session_id
        AND s.audience = 'practice'
        AND s.workspace_id = public.current_workspace_id()
        AND s.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.set_command_ai_sessions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_command_ai_sessions_updated_at ON public.command_ai_sessions;
CREATE TRIGGER trg_command_ai_sessions_updated_at
BEFORE UPDATE ON public.command_ai_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_command_ai_sessions_updated_at();

NOTIFY pgrst, 'reload schema';
