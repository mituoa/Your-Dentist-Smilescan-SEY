"use client";

import { useEffect } from "react";

import { useAssistDispatchOptional, type InboxAssistCasePayload } from "./assist-shell";

type InboxAssistHydrationProps = Omit<InboxAssistCasePayload, "kind">;

/**
 * Aktiver Fall für **Command** (systemweite Leiste): liefert Kontext für Entwürfe/Navigation —
 * **kein** automatischer Versand, keine eigene Nachrichten-Pipeline (s. `command-assist.tsx`).
 * **Punkt 11 — MVP:** nur Hilfstexte/Links; keine KI- oder Postfach-Semantik.
 */
export function InboxAssistHydration({
  submissionId,
  patientName,
  urgency,
  practicePhone,
  appointmentUrl,
  concernLine,
}: InboxAssistHydrationProps) {
  const setCasePayload = useAssistDispatchOptional()?.setCasePayload;

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
