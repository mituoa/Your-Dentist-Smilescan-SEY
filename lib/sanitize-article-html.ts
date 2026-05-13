import "server-only";

/**
 * Lightweight server-side HTML sanitizer for doctor-authored article content.
 * Strips dangerous elements (script, iframe, object, embed, form, base) and
 * event handlers from parsed markdown HTML.
 *
 * This is defense-in-depth for content authored by authenticated doctors
 * through the Tiptap editor — NOT a general-purpose sanitizer for untrusted
 * user-generated content. If external/arbitrary content is ever rendered,
 * replace this with a proper DOM-based sanitizer (e.g. DOMPurify/JSDOM).
 */
export function sanitizeArticleHtml(html: string): string {
  return (
    html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^>]*\/?>/gi, "")
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
      .replace(/<base\b[^>]*\/?>/gi, "")
      // Strip event handlers (onclick, onerror, onload, etc.)
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // Neutralize javascript: protocol in href/src attributes
      .replace(
        /(href|src|action)\s*=\s*["']\s*javascript\s*:/gi,
        '$1="about:blank'
      )
  );
}
