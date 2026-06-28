"use client";

import { JournalKnowledgeCenter } from "@/components/journal/journal-knowledge-center";
import type { JournalEntry } from "@/lib/types/journal-entry";

/** @deprecated Legacy export — use JournalKnowledgeCenter */
export type JournalsContentTab = "create" | "published" | "drafts";

interface JournalsWorkspaceViewProps {
  initialEntries: JournalEntry[];
  authorLabel?: string;
  publicSlug?: string | null;
}

export function JournalsWorkspaceView({
  initialEntries,
  authorLabel = "Dr.",
  publicSlug = null,
}: JournalsWorkspaceViewProps) {
  return (
    <JournalKnowledgeCenter
      initialEntries={initialEntries}
      authorLabel={authorLabel}
      publicSlug={publicSlug}
    />
  );
}
