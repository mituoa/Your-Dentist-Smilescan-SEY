"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { consumeCommandTaskDraft } from "@/lib/command-ai/task-draft-bridge";

/** Leitet Command-Vorbefüllung zur Praxisaufgaben-Maske (Registrierungsniveau) um. */
export function RelayCommandTaskPrefill() {
  const router = useRouter();

  useEffect(() => {
    const pending = consumeCommandTaskDraft();
    if (!pending) return;

    const params = new URLSearchParams({ from: "relay" });
    params.set("title", pending.title);
    if (pending.notes?.trim()) params.set("description", pending.notes.trim());
    if (pending.dueDate) params.set("due_date", pending.dueDate);

    router.replace(`/my-tasks/new?${params.toString()}`);
  }, [router]);

  return null;
}
