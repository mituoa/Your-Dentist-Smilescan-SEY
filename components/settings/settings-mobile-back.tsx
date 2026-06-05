"use client";

import { ChevronLeft } from "lucide-react";

type SettingsMobileBackProps = {
  onBack: () => void;
};

/** Mobil: zurück zur Einstellungs-Navigation. */
export function SettingsMobileBack({ onBack }: SettingsMobileBackProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="yd-settings-mobile-back md:hidden"
    >
      <ChevronLeft className="yd-settings-mobile-back__icon" strokeWidth={2} aria-hidden />
      Zurück
    </button>
  );
}
