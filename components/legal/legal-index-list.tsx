import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { LegalHubEntry } from "@/lib/legal/types";

type LegalIndexListProps = {
  entries: LegalHubEntry[];
};

export function LegalIndexList({ entries }: LegalIndexListProps) {
  return (
    <ul className="yd-legal-index">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={entry.href} className="yd-legal-index-row">
            <span className="yd-legal-index-row__text">
              <span className="yd-legal-index-row__label">{entry.label}</span>
              <span className="yd-legal-index-row__desc">{entry.description}</span>
            </span>
            <ChevronRight className="yd-legal-index-row__icon" strokeWidth={1.75} aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
