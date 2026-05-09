"use client";

import { useEffect } from "react";

import { useAssistCaseOptional, type InboxAssistCasePayload } from "./assist-shell";

type InboxAssistHydrationProps = Omit<InboxAssistCasePayload, "kind">;

/**
 * Registers the active inbox case with the global assist (cleared on leave).
 */
export function InboxAssistHydration({
  submissionId,
  patientName,
  urgency,
  practicePhone,
  appointmentUrl,
  concernLine,
}: InboxAssistHydrationProps) {
  const ctx = useAssistCaseOptional();
  const setCasePayload = ctx?.setCasePayload;

  useEffect(() => {
    if (!setCasePayload) return;
    setCasePayload({
      kind: "inbox",
      submissionId,
      patientName,
      urgency,
      practicePhone,
      appointmentUrl,
      concernLine,
    });
    return () => setCasePayload(null);
  }, [
    setCasePayload,
    submissionId,
    patientName,
    urgency,
    practicePhone,
    appointmentUrl,
    concernLine,
  ]);

  return null;
}
