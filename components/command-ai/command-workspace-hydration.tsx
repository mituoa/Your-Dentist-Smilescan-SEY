"use client";

import { useEffect } from "react";

import { useAssistContextOptional } from "@/components/command-assist/assist-shell";
import { buildConcernLine } from "@/lib/command-ai/preparation-engine";
import { hintsFromInboxItems } from "@/lib/command-ai/workspace-context";

type CommandWorkspaceHydrationProps = {
  patients: {
    id: string;
    patient_name: string | null;
    patient_notes: string | null;
  }[];
  practicePhone: string | null;
  appointmentUrl: string | null;
};

/** Lädt Patientenverzeichnis + Praxislinks für Command auf allen geschützten Seiten. */
export function CommandWorkspaceHydration({
  patients,
  practicePhone,
  appointmentUrl,
}: CommandWorkspaceHydrationProps) {
  const ctx = useAssistContextOptional();

  useEffect(() => {
    if (!ctx) return;
    const hints = hintsFromInboxItems(
      patients,
      practicePhone,
      appointmentUrl,
      buildConcernLine
    );
    ctx.setWorkspaceHints(hints);
    return () => ctx.setWorkspaceHints(null);
  }, [ctx, patients, practicePhone, appointmentUrl]);

  return null;
}
