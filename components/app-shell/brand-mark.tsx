"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center",
        compact
          ? "h-10 gap-2"
          : "h-24 border-b border-white/45 px-6"
      )}
    >
      {compact ? (
        <img
          src="/brand/your-dentist/logo-mark.svg"
          alt="Your Dentist mark"
          className="h-7 w-7 object-contain"
        />
      ) : (
        <img
          src="/brand/your-dentist/logo-horizontal.svg"
          alt="Your Dentist"
          className="h-14 w-full object-left object-contain"
          style={{ clipPath: "inset(0 34% 0 0)" }}
        />
      )}
    </Link>
  );
}
