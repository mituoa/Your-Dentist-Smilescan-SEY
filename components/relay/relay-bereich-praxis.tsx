"use client";

import Link from "next/link";

import type { RelayPraxisItem } from "@/lib/relay/relay-bereich-model";

import { RelayV2EmptyState } from "./relay-side-nav";

type Props = {
  items: RelayPraxisItem[];
};

export function RelayBereichPraxis({ items }: Props) {
  if (items.length === 0) {
    return <RelayV2EmptyState title="Keine Praxisaufgaben" hint="Teamaufgaben, Routinen und Übergaben erscheinen hier." />;
  }

  return (
    <ul className="relay-mod-praxis">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="relay-mod-praxis__row">
            <div className="relay-mod-praxis__body">
              <span className="relay-mod-praxis__category">{item.category}</span>
              <h3 className="relay-mod-praxis__title">{item.title}</h3>
              <div className="relay-mod-praxis__meta">
                {item.group ? <span>{item.group}</span> : null}
                {item.timing ? <span>{item.timing}</span> : null}
              </div>
            </div>
            <span className="relay-mod-praxis__cta">Öffnen →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
