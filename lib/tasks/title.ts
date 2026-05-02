export function buildTaskSnippet(content: string, maxLength = 72): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "Ohne Titel";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function resolveTaskDisplayTitle(
  title: string | null | undefined,
  content: string
): string {
  const trimmedTitle = (title ?? "").trim();
  if (trimmedTitle.length > 0) return trimmedTitle;
  return buildTaskSnippet(content);
}
