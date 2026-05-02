-- Allow team members to mark tasks done for tasks they can see (all_team or assigned to them).
-- Doctors retain full UPDATE on tasks in their workspace.

DROP POLICY IF EXISTS "doctor marks tasks done" ON tasks;

CREATE POLICY "members mark tasks done"
  ON tasks FOR UPDATE
  USING (
    workspace_id = current_workspace_id()
    AND (
      current_user_is_doctor()
      OR recipient_type = 'all_team'::task_recipient
      OR (
        recipient_type = 'specific_person'::task_recipient
        AND specific_recipient_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    workspace_id = current_workspace_id()
    AND (
      current_user_is_doctor()
      OR recipient_type = 'all_team'::task_recipient
      OR (
        recipient_type = 'specific_person'::task_recipient
        AND specific_recipient_id = auth.uid()
      )
    )
  );
