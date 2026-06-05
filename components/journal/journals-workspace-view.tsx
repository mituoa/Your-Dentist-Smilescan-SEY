"use client";

import { JournalKnowledgeCenter } from "@/components/journal/journal-knowledge-center";
import type { JournalEntry } from "@/lib/types/journal-entry";

/** @deprecated Legacy export — use JournalKnowledgeCenter */
export type JournalsContentTab = "create" | "published" | "drafts";

interface JournalsWorkspaceViewProps {
  initialEntries: JournalEntry[];
}

export function JournalsWorkspaceView({ initialEntries }: JournalsWorkspaceViewProps) {
  return <JournalKnowledgeCenter initialEntries={initialEntries} />;
}
