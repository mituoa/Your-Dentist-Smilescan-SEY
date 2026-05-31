"use client";

import Link from "next/link";
import Image from "next/image";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YourDentistWordmarkStack } from "@/components/brand/your-dentist-wordmark-stack";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  compact?: boolean;
}

/**
 * Sidebar: Medical-Blue-Mark + „Your Dentist“ (Fraunces / font-serif wie Lockup).
 */
export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex min-w-0 rounded-2xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.35)]",
        compact ? "min-h-10 gap-2 py-1" : "justify-center py-1 md:py-0"
      )}
      aria-label="Your Dentist — Startseite"
    >
      <span className="hidden flex-col items-center gap-2 md:flex">
        <Image
          src="/brand/your-dentist/logo-mark.svg"
          alt=""
          width={48}
          height={48}
          priority
          className="h-12 w-12 object-contain drop-shadow-[0_8px_20px_rgba(30,91,189,0.28)]"
          aria-hidden
        />
        <YourDentistWordmarkStack compact />
      </span>
      <span className="md:hidden">
        <YourDentistBrandLockup
          size={compact ? "sm" : "md"}
          tagline={compact ? null : "Neutral Practice Platform"}
          className="min-w-0"
          priority
        />
      </span>
    </Link>
  );
}
