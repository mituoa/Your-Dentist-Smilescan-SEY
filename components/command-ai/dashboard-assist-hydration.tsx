"use client";

import { useEffect } from "react";

import { useAssistContextOptional } from "@/components/command-assist/assist-shell";
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

/** Supplies Command AI with patient directory from Atlas — no autonomous actions. */
export function DashboardAssistHydration({
  patients,
  practicePhone,
  appointmentUrl,
}: DashboardAssistHydrationProps) {
  const ctx = useAssistContextOptional();

  useEffect(() => {
    if (!ctx) return;
    const hints: CommandWorkspaceHints = {
      patients: patients.map((p) => ({
        name: p.patient_name?.trim() || "Patient",
        submissionId: p.id,
        concernLine: buildConcernLine(p.patient_notes, p.patient_name),
      })),
      practicePhone,
      appointmentUrl,
    };
    ctx.setWorkspaceHints(hints);
    return () => ctx.setWorkspaceHints(null);
  }, [ctx, patients, practicePhone, appointmentUrl]);

  return null;
}
