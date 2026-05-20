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

/** Backdrop + slide-over frame; desktop: static pass-through for the sidebar rail. */
export function MobileSidebarFrame({ children }: { children: ReactNode }) {
  const { open, close } = useMobileNav();

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-[25] border-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label="Menü schließen"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex max-md:h-[100dvh] max-md:w-[min(88vw,320px)] max-md:max-w-[320px] max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)]",
          "max-md:transition-transform max-md:duration-200 max-md:ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:static md:z-20 md:flex md:h-full md:w-[108px] md:max-w-[108px] md:shrink-0 md:items-center md:justify-center md:py-2 md:pl-2 md:translate-x-0"
        )}
      >
        {children}
      </div>
    </>
  );
}

export function MobileMenuButton() {
  const { open, setOpen } = useMobileNav();

  return (
    <button
      type="button"
      className="inline-flex h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-[#E2E8F0] bg-white/90 text-[#1E293B] shadow-sm md:hidden"
      aria-expanded={open}
      aria-controls="app-sidebar"
      aria-label={open ? "Menü schließen" : "Menü öffnen"}
      onClick={() => setOpen(!open)}
    >
      <Menu className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}
