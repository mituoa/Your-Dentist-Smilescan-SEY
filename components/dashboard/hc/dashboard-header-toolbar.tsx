"use client";

import Image from "next/image";
import { Search } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";

type DashboardHeaderToolbarProps = {
  photoUrl?: string | null;
  initials: string;
};

/** Minimal search + profile — opens Command AI, no duplicate chrome. */
export function DashboardHeaderToolbar({ photoUrl, initials }: DashboardHeaderToolbarProps) {
  const assist = useAssistUiOptional();

  return (
    <div className="yd-cockpit-header__actions">
      <button
        type="button"
        className="yd-cockpit-header__search"
        onClick={() => assist?.openCommand()}
        aria-label="Suchen und vorbereiten"
      >
        <Search className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="yd-cockpit-header__search-text">Suchen</span>
      </button>
      <div className="yd-cockpit-header__profile" aria-hidden={false}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            width={40}
            height={40}
            className="yd-cockpit-header__avatar-img"
          />
        ) : (
          <span className="yd-cockpit-header__avatar-fallback">{initials || "YD"}</span>
        )}
      </div>
    </div>
  );
}
