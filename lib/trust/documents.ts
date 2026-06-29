import "server-only";

import { loadTrustMarkdown } from "@/lib/trust/markdown";
import {
  isTrustSlug,
  TRUST_DOC_META,
  TRUST_SLUGS,
  type TrustSlug,
} from "@/lib/trust/navigation";
import type { TrustDocument } from "@/lib/trust/types";

let documentCache: Map<TrustSlug, TrustDocument> | null = null;

function getDocumentCache(): Map<TrustSlug, TrustDocument> {
  if (!documentCache) {
    documentCache = new Map(
      TRUST_DOC_META.map((config) => {
        const doc = loadTrustMarkdown(config.fileName);
        return [
          config.slug,
          {
            ...doc,
            slug: config.slug,
            description: config.description,
          },
        ];
      })
    );
  }
  return documentCache;
}

export function getTrustDocument(slug: TrustSlug): TrustDocument {
  const doc = getDocumentCache().get(slug);
  if (!doc) throw new Error(`Trust document not found: ${slug}`);
  return doc;
}

export { isTrustSlug, TRUST_SLUGS };
