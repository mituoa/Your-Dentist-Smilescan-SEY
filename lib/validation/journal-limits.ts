export const JOURNAL_LIMITS = {
  title: 120,
  excerpt: 240,
  content_markdown: 50000,
  slug: 80,
} as const;

export function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
