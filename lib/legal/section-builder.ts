import type { LegalSection } from "@/lib/legal/types";

export function section(id: string, title: string, paragraphs: string[]): LegalSection {
  return { id, title, paragraphs };
}
