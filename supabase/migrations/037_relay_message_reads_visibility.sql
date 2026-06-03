-- Relay: Absender und Gesprächsteilnehmer dürfen Lesebestätigungen sehen (nicht nur eigene Zeile).

DROP POLICY IF EXISTS relay_message_reads_select ON relay_message_reads;

CREATE POLICY relay_message_reads_select ON relay_message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM relay_messages m
      JOIN relay_conversation_members cm ON cm.conversation_id = m.conversation_id
      WHERE m.id = relay_message_reads.message_id
        AND cm.user_id = auth.uid()
    )
  );
