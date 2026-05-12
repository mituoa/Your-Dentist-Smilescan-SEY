"use client";

import { Check, Info } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CaseCreatedToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const angelegt = searchParams.get("angelegt") === "1";
  const anlagenTeilweise = searchParams.get("anlagen_teilweise") === "1";
  const searchKey = searchParams.toString();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!angelegt) {
      queueMicrotask(() => {
        setDismissed(false);
      });
      return;
    }
    const dismissMs = anlagenTeilweise ? 5200 : 4200;
    const t = window.setTimeout(() => {
      setDismissed(true);
      const next = new URLSearchParams(searchKey);
      next.delete("angelegt");
      next.delete("anlagen_teilweise");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }, dismissMs);
    return () => window.clearTimeout(t);
  }, [angelegt, anlagenTeilweise, pathname, router, searchKey]);

  if (!angelegt || dismissed) return null;

  if (anlagenTeilweise) {
    return (
      <div
        className="pointer-events-none fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[60] w-[min(100%-2rem,420px)] -translate-x-1/2 px-4"
        role="status"
        aria-live="polite"
      >
        <div className="case-created-toast-panel pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.1),0_4px_12px_rgba(15,23,42,0.05)] backdrop-blur-md">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            aria-hidden
          >
            <Info className="h-4 w-4" strokeWidth={2} />
          </span>
          <p
            className="pt-0.5 text-[14px] font-medium leading-snug text-[#0F172A]"
          >
            Fall wurde gespeichert. Einzelne Bilder konnten nicht übernommen werden.
          </p>
        </div>
      </div>
    );
  }

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
