"use client";

import { useEffect, useMemo } from "react";

import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { buildConcernLine } from "@/lib/command-ai/preparation-engine";
import type { CommandWorkspaceHints } from "@/lib/command-ai/types";

type DashboardAssistHydrationProps = {
  patients: {
    id: string;
    patient_name: string | null;
    patient_notes: string | null;
  }[];
  practicePhone: string | null;
  appointmentUrl: string | null;
};

/** @deprecated Layout liefert bereits CommandWorkspaceHydration — nur noch für Spezialfälle. */
export function DashboardAssistHydration({
  patients,
  practicePhone,
  appointmentUrl,
}: DashboardAssistHydrationProps) {
  const setWorkspaceHints = useAssistDispatchOptional()?.setWorkspaceHints;

  const patientsKey = useMemo(
    () => patients.map((p) => p.id).join("|"),
    [patients]
  );

  useEffect(() => {
    if (!setWorkspaceHints) return;
    const hints: CommandWorkspaceHints = {
      patients: patients.map((p) => ({
        name: p.patient_name?.trim() || "Patient",
        submissionId: p.id,
        concernLine: buildConcernLine(p.patient_notes, p.patient_name),
      })),
      practicePhone,
      appointmentUrl,
    };
    setWorkspaceHints(hints);
  }, [setWorkspaceHints, patientsKey, patients, practicePhone, appointmentUrl]);

  return null;
}
