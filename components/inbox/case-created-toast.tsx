"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CaseCreatedToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const angelegt = searchParams.get("angelegt") === "1";
  const searchKey = searchParams.toString();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!angelegt) {
      setDismissed(false);
      return;
    }
    const t = window.setTimeout(() => {
      setDismissed(true);
      const next = new URLSearchParams(searchKey);
      next.delete("angelegt");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }, 4200);
    return () => window.clearTimeout(t);
  }, [angelegt, pathname, router, searchKey]);

  if (!angelegt || dismissed) return null;

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[60] w-[min(100%-2rem,400px)] -translate-x-1/2 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="case-created-toast-panel pointer-events-auto flex items-center gap-3 rounded-xl border border-emerald-100/80 bg-white/95 px-4 py-3 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}
          aria-hidden
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <p className="text-[14px] font-medium leading-snug" style={{ color: "#0F172A" }}>
          Fall erfolgreich erstellt.
        </p>
      </div>
    </div>
  );
}

export function CaseCreatedToast() {
  return (
    <Suspense fallback={null}>
      <CaseCreatedToastInner />
    </Suspense>
  );
}
