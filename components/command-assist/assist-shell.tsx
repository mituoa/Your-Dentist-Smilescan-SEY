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

type AssistDispatchValue = {
  setCasePayload: (p: AssistCasePayload) => void;
  setWorkspaceHints: (hints: CommandWorkspaceHints | null) => void;
  setPreparedWork: (work: PreparedWorkItem | null) => void;
  setCommandOpen: (open: boolean) => void;
  openCommand: () => void;
};

type AssistStateValue = {
  casePayload: AssistCasePayload;
  workspaceHints: CommandWorkspaceHints | null;
  preparedWork: PreparedWorkItem | null;
  commandOpen: boolean;
};

export type AssistContextValue = AssistStateValue & AssistDispatchValue;

const AssistDispatchContext = createContext<AssistDispatchValue | null>(null);
const AssistStateContext = createContext<AssistStateValue | null>(null);

function workspaceHintsEqual(
  a: CommandWorkspaceHints | null,
  b: CommandWorkspaceHints | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.practicePhone !== b.practicePhone || a.appointmentUrl !== b.appointmentUrl) {
    return false;
  }
  if (a.patients.length !== b.patients.length) return false;
  return a.patients.every((p, i) => {
    const q = b.patients[i];
    return (
      p.submissionId === q.submissionId &&
      p.name === q.name &&
      p.concernLine === q.concernLine
    );
  });
}

function casePayloadEqual(a: AssistCasePayload, b: AssistCasePayload): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.kind === b.kind &&
    a.submissionId === b.submissionId &&
    a.patientName === b.patientName &&
    a.urgency === b.urgency &&
    a.practicePhone === b.practicePhone &&
    a.appointmentUrl === b.appointmentUrl &&
    a.concernLine === b.concernLine
  );
}

export function useAssistDispatchOptional(): AssistDispatchValue | null {
  return useContext(AssistDispatchContext);
}

export function useAssistStateOptional(): AssistStateValue | null {
  return useContext(AssistStateContext);
}

export function useAssistContextOptional(): AssistContextValue | null {
  const dispatch = useContext(AssistDispatchContext);
  const state = useContext(AssistStateContext);
  if (!dispatch || !state) return null;
  return { ...state, ...dispatch };
}

/** @deprecated use useAssistContextOptional */
export function useAssistCaseOptional(): AssistContextValue | null {
  return useAssistContextOptional();
}

export function AssistShell({ children }: { children: ReactNode }) {
  const [casePayload, setCasePayloadState] = useState<AssistCasePayload>(null);
  const [workspaceHints, setWorkspaceHintsState] = useState<CommandWorkspaceHints | null>(null);
  const [preparedWork, setPreparedWorkState] = useState<PreparedWorkItem | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const setCasePayload = useCallback((p: AssistCasePayload) => {
    setCasePayloadState((prev) => (casePayloadEqual(prev, p) ? prev : p));
  }, []);

  const setWorkspaceHints = useCallback((hints: CommandWorkspaceHints | null) => {
    setWorkspaceHintsState((prev) =>
      workspaceHintsEqual(prev, hints) ? prev : hints
    );
  }, []);

  const setPreparedWork = useCallback((work: PreparedWorkItem | null) => {
    setPreparedWorkState((prev) => (prev === work ? prev : work));
  }, []);

  const openCommand = useCallback(() => {
    setCommandOpen(true);
  }, []);

  const dispatchValue = useMemo<AssistDispatchValue>(
    () => ({
      setCasePayload,
      setWorkspaceHints,
      setPreparedWork,
      setCommandOpen,
      openCommand,
    }),
    [setCasePayload, setWorkspaceHints, setPreparedWork, openCommand]
  );

  const stateValue = useMemo<AssistStateValue>(
    () => ({
      casePayload,
      workspaceHints,
      preparedWork,
      commandOpen,
    }),
    [casePayload, workspaceHints, preparedWork, commandOpen]
  );

  return (
    <AssistDispatchContext.Provider value={dispatchValue}>
      <AssistStateContext.Provider value={stateValue}>
        {children}
        <CommandAssist />
      </AssistStateContext.Provider>
    </AssistDispatchContext.Provider>
  );
}
