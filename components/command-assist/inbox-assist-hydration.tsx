"use client";

import { useEffect } from "react";

import { useAssistContextOptional, type InboxAssistCasePayload } from "./assist-shell";

type InboxAssistHydrationProps = Omit<InboxAssistCasePayload, "kind">;

/**
 * Aktiver Fall für Command (systemweite Leiste) — Kontext ohne Layout-Einbettung.
 */
export function InboxAssistHydration({
  submissionId,
  patientName,
  urgency,
  practicePhone,
  appointmentUrl,
  concernLine,
}: InboxAssistHydrationProps) {
  const ctx = useAssistContextOptional();
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
    return () => {
      setCasePayload(null);
    };
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
