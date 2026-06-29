"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { markSubmissionSeen } from "@/app/(protected)/inbox/[id]/actions";
import type { EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";

type TrackerInboxReadContextValue = {
  mergeSeenState: <T extends EnrichedSubmissionListItem>(item: T) => T;
  markCaseOpened: (submissionId: string) => void;
  markCaseUnread: (submissionId: string) => void;
};

const TrackerInboxReadContext = createContext<TrackerInboxReadContextValue | null>(null);

function caseIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/inbox\/([^/?#]+)$/);
  return match?.[1] ?? null;
}

/** Optimistisches Gelesen/Ungelesen für die Tracker-Liste — sofort beim Öffnen, serverseitig via Action. */
export function TrackerInboxReadProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const activeCaseId = caseIdFromPath(pathname);

  const [locallyRead, setLocallyRead] = useState<Map<string, string>>(() => new Map());
  const [locallyUnread, setLocallyUnread] = useState<Set<string>>(() => new Set());
  const pendingSeen = useRef<Set<string>>(new Set());

  const markCaseOpened = useCallback((submissionId: string) => {
    setLocallyUnread((prev) => {
      if (!prev.has(submissionId)) return prev;
      const next = new Set(prev);
      next.delete(submissionId);
      return next;
    });

    setLocallyRead((prev) => {
      if (prev.has(submissionId)) return prev;
      const next = new Map(prev);
      next.set(submissionId, new Date().toISOString());
      return next;
    });

    if (pendingSeen.current.has(submissionId)) return;
    pendingSeen.current.add(submissionId);
    void markSubmissionSeen(submissionId).finally(() => {
      pendingSeen.current.delete(submissionId);
    });
  }, []);

  const markCaseUnread = useCallback((submissionId: string) => {
    setLocallyRead((prev) => {
      if (!prev.has(submissionId)) return prev;
      const next = new Map(prev);
      next.delete(submissionId);
      return next;
    });
    setLocallyUnread((prev) => {
      if (prev.has(submissionId)) return prev;
      const next = new Set(prev);
      next.add(submissionId);
      return next;
    });
    pendingSeen.current.delete(submissionId);
  }, []);

  useEffect(() => {
    if (activeCaseId) {
      markCaseOpened(activeCaseId);
    }
  }, [activeCaseId, markCaseOpened]);

  const mergeSeenState = useCallback(
    <T extends EnrichedSubmissionListItem>(item: T): T => {
      if (locallyUnread.has(item.id)) {
        return { ...item, seen_at: null };
      }
      if (item.seen_at) {
        return item;
      }
      const localSeenAt = locallyRead.get(item.id);
      if (localSeenAt) {
        return { ...item, seen_at: localSeenAt };
      }
      if (activeCaseId === item.id) {
        return { ...item, seen_at: new Date().toISOString() };
      }
      return item;
    },
    [activeCaseId, locallyRead, locallyUnread]
  );

  const value = useMemo(
    () => ({ mergeSeenState, markCaseOpened, markCaseUnread }),
    [mergeSeenState, markCaseOpened, markCaseUnread]
  );

  return (
    <TrackerInboxReadContext.Provider value={value}>{children}</TrackerInboxReadContext.Provider>
  );
}

export function useTrackerInboxRead(): TrackerInboxReadContextValue {
  const ctx = useContext(TrackerInboxReadContext);
  if (!ctx) {
    return {
      mergeSeenState: (item) => item,
      markCaseOpened: () => {},
      markCaseUnread: () => {},
    };
  }
  return ctx;
}
