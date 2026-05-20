"use client";

import Link from "next/link";

import { HC } from "@/lib/design/healthcare-dashboard-tokens";

type HcSidebarProfileProps = {
  avatarUrl?: string | null;
  displayName?: string | null;
  email: string;
};

export function HcSidebarProfile({
  avatarUrl,
  displayName,
  email,
}: HcSidebarProfileProps) {
  const fallbackBase = (displayName || email).trim();
  const initials = fallbackBase
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <Link
      href="/profile/editor"
      title={displayName || email}
      className="flex touch-manipulation justify-center rounded-full transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(46,91,255,0.35)]"
    >
      <span
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/90"
        style={{
          boxShadow: "0 6px 18px rgba(47, 128, 237, 0.18)",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-[12px] font-semibold"
            style={{ background: HC.primarySoft, color: HC.primaryDark }}
          >
            {initials}
          </span>
        )}
      </span>
    </Link>
  );
}
