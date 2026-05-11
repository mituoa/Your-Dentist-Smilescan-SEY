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
        "flex min-w-0 items-center",
        compact ? "min-h-10 gap-2" : "h-20 border-b px-6"
      )}
      style={
        compact
          ? undefined
          : {
              borderColor: "#EEF2F6",
            }
      }
    >
      <YourDentistBrandLockup
        size={compact ? "sm" : "md"}
        tagline={compact ? null : "Neutral Practice Platform"}
        className="min-w-0"
      />
    </Link>
  );
}
