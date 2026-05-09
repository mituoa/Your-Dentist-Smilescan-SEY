"use client";

import { useEffect } from "react";

import { useAssistContextOptional, type InboxAssistCasePayload } from "./assist-shell";

type InboxAssistHydrationProps = Omit<InboxAssistCasePayload, "kind">;

/**
 * Aktiver Fall + eingebetteter Assist (rechte Spalte) — bei Unmount wieder Floating.
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
  const setChromeLayout = ctx?.setChromeLayout;

  useEffect(() => {
    if (!setCasePayload || !setChromeLayout) return;
    setChromeLayout("tracker_embedded");
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
      setChromeLayout("floating");
    };
  }, [
    setCasePayload,
    setChromeLayout,
    submissionId,
    patientName,
    urgency,
    practicePhone,
    appointmentUrl,
    concernLine,
  ]);

  return null;
}
