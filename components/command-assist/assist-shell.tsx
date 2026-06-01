"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CommandWorkspaceHints, PreparedWorkItem } from "@/lib/command-ai/types";

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
  workspaceHints: CommandWorkspaceHints | null;
  setWorkspaceHints: (hints: CommandWorkspaceHints | null) => void;
  preparedWork: PreparedWorkItem | null;
  setPreparedWork: (work: PreparedWorkItem | null) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  openCommand: () => void;
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
  const [workspaceHints, setWorkspaceHintsState] = useState<CommandWorkspaceHints | null>(null);
  const [preparedWork, setPreparedWorkState] = useState<PreparedWorkItem | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const setCasePayload = useCallback((p: AssistCasePayload) => {
    setCasePayloadState(p);
  }, []);

  const setWorkspaceHints = useCallback((hints: CommandWorkspaceHints | null) => {
    setWorkspaceHintsState(hints);
  }, []);

  const setPreparedWork = useCallback((work: PreparedWorkItem | null) => {
    setPreparedWorkState(work);
  }, []);

  const openCommand = useCallback(() => {
    setCommandOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      casePayload,
      setCasePayload,
      workspaceHints,
      setWorkspaceHints,
      preparedWork,
      setPreparedWork,
      commandOpen,
      setCommandOpen,
      openCommand,
    }),
    [
      casePayload,
      setCasePayload,
      workspaceHints,
      setWorkspaceHints,
      preparedWork,
      setPreparedWork,
      commandOpen,
      openCommand,
    ]
  );

  return <AssistContext.Provider value={value}>{children}</AssistContext.Provider>;
}

/** Command-UI nur über dem Arbeitsbereich — Sidebar-Navigation bleibt klickbar. */
export function AssistCommandLayer() {
  return <CommandAssist />;
}
