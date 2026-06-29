import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { marked } from "marked";

import type { TrustDocument, TrustTocItem } from "@/lib/trust/types";

const CONTENT_DIR = path.join(process.cwd(), "legal-content");

const DRAFT_PATTERN = /^>\s*\*\*Entwurf[^*]*\*\*\s*$/m;

export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || "Dokument";
}

function extractDraftNotice(markdown: string): string | null {
  const match = markdown.match(DRAFT_PATTERN);
  if (!match) return null;
  return match[0].replace(/^>\s*/, "").replace(/\*\*/g, "").trim();
}

function stripTitleAndDraft(markdown: string): string {
  return markdown
    .replace(/^#\s+.+\n+/, "")
    .replace(DRAFT_PATTERN, "")
    .trimStart();
}

function buildToc(markdown: string): TrustTocItem[] {
  const items: TrustTocItem[] = [];
  const seen = new Map<string, number>();

  for (const line of markdown.split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    const raw = h2?.[1] ?? h3?.[1];
    if (!raw) continue;

    const base = slugifyHeading(raw);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const id = count > 1 ? `${base}-${count}` : base;

    items.push({
      id,
      title: raw.trim(),
      level: h2 ? 2 : 3,
    });
  }

  return items;
}

function renderMarkdownHtml(markdown: string, toc: TrustTocItem[]): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  let index = 0;
  return rawHtml.replace(/<h([23])>([^<]+)<\/h\1>/g, (match, level: string, text: string) => {
    const item = toc[index++];
    if (!item) return match;
    return `<h${level} id="${item.id}" class="yd-trust-h${level}">${text}</h${level}>`;
  }).replace(/<p>/g, '<p class="yd-trust-p">')
    .replace(/<ul>/g, '<ul class="yd-trust-list">')
    .replace(/<ol>/g, '<ol class="yd-trust-list yd-trust-list--ordered">')
    .replace(/<li>/g, '<li class="yd-trust-li">')
    .replace(/<blockquote>/g, '<blockquote class="yd-trust-blockquote">');
}

export function loadTrustMarkdown(fileName: string): TrustDocument {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = readFileSync(filePath, "utf8");
  const title = extractTitle(raw);
  const draftNotice = extractDraftNotice(raw);
  const bodyMarkdown = stripTitleAndDraft(raw);
  const toc = buildToc(bodyMarkdown);
  const html = renderMarkdownHtml(bodyMarkdown, toc);

  return {
    slug: "",
    fileName,
    title,
    draftNotice,
    description: "",
    markdown: raw,
    html,
    toc,
  };
}
