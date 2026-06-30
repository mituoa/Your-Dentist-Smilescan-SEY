"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  YD_AWAKEN_DURATION_MS,
  YD_AWAKEN_SESSION_KEY,
} from "@/lib/design/yd-workspace-awakening";

type AwakeningContextValue = {
  isAwakening: boolean;
};

const AwakeningContext = createContext<AwakeningContextValue>({ isAwakening: false });

export function useYdAwakening() {
  return useContext(AwakeningContext);
}

type YdWorkspaceAwakeningProps = {
  children: ReactNode;
};

/**
 * Post-login: workspace materializes in layers (spatial OS, not web transitions).
 */
export function YdWorkspaceAwakening({ children }: YdWorkspaceAwakeningProps) {
  const [isAwakening, setIsAwakening] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      try {
        sessionStorage.removeItem(YD_AWAKEN_SESSION_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) {
      try {
        sessionStorage.removeItem(YD_AWAKEN_SESSION_KEY);
      } catch {
        /* ignore */
      }
      return;
    }

    let should = false;
    try {
      should = sessionStorage.getItem(YD_AWAKEN_SESSION_KEY) === "1";
      if (should) sessionStorage.removeItem(YD_AWAKEN_SESSION_KEY);
    } catch {
      /* ignore */
    }

    if (!should) return;

    setIsAwakening(true);
    const done = window.setTimeout(() => setIsAwakening(false), YD_AWAKEN_DURATION_MS);
    return () => window.clearTimeout(done);
  }, []);

  useEffect(() => {
    const root = document.querySelector(".yd-workspace");
    if (!root) return;
    if (isAwakening) {
      root.classList.add("yd-awakening-active");
      document.documentElement.classList.add("yd-os-entering");
    } else {
      root.classList.remove("yd-awakening-active");
      document.documentElement.classList.remove("yd-os-entering");
    }
    return () => {
      root.classList.remove("yd-awakening-active");
      document.documentElement.classList.remove("yd-os-entering");
    };
  }, [isAwakening]);

  return (
    <AwakeningContext.Provider value={{ isAwakening }}>{children}</AwakeningContext.Provider>
  );
}
