"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MD_MIN = "(min-width: 768px)";

/**
 * **Zweck (nur Desktop, md+):** Split-Posteingang mit sofort sichtbarem Fall — ersetzt `/inbox` durch
 * `/inbox/[id]` (erste Zeile der Liste), optional mit `q`. Mobil unverändert auf der Liste (`/inbox`).
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
