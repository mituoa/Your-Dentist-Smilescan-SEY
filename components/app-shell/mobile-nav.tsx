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
        document.documentElement.removeAttribute("data-mobile-nav-open");
        setOpen(false);
        return;
      }
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) {
        document.documentElement.setAttribute("data-mobile-nav-open", "");
      } else {
        document.documentElement.removeAttribute("data-mobile-nav-open");
      }
    };
    syncScrollLock();
    mq.addEventListener("change", syncScrollLock);
    return () => {
      mq.removeEventListener("change", syncScrollLock);
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute("data-mobile-nav-open");
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

/** Premium iOS drawer on mobile; ambient rail on desktop. */
export function MobileSidebarFrame({ children }: { children: ReactNode }) {
  const { open, close } = useMobileNav();

  return (
    <>
      <button
        type="button"
        className={cn(
          "yd-mobile-nav-backdrop fixed z-[34] border-0 md:hidden",
          "transition-[opacity,backdrop-filter] duration-[420ms] ease-[cubic-bezier(0.25,1,0.35,1)]",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label="Navigation schließen"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <div
        className={cn(
          "yd-mobile-nav-root md:static md:z-20 md:flex md:h-full md:w-[108px] md:max-w-[108px] md:shrink-0 md:items-center md:justify-center md:py-2 md:pl-2",
          "max-md:fixed max-md:z-[36] max-md:pointer-events-none",
          open && "yd-mobile-nav-root--open max-md:pointer-events-auto"
        )}
        style={
          {
            ["--yd-mobile-nav-open" as string]: open ? "1" : "0",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "yd-mobile-nav-panel relative flex min-h-0 flex-col overflow-hidden",
            "max-md:transition-[transform,opacity,box-shadow] max-md:duration-[460ms] max-md:ease-[cubic-bezier(0.25,1,0.35,1)]",
            open
              ? "max-md:translate-x-0 max-md:opacity-100"
              : "max-md:pointer-events-none max-md:-translate-x-[108%] max-md:opacity-0",
            "md:h-full md:w-full md:translate-x-0 md:opacity-100"
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
