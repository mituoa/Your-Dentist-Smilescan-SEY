"use client";

import { NavItem } from "./nav-item";
import type { YdNavAmbientPreview } from "@/lib/ambient/nav-preview-types";

export function JournalNavGroup({
  ambientPreview,
}: {
  ambientPreview?: YdNavAmbientPreview;
}) {
  return (
    <NavItem
      href="/journal"
      iconName="journal"
      label="Journals"
      description="Erklärungen"
      ambientPreview={ambientPreview}
    />
  );
}
