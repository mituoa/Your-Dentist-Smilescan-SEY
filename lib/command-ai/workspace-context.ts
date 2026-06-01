import type { CommandWorkspaceHints } from "./types";

type ActiveInboxCase = {
  submissionId: string;
  patientName: string | null;
  concernLine: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
};

/** Merges global workspace hints with the currently open Tracker case (priority). */
export function mergeCommandWorkspaceHints(
  base: CommandWorkspaceHints | null,
  activeCase: ActiveInboxCase | null
): CommandWorkspaceHints | null {
  if (!base && !activeCase) return null;

  const patients = [...(base?.patients ?? [])];
  if (activeCase?.submissionId) {
    const entry = {
      name: activeCase.patientName?.trim() || "Patient",
      submissionId: activeCase.submissionId,
      concernLine: activeCase.concernLine,
    };
    const idx = patients.findIndex((p) => p.submissionId === activeCase.submissionId);
    if (idx >= 0) patients[idx] = entry;
    else patients.unshift(entry);
  }

  return {
    patients,
    practicePhone: activeCase?.practicePhone ?? base?.practicePhone ?? null,
    appointmentUrl: activeCase?.appointmentUrl ?? base?.appointmentUrl ?? null,
  };
}

export function hintsFromInboxItems(
  items: {
    id: string;
    patient_name: string | null;
    patient_notes: string | null;
  }[],
  practicePhone: string | null,
  appointmentUrl: string | null,
  buildConcernLine: (notes: string | null, name: string | null) => string | null
): CommandWorkspaceHints {
  return {
    patients: items.map((p) => ({
      name: p.patient_name?.trim() || "Patient",
      submissionId: p.id,
      concernLine: buildConcernLine(p.patient_notes, p.patient_name),
    })),
    practicePhone,
    appointmentUrl,
  };
}
