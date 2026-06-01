"use client";

import { useEffect, useState } from "react";

import { NewTaskModal } from "@/components/my-tasks/new-task-modal";
import { consumeCommandTaskDraft } from "@/lib/command-ai/task-draft-bridge";
import type { PendingCommandTaskDraft } from "@/lib/command-ai/task-draft-bridge";

/** Öffnet Relay-Aufgabe mit Command-Vorbefüllung nach Freigabe. */
export function RelayCommandTaskPrefill() {
  const [draft, setDraft] = useState<PendingCommandTaskDraft | null>(null);

  useEffect(() => {
    const pending = consumeCommandTaskDraft();
    if (pending) setDraft(pending);
  }, []);

  if (!draft) return null;

  return (
    <NewTaskModal
      open
      onClose={() => setDraft(null)}
      initialRecurrenceType={/erinnerung|reminder/i.test(draft.title) ? "weekly" : "once"}
      dialogTitle={/erinnerung|reminder/i.test(draft.title) ? "Erinnerung" : "Neue Aufgabe"}
      dialogHint="Von Command vorbereitet — bitte prüfen und speichern."
      initialDraft={{
        title: draft.title,
        notes: draft.notes,
        dueDate: draft.dueDate,
      }}
    />
  );
}
