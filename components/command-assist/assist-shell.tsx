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

type AssistUiContextValue = {
  commandOpen: boolean;
  openCommand: () => void;
  closeCommand: () => void;
  setCommandOpen: (open: boolean) => void;
};

const AssistContext = createContext<AssistContextValue | null>(null);
const AssistUiContext = createContext<AssistUiContextValue | null>(null);

export function useAssistContextOptional(): AssistContextValue | null {
  return useContext(AssistContext);
}

/** @deprecated use useAssistContextOptional */
export function useAssistCaseOptional(): AssistContextValue | null {
  return useContext(AssistContext);
}

export function useAssistUiOptional(): AssistUiContextValue | null {
  return useContext(AssistUiContext);
}

export function AssistShell({ children }: { children: ReactNode }) {
  const [casePayload, setCasePayloadState] = useState<AssistCasePayload>(null);
  const [commandOpen, setCommandOpen] = useState(false);

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

  const uiValue = useMemo<AssistUiContextValue>(
    () => ({
      commandOpen,
      openCommand: () => setCommandOpen(true),
      closeCommand: () => setCommandOpen(false),
      setCommandOpen,
    }),
    [commandOpen]
  );

  return (
    <AssistContext.Provider value={value}>
      <AssistUiContext.Provider value={uiValue}>
        {children}
        <CommandAssist open={commandOpen} onOpenChange={setCommandOpen} />
      </AssistUiContext.Provider>
    </AssistContext.Provider>
  );
}
