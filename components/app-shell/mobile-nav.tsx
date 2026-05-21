"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type MobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const syncScrollLock = () => {
      if (mq.matches) {
        document.documentElement.style.overflow = "";
        setOpen(false);
        return;
      }
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    syncScrollLock();
    mq.addEventListener("change", syncScrollLock);
    return () => {
      mq.removeEventListener("change", syncScrollLock);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const value: MobileNavContextValue = {
    open,
    setOpen,
    close,
  };

  return (
    <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
  );
}

export function useMobileNav(): MobileNavContextValue {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return ctx;
}

export function useMobileNavOptional(): MobileNavContextValue | null {
  return useContext(MobileNavContext);
}

/** Floating spatial layer on mobile; static rail pass-through on desktop. */
export function MobileSidebarFrame({ children }: { children: ReactNode }) {
  const { open, close } = useMobileNav();

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-[25] border-0 bg-[#0c1929]/8 backdrop-blur-[14px] transition-opacity duration-300 ease-out md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label="Navigation schließen"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <div
        className={cn(
          "max-md:fixed max-md:inset-0 max-md:z-30 max-md:flex max-md:items-stretch",
          "max-md:p-3 max-md:pt-[max(0.75rem,env(safe-area-inset-top))] max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:pl-[max(0.75rem,env(safe-area-inset-left))] max-md:pr-3",
          open ? "max-md:pointer-events-auto" : "max-md:pointer-events-none",
          "md:static md:z-20 md:flex md:h-full md:w-[108px] md:max-w-[108px] md:shrink-0 md:items-center md:justify-center md:py-2 md:pl-2"
        )}
        aria-hidden={!open ? true : undefined}
      >
        <div
          className={cn(
            "yd-mobile-nav-panel relative flex min-h-0 flex-col overflow-hidden",
            "max-md:h-full max-md:w-[min(82vw,300px)] max-md:max-w-[300px]",
            "max-md:rounded-[28px] max-md:border max-md:border-white/70",
            "max-md:shadow-[0_24px_72px_rgba(15,35,58,0.14),0_8px_28px_rgba(47,128,237,0.08)]",
            "max-md:backdrop-blur-[28px]",
            "max-md:transition-[transform,opacity] max-md:duration-[320ms] max-md:ease-[cubic-bezier(0.22,1,0.36,1)]",
            open
              ? "max-md:translate-x-0 max-md:opacity-100"
              : "max-md:-translate-x-[calc(100%+1.25rem)] max-md:opacity-0",
            "md:h-full md:w-full md:translate-x-0 md:opacity-100 md:rounded-none md:border-0 md:shadow-none md:backdrop-blur-none"
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function MobileMenuButton() {
  const { open, setOpen } = useMobileNav();

  return (
    <button
      type="button"
      className="yd-mobile-menu-trigger inline-flex h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-[rgba(180,198,218,0.38)] bg-white/70 text-[#334155] shadow-sm transition-[box-shadow,background] duration-200 md:hidden"
      aria-expanded={open}
      aria-controls="app-sidebar"
      aria-label={open ? "Navigation schließen" : "Navigation öffnen"}
      onClick={() => setOpen(!open)}
    >
      <Menu className="h-[18px] w-[18px]" strokeWidth={1.85} />
    </button>
  );
}
