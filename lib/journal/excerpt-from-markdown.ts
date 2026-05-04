import { JOURNAL_LIMITS } from "@/lib/validation/journal-limits";

/** Kurzer Klartext-Auszug für `excerpt` (ohne Markdown-Syntax). */
export function excerptFromMarkdown(md: string): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>`\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, JOURNAL_LIMITS.excerpt);
}
