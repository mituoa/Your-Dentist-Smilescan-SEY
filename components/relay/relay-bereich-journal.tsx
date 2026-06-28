"use client";

import Link from "next/link";

import type { RelayJournalItem } from "@/lib/relay/relay-bereich-model";

import { RelayV2EmptyState } from "./relay-side-nav";

type Props = {
  items: RelayJournalItem[];
};

export function RelayBereichJournal({ items }: Props) {
  if (items.length === 0) {
    return <RelayV2EmptyState title="Keine Journal-Freigaben" hint="Neue Entwürfe erscheinen hier zur ärztlichen Freigabe." />;
  }

  return (
    <ul className="relay-mod-journal">
      {items.map((item) => (
        <li key={item.id}>
          <article className="relay-mod-journal__card">
            <div className="relay-mod-journal__head">
              <span className="relay-mod-journal__category">{item.category}</span>
              <span className="relay-mod-journal__date">{item.dateLabel}</span>
            </div>
            <h3 className="relay-mod-journal__title">{item.title}</h3>
            {item.excerpt ? (
              <p className="relay-mod-journal__excerpt">{item.excerpt}</p>
            ) : null}
            <div className="relay-mod-journal__foot">
              <span className="relay-mod-journal__author">{item.author}</span>
              <span className="relay-mod-journal__waiting">{item.waitingLabel}</span>
              <Link href={item.href} className="relay-mod-journal__action">
                Freigeben →
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
