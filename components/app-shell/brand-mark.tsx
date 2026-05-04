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
        compact ? "h-10 gap-2" : "border-b px-6"
      )}
      style={
        compact
          ? undefined
          : {
              borderColor: "#EEF2F6",
              height: "80px",
            }
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="256"
        height="256"
        viewBox="0 0 256 256"
        fill="none"
        className={cn(compact ? "h-7 w-7" : "h-11 w-11")}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={compact ? "logo-yd-compact" : "logo-yd"}
            x1="50"
            y1="42"
            x2="210"
            y2="214"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E3F2FD" />
          </linearGradient>
        </defs>
        <rect
          x="42"
          y="42"
          width="172"
          height="172"
          rx="48"
          fill={`url(#${compact ? "logo-yd-compact" : "logo-yd"})`}
        />
        <rect
          x="42.75"
          y="42.75"
          width="170.5"
          height="170.5"
          rx="47.25"
          stroke="#2F80ED"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <path
          d="M92 90C103 81.333 115 77 128 77C141 77 153 81.333 164 90"
          stroke="#2F80ED"
          strokeOpacity="0.34"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M99 103L128 131L157 103"
          stroke="#2F80ED"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M128 130V157"
          stroke="#2F80ED"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M96 171C106.333 181 117 186 128 186C139 186 149.667 181 160 171"
          stroke="#2F80ED"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>

      {compact ? null : (
        <div className="ml-3">
          <div className="text-[19px] font-medium tracking-tight leading-none text-gray-900">
            <span className="font-light italic">Your</span> Dentist
          </div>
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#2F80ED]">
            Neutral Practice Platform
          </div>
        </div>
      )}
    </Link>
  );
}
