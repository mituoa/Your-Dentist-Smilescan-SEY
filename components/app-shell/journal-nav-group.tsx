"use client";

import { NavItem } from "./nav-item";

/** Ein Eintrag wie im Figma-Sidebar; Tabs liegen auf der Journal-Seite. */
export function JournalNavGroup() {
  return <NavItem href="/journal" iconName="journal" label="Journals" description="Erklärungen" />;
}
