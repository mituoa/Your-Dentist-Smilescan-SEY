"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useMobileBrowserChromeInset } from "@/lib/hooks/use-mobile-browser-chrome-inset";

type ScrollOwner = "main" | "module";

function resolveScrollOwner(pathname: string): ScrollOwner {
  if (pathname.startsWith("/inbox")) return "module";
  if (pathname.startsWith("/relay")) return "module";
  if (pathname.startsWith("/settings")) return "module";
  return "main";
}

/**
 * Mobile scroll contract: one primary scroller per route.
 * Syncs Safari bottom chrome inset and exposes owner via data attribute for CSS.
 */
export function MobileScrollFoundation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  useMobileBrowserChromeInset(true);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ydScrollOwner = resolveScrollOwner(pathname);
    return () => {
      delete root.dataset.ydScrollOwner;
    };
  }, [pathname]);

  return children;
}
