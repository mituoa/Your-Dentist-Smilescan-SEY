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

/** Im Tracker: Assist in rechter Spalte eingebettet statt schwebendem FAB. */
export type AssistChromeLayout = "floating" | "tracker_embedded";

type AssistContextValue = {
  casePayload: AssistCasePayload;
  setCasePayload: (p: AssistCasePayload) => void;
  chromeLayout: AssistChromeLayout;
  setChromeLayout: (l: AssistChromeLayout) => void;
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
  const [chromeLayout, setChromeLayoutState] = useState<AssistChromeLayout>("floating");

  const setCasePayload = useCallback((p: AssistCasePayload) => {
    setCasePayloadState(p);
  }, []);

  const setChromeLayout = useCallback((l: AssistChromeLayout) => {
    setChromeLayoutState(l);
  }, []);

  const value = useMemo(
    () => ({
      casePayload,
      setCasePayload,
      chromeLayout,
      setChromeLayout,
    }),
    [casePayload, setCasePayload, chromeLayout, setChromeLayout]
  );

  return (
    <AssistContext.Provider value={value}>
      {children}
      <CommandAssist />
    </AssistContext.Provider>
  );
}
