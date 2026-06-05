"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { inboxSearchQueryFromParam } from "@/lib/inbox-search-q";

/** Mobil: zurück zur Einsendungsliste; erhält gültiges `q` wie die Suche (getrimmt). */
export function InboxMobileBack({ fallbackHref = "/inbox" }: { fallbackHref?: string }) {
  const searchParams = useSearchParams();
  const qEffective = inboxSearchQueryFromParam(searchParams.get("q") ?? undefined);
  const href = qEffective
    ? `${fallbackHref}?q=${encodeURIComponent(qEffective)}`
    : fallbackHref;

  return (
    <Link
      href={href}
      className="yd-tracker-mobile-back mb-0 inline-flex min-h-[44px] min-w-0 max-w-full items-center gap-0.5 py-1 text-[15px] font-semibold touch-manipulation md:hidden"
    >
      <ChevronLeft className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
      Zurück zur Liste
    </Link>
  );
}
