"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CommandAssist } from "./command-assist";

export type InboxAssistCasePayload = {
  kind: "inbox";
  submissionId: string;
  patientName: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  concernLine: string | null;
};

type AssistCasePayload = InboxAssistCasePayload | null;

type AssistContextValue = {
  casePayload: AssistCasePayload;
  setCasePayload: (p: AssistCasePayload) => void;
};

const AssistContext = createContext<AssistContextValue | null>(null);

export function useAssistContextOptional(): AssistContextValue | null {
  return useContext(AssistContext);
}

/** @deprecated use useAssistContextOptional */
export function useAssistCaseOptional(): AssistContextValue | null {
  return useContext(AssistContext);
}

export function AssistShell({ children }: { children: ReactNode }) {
  const [casePayload, setCasePayloadState] = useState<AssistCasePayload>(null);

  const setCasePayload = useCallback((p: AssistCasePayload) => {
    setCasePayloadState(p);
  }, []);

  const value = useMemo(
    () => ({
      casePayload,
      setCasePayload,
    }),
    [casePayload, setCasePayload]
  );

  return (
    <AssistContext.Provider value={value}>
      {children}
      <CommandAssist />
    </AssistContext.Provider>
  );
}
