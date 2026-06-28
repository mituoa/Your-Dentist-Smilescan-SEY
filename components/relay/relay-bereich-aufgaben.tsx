"use client";

import Link from "next/link";

import type { RelayAufgabeItem } from "@/lib/relay/relay-bereich-model";
import type { RelayPulseCard } from "@/lib/relay/relay-pulse-model";
import { cn } from "@/lib/utils";

import { RelayV2EmptyState } from "./relay-side-nav";

type Props = {
  items: RelayAufgabeItem[];
  pulseCards?: RelayPulseCard[];
};

export function RelayBereichAufgaben({ items, pulseCards }: Props) {
  if (items.length === 0) {
    const freigaben = pulseCards?.find((c) => c.id === "freigaben");
    const hint =
      freigaben && freigaben.count > 0
        ? `${freigaben.count} Entscheidung${freigaben.count === 1 ? "" : "en"} warten unter Freigaben oder Journal.`
        : "Neue Aufgaben erscheinen hier, sobald sie an Sie gerichtet sind.";

    return <RelayV2EmptyState hint={hint} />;
  }

  return (
    <ul className="relay-mod-aufgaben">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={cn("relay-mod-aufgaben__row", item.done && "relay-mod-aufgaben__row--done")}
          >
            <span className="relay-mod-aufgaben__check" aria-hidden />
            <div className="relay-mod-aufgaben__body">
              <span className="relay-mod-aufgaben__kind">{item.kind}</span>
              <h3 className="relay-mod-aufgaben__title">{item.title}</h3>
              <div className="relay-mod-aufgaben__meta">
                {item.timing ? <span>{item.timing}</span> : null}
                {item.dateLabel ? <span>{item.dateLabel}</span> : null}
              </div>
            </div>
            <span className="relay-mod-aufgaben__cta">Öffnen →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
