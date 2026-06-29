"use client";

import type { TrustTocItem } from "@/lib/trust/types";
import { cn } from "@/lib/utils";

type TrustTocProps = {
  items: TrustTocItem[];
  activeId?: string | null;
};

export function TrustToc({ items }: TrustTocProps) {
  if (items.length === 0) return null;

  return (
    <nav className="yd-trust-toc" aria-label="Inhaltsverzeichnis">
      <p className="yd-trust-toc__title">Auf dieser Seite</p>
      <ol className="yd-trust-toc__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "yd-trust-toc__item",
              item.level === 3 && "yd-trust-toc__item--nested"
            )}
          >
            <a href={`#${item.id}`} className="yd-trust-toc__link">
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
