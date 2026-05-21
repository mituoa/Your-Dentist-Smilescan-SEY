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

/** Native-feel floating drawer on mobile; static rail on desktop. */
export function MobileSidebarFrame({ children }: { children: ReactNode }) {
  const { open, close } = useMobileNav();

  return (
    <>
      <button
        type="button"
        className={cn(
          "yd-mobile-nav-backdrop fixed inset-0 z-[25] border-0 transition-opacity duration-300 ease-out md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label="Navigation schließen"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <div
        className={cn(
          "yd-mobile-nav-root max-md:fixed max-md:inset-0 max-md:z-30 max-md:min-h-[100dvh] max-md:pointer-events-none md:static md:z-20 md:flex md:h-full md:w-[108px] md:max-w-[108px] md:shrink-0 md:items-center md:justify-center md:py-2 md:pl-2",
          open && "max-md:pointer-events-auto"
        )}
      >
        <div
          className={cn(
            "yd-mobile-nav-panel relative flex min-h-0 flex-col overflow-hidden",
            "max-md:mx-auto max-md:my-0 max-md:ml-[max(0.625rem,env(safe-area-inset-left))] max-md:mr-3",
            "max-md:mt-[max(0.875rem,env(safe-area-inset-top))] max-md:mb-[max(0.875rem,env(safe-area-inset-bottom))]",
            "max-md:h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.75rem)] max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.75rem)]",
            "max-md:w-[min(88vw,328px)] max-md:max-w-[328px]",
            "max-md:rounded-[26px] max-md:border max-md:border-white/75",
            "max-md:shadow-[0_28px_80px_rgba(15,35,58,0.16),0_10px_32px_rgba(47,128,237,0.1)]",
            "max-md:backdrop-blur-[24px] saturate-[1.15]",
            "max-md:transition-[transform,opacity] max-md:duration-[340ms] max-md:ease-[cubic-bezier(0.22,1,0.36,1)]",
            open
              ? "max-md:translate-x-0 max-md:opacity-100"
              : "max-md:-translate-x-[calc(100%+1rem)] max-md:opacity-0",
            "md:h-full md:w-full md:translate-x-0 md:opacity-100 md:rounded-none md:border-0 md:shadow-none md:backdrop-blur-none md:mx-0 md:my-0"
          )}
        >
          <div className="yd-mobile-nav-panel-scroll flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
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
      className="yd-mobile-menu-trigger inline-flex h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-[rgba(180,198,218,0.38)] bg-white/75 text-[#334155] shadow-sm transition-[box-shadow,background] duration-200 md:hidden"
      aria-expanded={open}
      aria-controls="app-sidebar"
      aria-label={open ? "Navigation schließen" : "Navigation öffnen"}
      onClick={() => setOpen(!open)}
    >
      <Menu className="h-[18px] w-[18px]" strokeWidth={1.85} />
    </button>
  );
}
