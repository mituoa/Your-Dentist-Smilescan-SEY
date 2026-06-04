"use client";

import { useEffect, useMemo } from "react";

import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
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
  const setWorkspaceHints = useAssistDispatchOptional()?.setWorkspaceHints;

  const patientsKey = useMemo(
    () =>
      patients
        .map((p) => `${p.id}:${p.patient_name ?? ""}:${(p.patient_notes ?? "").slice(0, 40)}`)
        .join("|"),
    [patients]
  );

  useEffect(() => {
    if (!setWorkspaceHints) return;
    setWorkspaceHints(
      hintsFromInboxItems(patients, practicePhone, appointmentUrl, buildConcernLine)
    );
  }, [setWorkspaceHints, patientsKey, practicePhone, appointmentUrl, patients]);

  return null;
}
