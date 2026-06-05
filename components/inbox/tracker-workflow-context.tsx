"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TrackerResponsePath = "termin" | "ruckfrage" | "beobachten";

export type TrackerDraftApplyRequest = {
  revision: number;
  body: string;
  path: TrackerResponsePath;
  urgency?: string | null;
  snippetId?: string | null;
};

type TrackerWorkflowContextValue = {
  responsePath: TrackerResponsePath | null;
  setResponsePath: (path: TrackerResponsePath | null) => void;
  draftApplyRequest: TrackerDraftApplyRequest | null;
  applyDraftToPanel: (
    input: Omit<TrackerDraftApplyRequest, "revision">
  ) => void;
  scrollToCommunication: () => void;
};

const TrackerWorkflowContext = createContext<TrackerWorkflowContextValue | null>(
  null
);

export function TrackerWorkflowProvider({ children }: { children: ReactNode }) {
  const [responsePath, setResponsePath] = useState<TrackerResponsePath | null>(
    null
  );
  const [draftApplyRequest, setDraftApplyRequest] =
    useState<TrackerDraftApplyRequest | null>(null);
  const revisionRef = useRef(0);

  const scrollToCommunication = useCallback(() => {
    const el = document.getElementById("tracker-kommunikation");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const applyDraftToPanel = useCallback(
    (input: Omit<TrackerDraftApplyRequest, "revision">) => {
      revisionRef.current += 1;
      setDraftApplyRequest({
        ...input,
        revision: revisionRef.current,
      });
      scrollToCommunication();
    },
    [scrollToCommunication]
  );

  const value = useMemo(
    () => ({
      responsePath,
      setResponsePath,
      draftApplyRequest,
      applyDraftToPanel,
      scrollToCommunication,
    }),
    [responsePath, draftApplyRequest, applyDraftToPanel, scrollToCommunication]
  );

  return (
    <TrackerWorkflowContext.Provider value={value}>
      {children}
    </TrackerWorkflowContext.Provider>
  );
}

export function useTrackerWorkflow(): TrackerWorkflowContextValue {
  const ctx = useContext(TrackerWorkflowContext);
  if (!ctx) {
    throw new Error("useTrackerWorkflow requires TrackerWorkflowProvider");
  }
  return ctx;
}
