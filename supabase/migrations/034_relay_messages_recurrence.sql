-- Relay internal messaging + task recurrence / reminders

-- —— Task routines ——
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'once',
  ADD COLUMN IF NOT EXISTS recurrence_interval_days integer,
  ADD COLUMN IF NOT EXISTS remind_self boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS remind_assignees boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS remind_before text,
  ADD COLUMN IF NOT EXISTS remind_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_reminded_at timestamptz,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES tasks(id) ON DELETE SET NULL;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_recurrence_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_recurrence_type_check
  CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly', 'custom'));

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_remind_before_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_remind_before_check
  CHECK (remind_before IS NULL OR remind_before IN ('same_day', 'one_day', 'one_week'));

CREATE INDEX IF NOT EXISTS idx_tasks_remind_at ON tasks (remind_at)
  WHERE remind_at IS NOT NULL AND status = 'open';

-- —— Internal messaging ——
CREATE TABLE IF NOT EXISTS relay_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('direct', 'group')),
  title text,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relay_conversation_members (
  conversation_id uuid NOT NULL REFERENCES relay_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS relay_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES relay_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relay_message_reads (
  message_id uuid NOT NULL REFERENCES relay_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_relay_conversations_workspace ON relay_conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_relay_messages_conversation ON relay_messages(conversation_id, created_at);

ALTER TABLE relay_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_message_reads ENABLE ROW LEVEL SECURITY;

-- Conversations: workspace members
CREATE POLICY relay_conversations_select ON relay_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = relay_conversations.workspace_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY relay_conversations_insert ON relay_conversations FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = relay_conversations.workspace_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY relay_conversations_update ON relay_conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = relay_conversations.workspace_id AND wm.user_id = auth.uid()
    )
  );

-- Members
CREATE POLICY relay_conversation_members_select ON relay_conversation_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM relay_conversations c
      JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = relay_conversation_members.conversation_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY relay_conversation_members_insert ON relay_conversation_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM relay_conversations c
      JOIN workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = relay_conversation_members.conversation_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY relay_conversation_members_update ON relay_conversation_members FOR UPDATE
  USING (user_id = auth.uid());

-- Messages: only conversation members
CREATE POLICY relay_messages_select ON relay_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM relay_conversation_members m
      WHERE m.conversation_id = relay_messages.conversation_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY relay_messages_insert ON relay_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM relay_conversation_members m
      WHERE m.conversation_id = relay_messages.conversation_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY relay_message_reads_select ON relay_message_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY relay_message_reads_insert ON relay_message_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());
