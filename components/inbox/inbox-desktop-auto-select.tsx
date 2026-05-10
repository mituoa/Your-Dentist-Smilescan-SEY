"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MD_MIN = "(min-width: 768px)";

/**
 * Preserves split-inbox on desktop (auto-open first case) without forcing mobile into a detail route.
 */
export function InboxDesktopAutoSelect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia(MD_MIN);
    const go = () => {
      if (mq.matches) {
        router.replace(href);
      }
    };
    go();
    mq.addEventListener("change", go);
    return () => mq.removeEventListener("change", go);
  }, [href, router]);

  return null;
}
