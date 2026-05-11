-- Align RLS helper with app rule (getWorkspaceMembershipForUserId / protected shell):
-- oldest workspace_members row by created_at, not an arbitrary LIMIT 1.

CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wm.workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid()
  ORDER BY wm.created_at ASC
  LIMIT 1;
$$;
