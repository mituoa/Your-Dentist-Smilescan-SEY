"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex min-w-0 items-center rounded-lg transition-colors hover:bg-[rgba(15,23,42,0.03)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.1)]",
        compact ? "min-h-10 gap-2 py-1" : "py-4 md:py-5"
      )}
    >
      <YourDentistBrandLockup
        size={compact ? "sm" : "md"}
        tagline={compact ? null : "Neutral Practice Platform"}
        className="min-w-0"
      />
    </Link>
  );
}
