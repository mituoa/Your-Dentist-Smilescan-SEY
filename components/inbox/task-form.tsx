"use client";

import { useState, useTransition, useRef } from "react";
import { createTask } from "@/app/(protected)/inbox/[id]/actions";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  submissionId: string;
}

export function TaskForm({ submissionId }: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input type="hidden" name="submission_id" value={submissionId} />

      <textarea
        name="content"
        placeholder="Neue Aufgabe hinzufügen…"
        required
        rows={2}
        className="w-full px-3 py-2 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
      />

      <div className="flex items-center gap-2">
        <select
          name="recipient_type"
          defaultValue="doctor_only"
          className="flex-1 h-9 px-3 text-sm bg-surface-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="doctor_only">Nur für den Arzt</option>
          <option value="all_team">Alle Team-Mitglieder</option>
        </select>

        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Speichern…" : "Hinzufügen"}
        </Button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
