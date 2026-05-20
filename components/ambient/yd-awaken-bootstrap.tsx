"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  YD_AWAKEN_SESSION_KEY,
  YD_ENTER_QUERY,
} from "@/lib/design/yd-workspace-awakening";

/** Sets session flag after auth redirect, then strips query param. */
export function YdAwakenBootstrap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get(YD_ENTER_QUERY) !== "1") return;

    try {
      sessionStorage.setItem(YD_AWAKEN_SESSION_KEY, "1");
    } catch {
      /* private mode */
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete(YD_ENTER_QUERY);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
