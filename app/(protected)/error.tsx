"use client";

import { useEffect } from "react";
import Link from "next/link";

type ProtectedErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Ruhige Fehlerseite für geschützte Bereiche (Inbox, Dashboard, …). */
export default function ProtectedError({ error, reset }: ProtectedErrorProps) {
  useEffect(() => {
    console.error("[protected]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[min(60dvh,480px)] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold tracking-tight text-[#0c1929]">
        Diese Ansicht konnte nicht geladen werden
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#5e7389]">
        Bitte Seite neu laden. Wenn das Problem bleibt, melden Sie sich erneut an oder wechseln Sie
        kurz zu einer anderen Ansicht.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-[rgba(180,198,218,0.55)] bg-white px-4 py-2 text-sm font-medium text-[#0c1929] shadow-sm hover:bg-[#f8fbfe]"
        >
          Erneut versuchen
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#1a4f9c] hover:underline"
        >
          Zum Atlas
        </Link>
      </div>
    </div>
  );
}
