"use client";

import { cn } from "@/lib/utils";
import type { RelayPulseCard, RelayPulseId } from "@/lib/relay/relay-pulse-model";
import type { RelayBereich } from "@/lib/relay/relay-bereich-model";

type Props = {
  cards: RelayPulseCard[];
  activeBereich: RelayBereich;
  onNavigate: (card: RelayPulseCard) => void;
};

const PULSE_TO_BEREICH: Record<RelayPulseId, RelayBereich> = {
  freigaben: "journal",
  patienten: "patienten",
  team: "team",
  journal: "journal",
};

function isCardActive(card: RelayPulseCard, activeBereich: RelayBereich): boolean {
  if (card.id === "freigaben") {
    return activeBereich === "journal" || activeBereich === "aufgaben";
  }
  return PULSE_TO_BEREICH[card.id] === activeBereich;
}

export function RelayStatusPulse({ cards, activeBereich, onNavigate }: Props) {
  return (
    <section className="relay-pulse" aria-label="Praxis-Überblick">
      <div className="relay-pulse__grid">
        {cards.map((card) => {
          const active = isCardActive(card, activeBereich);
          const hasWork = card.count > 0;

          return (
            <button
              key={card.id}
              type="button"
              className={cn(
                "relay-pulse__card",
                active && "relay-pulse__card--active",
                hasWork && "relay-pulse__card--has-work"
              )}
              onClick={() => onNavigate(card)}
              aria-current={active ? "true" : undefined}
            >
              <span className="relay-pulse__label">{card.label}</span>
              <span className="relay-pulse__count" aria-label={`${card.count} ${card.label}`}>
                {card.count}
              </span>
              <span className="relay-pulse__hint">{card.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
