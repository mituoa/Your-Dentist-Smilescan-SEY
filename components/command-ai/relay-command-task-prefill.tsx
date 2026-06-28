"use client";

import { useEffect } from "react";

import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { consumeCommandTaskDraft } from "@/lib/command-ai/task-draft-bridge";

/** Command-Vorbefüllung → Praxisaufgaben-Modal (über AssistShell). */
export function RelayCommandTaskPrefill() {
  const assist = useAssistDispatchOptional();

  useEffect(() => {
    const pending = consumeCommandTaskDraft();
    if (!pending || !assist) return;
    assist.openTaskModal(pending);
  }, [assist]);

  return null;
}
