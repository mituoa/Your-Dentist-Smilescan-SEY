"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function InboxMobileBack({ fallbackHref = "/inbox" }: { fallbackHref?: string }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const href = q ? `${fallbackHref}?q=${encodeURIComponent(q)}` : fallbackHref;

  return (
    <Link
      href={href}
      className="mb-1 inline-flex min-h-[44px] items-center gap-0.5 py-1 text-[15px] font-semibold text-[#2563EB] touch-manipulation md:hidden"
    >
      <ChevronLeft className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
      Einsendungen
    </Link>
  );
}
